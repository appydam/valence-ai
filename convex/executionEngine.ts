// @ts-nocheck
"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { decryptCredentials } from "./lib/crypto";
import { buildRequest, resolveJsonPath } from "./lib/requestBuilder";

/**
 * Jittered exponential backoff: base * 2^attempt + random jitter
 */
function backoffMs(attempt: number, baseMs = 1000): number {
  const exp = baseMs * Math.pow(2, attempt);
  const jitter = Math.random() * baseMs; // 0–1000ms random jitter
  return exp + jitter;
}

/**
 * Check if an HTTP status code is retryable
 */
function isRetryableStatus(status: number): boolean {
  return (
    status === 429 || // Rate limited
    status === 408 || // Request timeout
    status === 502 || // Bad gateway
    status === 503 || // Service unavailable
    status === 504    // Gateway timeout
  );
}

/**
 * Parse Retry-After header (seconds or HTTP date) into milliseconds to wait.
 * Returns null if header is not present or unparseable.
 */
function parseRetryAfter(response: Response): number | null {
  const header = response.headers.get("retry-after");
  if (!header) return null;

  // Try numeric seconds first
  const seconds = parseInt(header, 10);
  if (!isNaN(seconds)) return seconds * 1000;

  // Try HTTP date
  const date = new Date(header);
  if (!isNaN(date.getTime())) return Math.max(0, date.getTime() - Date.now());

  return null;
}

/**
 * Apply response mapping to extract/transform response data.
 *
 * Mapping config (JSON string):
 *   { "dataField": "data.items" }          — simple JSON path extraction
 *   { "dataField": "data", "errorField": "error.message" }  — with error extraction
 *   { "fields": { "id": "data.id", "name": "data.attributes.name" } } — field mapping
 */
function applyResponseMapping(responseData: any, mappingStr: string): any {
  if (!mappingStr) return responseData;

  try {
    const mapping = JSON.parse(mappingStr);

    // Field-by-field mapping: { fields: { outputKey: "json.path" } }
    if (mapping.fields && typeof mapping.fields === "object") {
      const result: Record<string, any> = {};
      for (const [outputKey, path] of Object.entries(mapping.fields)) {
        result[outputKey] = resolveJsonPath(responseData, path as string);
      }
      return result;
    }

    // Simple data field extraction: { dataField: "data.items" }
    if (mapping.dataField) {
      const extracted = resolveJsonPath(responseData, mapping.dataField);
      if (extracted !== undefined) return extracted;
    }

    return responseData;
  } catch {
    return responseData;
  }
}

/**
 * Execute an integration tool (makes real API calls)
 */
export const executeTool = action({
  args: {
    userId: v.string(),
    agentName: v.optional(v.string()),
    taskId: v.optional(v.string()),
    blueprintSlug: v.string(),
    toolName: v.string(),
    toolArgs: v.any(),
  },
  handler: async (ctx, args) => {
    const encKey = process.env.INTEGRATION_ENCRYPTION_KEY!;

    if (!encKey) {
      throw new Error("INTEGRATION_ENCRYPTION_KEY not configured");
    }

    try {
      // 1. Resolve blueprint
      const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
        slug: args.blueprintSlug,
      });

      if (!blueprint || blueprint.status !== "active") {
        throw new Error(`Blueprint "${args.blueprintSlug}" not found or not active`);
      }

      // 2. Resolve tool definition
      const tool = await ctx.runQuery(api.blueprintTools.getByName, {
        blueprintId: blueprint._id,
        name: args.toolName,
      });

      if (!tool || tool.status !== "active") {
        throw new Error(`Tool "${args.toolName}" not found or not active`);
      }

      // 3. Resolve connection
      const connection = await ctx.runQuery(api.connections.getForExecution, {
        blueprintId: blueprint._id,
        userId: args.userId,
      });

      if (!connection || connection.status === "disconnected") {
        throw new Error(
          `No active connection for "${args.blueprintSlug}". Please connect first.`
        );
      }

      // 4. Decrypt credentials
      let credentials = decryptCredentials(connection.credentialsEncrypted, encKey);

      // 5. Auto-refresh OAuth token if expiring soon (within 5 minutes)
      if (
        blueprint.authType === "oauth2" &&
        credentials.expiresAt &&
        Date.now() > credentials.expiresAt - 300000
      ) {
        try {
          await ctx.runAction(api.connectionActions.refreshToken, {
            connectionId: connection._id,
          });

          // Re-read the updated credentials
          const refreshedConn = await ctx.runQuery(
            api.connections.getForExecution,
            {
              blueprintId: blueprint._id,
              userId: args.userId,
            }
          );

          if (refreshedConn) {
            credentials = decryptCredentials(refreshedConn.credentialsEncrypted, encKey);
          }
        } catch (refreshError) {
          console.warn("Token refresh failed, attempting with existing token");
        }
      }

      // 6. Pre-process toolArgs for special cases
      let processedToolArgs = args.toolArgs || {};

      // Gmail create_draft: accept {to, subject, body} and convert to RFC 2822 base64url
      if (args.blueprintSlug === "gmail" && args.toolName === "create_draft") {
        const { to, subject, body: emailBody, ...rest } = processedToolArgs;
        if (to !== undefined || subject !== undefined || emailBody !== undefined) {
          // Encode subject as RFC 2047 UTF-8 to handle special chars (em dashes, etc.)
          const subjectUtf8 = `=?UTF-8?B?${Buffer.from(subject || "").toString("base64")}?=`;
          const rfc2822 = [
            `To: ${to || ""}`,
            `Subject: ${subjectUtf8}`,
            `MIME-Version: 1.0`,
            `Content-Type: text/plain; charset=UTF-8`,
            ``,
            emailBody || "",
          ].join("\r\n");
          const base64url = Buffer.from(rfc2822)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");
          processedToolArgs = { ...rest, message: { raw: base64url } };
        }
      }

      // Build HTTP request
      const { url, headers, body } = buildRequest({
        blueprint,
        tool,
        credentials,
        toolArgs: processedToolArgs,
      });

      // Debug logging for HubSpot auth
      console.log(`[ExecutionEngine] ${args.blueprintSlug}/${args.toolName}:`, {
        url,
        authHeader: headers.Authorization?.substring(0, 50) + "...",
        credentialsKeys: Object.keys(credentials),
        authType: blueprint.authType,
      });

      // 7. Execute with retry logic (improved: jitter, 429, Retry-After)
      const timeout = tool.timeoutMs || 30000;
      const maxRetries = tool.retryCount ?? 2;
      let lastError: Error | null = null;
      let response: Response | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          // Serialize body based on content-type
          let serializedBody: string | undefined;
          if (body !== null && body !== undefined) {
            const ct = headers["Content-Type"] || "";
            if (ct.includes("application/x-www-form-urlencoded")) {
              serializedBody = new URLSearchParams(body).toString();
            } else {
              serializedBody = JSON.stringify(body);
            }
          }

          try {
            response = await fetch(url, {
              method: tool.method,
              headers,
              body: serializedBody,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          } catch (fetchError: any) {
            clearTimeout(timeoutId);
            // Check if it's an abort error (timeout)
            if (fetchError.name === 'AbortError') {
              throw new Error(`Request timeout after ${timeout}ms - the API took too long to respond`);
            }
            throw fetchError;
          }

          // If 401, try token refresh once (only on first attempt)
          if (
            response.status === 401 &&
            blueprint.authType === "oauth2" &&
            attempt === 0
          ) {
            try {
              await ctx.runAction(api.connectionActions.refreshToken, {
                connectionId: connection._id,
              });

              // Re-read credentials and rebuild headers
              const refreshedConn = await ctx.runQuery(
                api.connections.getForExecution,
                { blueprintId: blueprint._id, userId: args.userId }
              );
              if (refreshedConn) {
                credentials = decryptCredentials(refreshedConn.credentialsEncrypted, encKey);
                // Update auth header
                headers["Authorization"] = `${credentials.tokenType || "Bearer"} ${credentials.accessToken}`;
              }
              continue; // Retry with refreshed token
            } catch {
              // Refresh failed, return the 401 error
            }
          }

          // If retryable status, wait and retry
          if (isRetryableStatus(response.status) && attempt < maxRetries) {
            // Respect Retry-After header for 429s
            const retryAfter = parseRetryAfter(response);
            const waitMs = retryAfter ?? backoffMs(attempt);
            const cappedWait = Math.min(waitMs, 30000); // Cap at 30s

            console.log(
              `[ExecutionEngine] Retryable ${response.status}, waiting ${cappedWait}ms (attempt ${attempt + 1}/${maxRetries})`
            );
            await new Promise((r) => setTimeout(r, cappedWait));

            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            continue;
          }

          // Non-retryable status or success: break out
          break;
        } catch (e: any) {
          lastError = e;
          console.error(`[ExecutionEngine] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, e.message);

          // Don't retry non-idempotent methods on timeout — the request may have
          // already been processed by the server (e.g., Slack message sent, Notion page created)
          const isNonIdempotent = ["POST", "PUT", "PATCH"].includes(tool.method.toUpperCase());
          const isTimeout = e.message?.includes("Request timeout");
          if (isNonIdempotent && isTimeout) {
            console.warn(`[ExecutionEngine] Skipping retry for ${tool.method} ${url} — timeout on non-idempotent request`);
            break;
          }

          if (attempt < maxRetries) {
            const waitMs = backoffMs(attempt);
            console.log(`[ExecutionEngine] Retrying in ${waitMs}ms...`);
            await new Promise((r) => setTimeout(r, waitMs));
          }
        }
      }

      // 8. Check if request succeeded
      if (!response || !response.ok) {
        const errorBody = response ? await response.text().catch(() => "") : "";

        // Generate user-friendly error message
        let userError = "Connection failed";
        let details = "";

        if (!response) {
          // No response - likely timeout or network error
          userError = lastError?.message || "Request failed - no response received";
          details = lastError?.message || "Network error or timeout";
        } else if (response.status === 401) {
          userError = "Authentication failed";
          details = "Your API key or token may be invalid or expired. Try disconnecting and reconnecting.";
        } else if (response.status === 403) {
          userError = "Access forbidden";
          details = "You don't have permission to access this resource. Check your API key permissions.";
        } else if (response.status === 404) {
          userError = "Resource not found";
          details = errorBody?.substring(0, 500) || "The requested resource does not exist.";
        } else if (response.status === 501) {
          userError = "API not available";
          details = `The API returned 501 Not Implemented. This usually means the API is not enabled in your cloud project, or credentials (e.g. developer token) are missing or unapproved. ${errorBody?.substring(0, 300) || ""}`;
        } else if (response.status >= 500) {
          userError = "Server error";
          details = `The API server returned an error (${response.status}). ${errorBody?.substring(0, 300) || "Try again later."}`;
        } else {
          userError = `HTTP ${response.status}`;
          details = errorBody?.substring(0, 500) || response.statusText;
        }

        // Log failure
        await ctx.runMutation(api.integrationActivity.log, {
          userId: args.userId,
          agentName: args.agentName,
          taskId: args.taskId,
          integrationType: args.blueprintSlug,
          toolName: args.toolName,
          status: "error",
          errorMessage: `${userError}: ${details}`,
        });

        await ctx.runMutation(api.connections.markError, {
          id: connection._id,
          error: `${args.toolName} failed: ${userError}`,
        });

        return {
          success: false,
          error: userError,
          details: details,
        };
      }

      // 9. Parse response
      const contentType = response.headers.get("content-type") || "";
      let responseData: any;

      if (contentType.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
        // Return raw XML as string — callers can parse if needed
        responseData = await response.text();
      } else {
        responseData = await response.text();
      }

      // 10. Apply response mapping (improved: JSON path, field mapping)
      const mappedResult = applyResponseMapping(responseData, tool.responseMapping || "");

      // 11. Log success
      await ctx.runMutation(api.integrationActivity.log, {
        userId: args.userId,
        agentName: args.agentName,
        taskId: args.taskId,
        integrationType: args.blueprintSlug,
        toolName: args.toolName,
        status: "success",
      });

      await ctx.runMutation(api.connections.markSuccess, {
        id: connection._id,
      });

      return {
        success: true,
        result: mappedResult,
      };
    } catch (error: any) {
      // Log error
      await ctx.runMutation(api.integrationActivity.log, {
        userId: args.userId,
        agentName: args.agentName,
        taskId: args.taskId,
        integrationType: args.blueprintSlug,
        toolName: args.toolName,
        status: "error",
        errorMessage: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },
});

/**
 * Execute a tool with automatic pagination — fetches all pages and returns combined results.
 *
 * paginationConfig (on the tool):
 *   type: "cursor" | "offset" | "page"
 *   cursorParam: query/body param name for cursor (e.g. "after", "cursor")
 *   cursorField: JSON path in response to get next cursor (e.g. "pageInfo.endCursor")
 *   hasMoreField: JSON path to boolean "has more" (e.g. "pageInfo.hasNextPage")
 *   limitParam: query param for page size (e.g. "limit", "per_page")
 *   limitDefault: default page size (e.g. 50)
 *   dataField: JSON path to the array of items (e.g. "data", "nodes")
 *   maxPages: safety limit (default 10)
 */
export const executeToolPaginated = action({
  args: {
    userId: v.string(),
    agentName: v.optional(v.string()),
    taskId: v.optional(v.string()),
    blueprintSlug: v.string(),
    toolName: v.string(),
    toolArgs: v.any(),
    maxPages: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allItems: any[] = [];
    let cursor: string | null = null;
    let page = 0;

    // Get tool to read pagination config
    const blueprint = await ctx.runQuery(api.blueprints.getBySlug, {
      slug: args.blueprintSlug,
    });
    if (!blueprint) {
      return { success: false, error: `Blueprint "${args.blueprintSlug}" not found` };
    }

    const tool = await ctx.runQuery(api.blueprintTools.getByName, {
      blueprintId: blueprint._id,
      name: args.toolName,
    });
    if (!tool || !tool.paginationConfig) {
      // No pagination config — fall back to single execution
      return ctx.runAction(api.executionEngine.executeTool, {
        userId: args.userId,
        agentName: args.agentName,
        taskId: args.taskId,
        blueprintSlug: args.blueprintSlug,
        toolName: args.toolName,
        toolArgs: args.toolArgs,
      });
    }

    const pgConfig = JSON.parse(tool.paginationConfig);
    const maxPages = args.maxPages || pgConfig.maxPages || 10;

    while (page < maxPages) {
      // Build tool args with pagination params
      const paginatedArgs = { ...(args.toolArgs || {}) };

      if (pgConfig.limitParam) {
        paginatedArgs[pgConfig.limitParam] = pgConfig.limitDefault || 50;
      }

      if (cursor && pgConfig.cursorParam) {
        paginatedArgs[pgConfig.cursorParam] = cursor;
      } else if (pgConfig.type === "offset" && pgConfig.cursorParam) {
        paginatedArgs[pgConfig.cursorParam] = allItems.length;
      } else if (pgConfig.type === "page" && pgConfig.cursorParam) {
        paginatedArgs[pgConfig.cursorParam] = page + 1;
      }

      const result = await ctx.runAction(api.executionEngine.executeTool, {
        userId: args.userId,
        agentName: args.agentName,
        taskId: args.taskId,
        blueprintSlug: args.blueprintSlug,
        toolName: args.toolName,
        toolArgs: paginatedArgs,
      });

      if (!result.success) {
        return { success: false, error: result.error, partialResults: allItems };
      }

      // Extract items from response
      const items = pgConfig.dataField
        ? resolveJsonPath(result.result, pgConfig.dataField)
        : result.result;

      if (Array.isArray(items)) {
        allItems.push(...items);
      } else if (items) {
        allItems.push(items);
      }

      // Check for more pages
      if (pgConfig.hasMoreField) {
        const hasMore = resolveJsonPath(result.result, pgConfig.hasMoreField);
        if (!hasMore) break;
      }

      // Get next cursor
      if (pgConfig.type === "cursor" && pgConfig.cursorField) {
        const nextCursor = resolveJsonPath(result.result, pgConfig.cursorField);
        if (!nextCursor || nextCursor === cursor) break;
        cursor = nextCursor;
      } else if (pgConfig.type === "offset") {
        // Offset-based: stop if we got fewer items than the limit
        const limit = pgConfig.limitDefault || 50;
        if (!Array.isArray(items) || items.length < limit) break;
      } else if (pgConfig.type === "page") {
        // Page-based: stop if empty result
        if (!Array.isArray(items) || items.length === 0) break;
      }

      page++;
    }

    return {
      success: true,
      result: allItems,
      pagesFetched: page + 1,
      totalItems: allItems.length,
    };
  },
});

/**
 * List all available tools for a user (agent tool discovery)
 */
export const listAvailableTools = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // Get all active connections for this user
    const connections = await ctx.runQuery(api.connections.listByUser, {
      userId: args.userId,
    });

    const activeConnections = connections.filter((c) => c.status === "active");

    const tools: Array<{
      blueprintSlug: string;
      blueprintName: string;
      toolName: string;
      toolDisplayName: string;
      description: string;
      method: string;
      aiUsageHint: string;
      exampleArgs: any;
      params: {
        pathParams: any[];
        queryParams: any[];
        bodySchema: any;
      };
    }> = [];

    for (const conn of activeConnections) {
      const blueprint = await ctx.runQuery(api.blueprints.get, {
        id: conn.blueprintId,
      });

      if (!blueprint || blueprint.status !== "active") continue;

      const blueprintTools = await ctx.runQuery(api.blueprintTools.listByBlueprint, {
        blueprintId: blueprint._id,
      });

      for (const tool of blueprintTools) {
        tools.push({
          blueprintSlug: blueprint.slug,
          blueprintName: blueprint.name,
          toolName: tool.name,
          toolDisplayName: tool.displayName,
          description: tool.description,
          method: tool.method,
          aiUsageHint: tool.aiUsageHint || "",
          exampleArgs: tool.exampleArgs ? JSON.parse(tool.exampleArgs) : {},
          params: {
            pathParams: tool.pathParams ? JSON.parse(tool.pathParams) : [],
            queryParams: tool.queryParams ? JSON.parse(tool.queryParams) : [],
            bodySchema: tool.bodySchema ? JSON.parse(tool.bodySchema) : null,
          },
        });
      }
    }

    return {
      userId: args.userId,
      tools,
      count: tools.length,
    };
  },
});
