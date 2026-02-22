/**
 * HTTP request builder for integration tool execution
 *
 * Supports REST, GraphQL, form-encoded, and XML APIs.
 * All provider-specific logic is driven by blueprint/tool config — no hardcoded workarounds.
 */

interface BuildRequestArgs {
  blueprint: {
    baseUrl: string;
    authType: string;
    authConfig: string;
    defaultHeaders?: string;
    apiProtocol?: string; // "rest" | "graphql" | "soap" | "jsonrpc"
  };
  tool: {
    method: string;
    path: string;
    pathParams?: string;
    queryParams?: string;
    headerParams?: string;
    bodySchema?: string;
    requestContentType?: string;
  };
  credentials: Record<string, any>;
  toolArgs: Record<string, any>;
}

interface BuiltRequest {
  url: string;
  headers: Record<string, string>;
  body: any | null;
}

/**
 * Normalize params from either object format {"name": {"type": "string"}} or
 * array format [{"name": "owner", "type": "string"}] into a consistent array.
 */
function normalizeParams(
  raw: string | undefined
): Array<{
  name: string;
  type?: string;
  required?: boolean;
  default?: any;
  description?: string;
}> {
  if (!raw) return [];
  const parsed = JSON.parse(raw);

  // Already an array
  if (Array.isArray(parsed)) return parsed;

  // Object format: convert keys to array entries
  if (typeof parsed === "object" && parsed !== null) {
    return Object.entries(parsed).map(([name, config]: [string, any]) => ({
      name,
      ...(typeof config === "object" ? config : { type: config }),
    }));
  }

  return [];
}

/**
 * Resolve a JSON path expression like "data.items" or "results[0].id"
 * against a response object. Returns the value at that path, or undefined.
 */
export function resolveJsonPath(obj: any, path: string): any {
  if (!path || !obj) return obj;

  const segments = path
    .replace(/\[(\d+)\]/g, ".$1") // convert [0] to .0
    .split(".")
    .filter(Boolean);

  let current = obj;
  for (const seg of segments) {
    if (current == null) return undefined;
    current = current[seg];
  }
  return current;
}

/**
 * Build complete HTTP request from blueprint, tool, and arguments.
 *
 * Design principles:
 *  - All behaviour is config-driven (no provider-specific if/else)
 *  - Content-type defaults are sensible per protocol but overridable per tool
 *  - GraphQL, form-encoded, and JSON body types are all first-class
 */
export function buildRequest(args: BuildRequestArgs): BuiltRequest {
  const { blueprint, tool, credentials, toolArgs } = args;
  const protocol = blueprint.apiProtocol || "rest";

  // 1. Resolve path parameters
  let resolvedPath = tool.path;
  const pathParams = normalizeParams(tool.pathParams);

  for (const param of pathParams) {
    const value = toolArgs[param.name];

    if (param.required && (value === undefined || value === null)) {
      throw new Error(`Missing required path parameter: ${param.name}`);
    }

    if (value !== undefined && value !== null) {
      resolvedPath = resolvedPath.replace(
        `{${param.name}}`,
        encodeURIComponent(String(value))
      );
    }
  }

  // 2. Build query string
  const queryParams = normalizeParams(tool.queryParams);
  const queryPairs: string[] = [];

  for (const param of queryParams) {
    let value = toolArgs[param.name];

    // Use default if not provided
    if (value === undefined && param.default !== undefined) {
      value = param.default;
    }

    if (param.required && (value === undefined || value === null)) {
      throw new Error(`Missing required query parameter: ${param.name}`);
    }

    if (value !== undefined && value !== null) {
      // Handle array values: ?ids=1&ids=2
      if (Array.isArray(value)) {
        for (const v of value) {
          queryPairs.push(
            `${encodeURIComponent(param.name)}=${encodeURIComponent(String(v))}`
          );
        }
      } else {
        queryPairs.push(
          `${encodeURIComponent(param.name)}=${encodeURIComponent(String(value))}`
        );
      }
    }
  }

  // API key in query string (config-driven)
  if (blueprint.authType === "api_key") {
    const authConfig = JSON.parse(blueprint.authConfig);
    if (authConfig.queryParam && credentials.apiKey) {
      queryPairs.push(
        `${encodeURIComponent(authConfig.queryParam)}=${encodeURIComponent(credentials.apiKey)}`
      );
    }
  }

  // 3. Construct full URL
  const baseUrl = blueprint.baseUrl.replace(/\/$/, "");
  const queryString = queryPairs.length > 0 ? `?${queryPairs.join("&")}` : "";
  const url = `${baseUrl}${resolvedPath}${queryString}`;

  // 4. Determine content type
  const contentType = resolveContentType(tool, protocol, blueprint.defaultHeaders);

  // 5. Build headers
  const headers: Record<string, string> = {
    ...(blueprint.defaultHeaders ? JSON.parse(blueprint.defaultHeaders) : {}),
  };

  // Set content-type (can be overridden by defaultHeaders or headerParams)
  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  // Add auth header based on authType
  applyAuth(headers, blueprint, credentials);

  // Add custom header params from tool definition
  const headerParams = normalizeParams(tool.headerParams);
  for (const param of headerParams) {
    const value = toolArgs[param.name];
    if (value !== undefined && value !== null) {
      headers[param.name] = String(value);
    }
  }

  // 6. Build body
  const body = buildBody(
    tool,
    toolArgs,
    pathParams,
    queryParams,
    headerParams,
    protocol,
    contentType
  );

  return { url, headers, body };
}

/**
 * Determine the content type for the request.
 */
function resolveContentType(
  tool: BuildRequestArgs["tool"],
  protocol: string,
  defaultHeaders?: string
): string {
  // Explicit override on the tool takes priority
  if (tool.requestContentType) return tool.requestContentType;

  // Blueprint-level default Content-Type (from defaultHeaders)
  if (defaultHeaders) {
    try {
      const parsed = JSON.parse(defaultHeaders);
      const ct = parsed["Content-Type"] || parsed["content-type"];
      if (ct) return ct;
    } catch { /* ignore */ }
  }

  // Protocol-based defaults
  switch (protocol) {
    case "graphql":
      return "application/json";
    case "soap":
      return "application/xml";
    case "jsonrpc":
      return "application/json";
    default:
      return "application/json";
  }
}

/**
 * Apply authentication headers based on blueprint auth type.
 * All config-driven — no provider-specific branching.
 */
function applyAuth(
  headers: Record<string, string>,
  blueprint: BuildRequestArgs["blueprint"],
  credentials: Record<string, any>
): void {
  const authConfig = JSON.parse(blueprint.authConfig);

  switch (blueprint.authType) {
    case "oauth2": {
      // Normalize token type — some providers return non-standard values:
      //   HubSpot → "bearer" (lowercase) → fix to "Bearer"
      //   Slack   → "bot"               → fix to "Bearer"
      const rawType = credentials.tokenType || "Bearer";
      const tokenType = /^(bearer|bot)$/i.test(rawType) ? "Bearer" : rawType;
      headers["Authorization"] = `${tokenType} ${
        credentials.accessToken || credentials.token
      }`;
      break;
    }

    case "bearer_token": {
      const bearerToken =
        credentials.accessToken || credentials.token || credentials.apiKey;
      headers["Authorization"] = `Bearer ${bearerToken}`;
      break;
    }

    case "api_key": {
      // Config-driven: headerName + headerPrefix, or queryParam (handled in URL building)
      if (!authConfig.queryParam) {
        const headerName = authConfig.headerName || "X-API-Key";
        const headerPrefix = authConfig.headerPrefix || "";
        headers[headerName] = `${headerPrefix}${credentials.apiKey}`;
      }
      break;
    }

    case "basic_auth": {
      if (credentials.username) {
        const basicAuth = Buffer.from(
          `${credentials.username}:${credentials.password || ""}`
        ).toString("base64");
        headers["Authorization"] = `Basic ${basicAuth}`;
      } else if (credentials.apiKey) {
        // If apiKey contains ":", treat as "username:password" (e.g. Gong accessKey:accessKeySecret)
        // Otherwise treat as "apiKey:" (e.g. Stripe sk_test_...)
        const authString = credentials.apiKey.includes(":")
          ? credentials.apiKey
          : `${credentials.apiKey}:`;
        const basicAuth = Buffer.from(authString).toString("base64");
        headers["Authorization"] = `Basic ${basicAuth}`;
      }
      break;
    }

    case "none":
      break;
  }
}

/**
 * Build the request body based on method, protocol, and content type.
 */
function buildBody(
  tool: BuildRequestArgs["tool"],
  toolArgs: Record<string, any>,
  pathParams: Array<{ name: string }>,
  queryParams: Array<{ name: string }>,
  headerParams: Array<{ name: string }>,
  protocol: string,
  contentType: string
): any | null {
  // GET and DELETE generally don't have bodies (except for GraphQL which always uses POST)
  if (["GET", "DELETE"].includes(tool.method) && protocol !== "graphql") {
    return null;
  }

  // Collect body keys (exclude params already used in path, query, headers)
  const excludeKeys = new Set([
    ...pathParams.map((p) => p.name),
    ...queryParams.map((p) => p.name),
    ...headerParams.map((p) => p.name),
  ]);

  let body: Record<string, any> = {};
  for (const [key, value] of Object.entries(toolArgs)) {
    if (!excludeKeys.has(key)) {
      body[key] = value;
    }
  }

  // For tools with bodySchema: populate const/default values when agent didn't supply them
  if (tool.bodySchema) {
    try {
      const schema = JSON.parse(tool.bodySchema);
      if (schema.properties) {
        for (const [key, prop] of Object.entries(schema.properties) as [
          string,
          any,
        ][]) {
          // const values are always set (e.g. GraphQL query strings)
          if (prop.const !== undefined && body[key] === undefined) {
            body[key] = prop.const;
          }
          // default values fill in when agent didn't provide
          if (prop.default !== undefined && body[key] === undefined) {
            body[key] = prop.default;
          }
        }
      }
    } catch {
      // Invalid schema, ignore
    }
  }

  // GraphQL: ensure query field exists, wrap variables properly
  if (protocol === "graphql") {
    return buildGraphQLBody(body);
  }

  // Return body or null if empty
  return Object.keys(body).length > 0 ? body : null;
}

/**
 * Build a properly structured GraphQL request body.
 *
 * Accepts either:
 *  - { query: "...", variables: {...} } — pass through
 *  - { query: "...", someVar: "x" }    — wrap non-query keys into variables
 */
function buildGraphQLBody(
  body: Record<string, any>
): Record<string, any> | null {
  if (!body.query) return Object.keys(body).length > 0 ? body : null;

  // If variables key already exists, pass through as-is
  if (body.variables !== undefined) {
    return {
      query: body.query,
      variables: body.variables,
      ...(body.operationName ? { operationName: body.operationName } : {}),
    };
  }

  // Otherwise, move non-standard keys into variables
  const variables: Record<string, any> = {};
  const reserved = new Set(["query", "operationName"]);

  for (const [key, value] of Object.entries(body)) {
    if (!reserved.has(key)) {
      variables[key] = value;
    }
  }

  const result: Record<string, any> = { query: body.query };
  if (Object.keys(variables).length > 0) {
    result.variables = variables;
  }
  if (body.operationName) {
    result.operationName = body.operationName;
  }

  return result;
}
