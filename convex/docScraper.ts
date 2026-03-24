// @ts-nocheck
import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { isOpenAPISpec, stripHTML } from "./lib/htmlUtils";
import { parseOpenAPISpec } from "./lib/openApiParser";

/**
 * Start a doc scraping job
 * Fetches docs, detects OpenAPI vs HTML, creates Valence AI task for AI analysis
 */
export const startScrape = action({
  args: {
    url: v.string(),
    createdBy: v.string(),
    suggestedName: v.optional(v.string()),
    suggestedCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Create job record
    const jobId = await ctx.runMutation(api.docScraper.createJob, {
      url: args.url,
      createdBy: args.createdBy,
    });

    // 2. Update to "fetching" status
    await ctx.runMutation(api.docScraper.updateJobStatus, {
      id: jobId,
      status: "fetching",
    });

    // 3. Fetch the content
    let rawContent: string;
    try {
      const response = await fetch(args.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml,application/json;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      rawContent = await response.text();

      // Check if we got actual content
      if (rawContent.length < 100) {
        throw new Error("URL returned insufficient content - may require authentication or may be a redirect");
      }
    } catch (e: any) {
      const errorMsg = `Failed to fetch URL: ${e.message}. For HubSpot/protected APIs, try: 1) Use the OpenAPI spec URL (often /openapi.json), 2) Download and import the spec file, or 3) Create the blueprint manually.`;

      await ctx.runMutation(api.docScraper.updateJobStatus, {
        id: jobId,
        status: "failed",
        error: errorMsg,
      });
      return { jobId, error: errorMsg };
    }

    // 4. Check if it's OpenAPI spec
    const isOpenAPI = isOpenAPISpec(rawContent);

    if (isOpenAPI) {
      // Deterministic parsing - no AI needed
      try {
        const parsed = parseOpenAPISpec(rawContent);

        // Create blueprint
        const blueprintId = await ctx.runMutation(api.blueprints.create, {
          ...parsed.blueprint,
          createdBy: args.createdBy,
        });

        // Create tools
        await ctx.runMutation(api.blueprintTools.bulkCreate, {
          blueprintId,
          tools: parsed.tools,
        });

        // Mark job complete
        await ctx.runMutation(api.docScraper.updateJobStatus, {
          id: jobId,
          status: "completed",
          blueprintId,
          toolCount: parsed.tools.length,
        });

        return { jobId, blueprintId, toolCount: parsed.tools.length };
      } catch (e: any) {
        // Clean up Convex error prefix for user-friendly messages
        const errorMsg = (e.message || "Unknown error")
          .replace(/^Uncaught Error:\s*/, "")
          .split("\n")[0]; // Remove stack trace
        await ctx.runMutation(api.docScraper.updateJobStatus, {
          id: jobId,
          status: "failed",
          error: `OpenAPI parsing failed: ${errorMsg}`,
        });
        return { jobId, error: errorMsg };
      }
    }

    // 5. HTML docs - needs AI analysis via OpenClaw
    const cleanText = stripHTML(rawContent);
    const truncated = cleanText.substring(0, 150000);

    await ctx.runMutation(api.docScraper.updateJobStatus, {
      id: jobId,
      status: "analyzing",
      rawContentLength: truncated.length,
    });

    // 6. Create Valence AI task for agent analysis
    try {
      const taskId = await ctx.runMutation(api.tasks.create, {
        title: `Analyze API Documentation: ${args.suggestedName || "Unknown API"}`,
        description: `Parse the following API documentation and extract structured tool definitions.

**Source URL:** ${args.url}
**Suggested Name:** ${args.suggestedName || "Auto-detect"}
**Suggested Category:** ${args.suggestedCategory || "Auto-detect"}

**Documentation Content:**
\`\`\`
${truncated}
\`\`\`

**Your Task:**
1. Identify the API service name, base URL, and authentication method
2. Extract every API endpoint as a "tool" with its method, path, parameters, and description
3. Write AI-agent-friendly descriptions that help an AI understand WHEN and HOW to use each tool

**Output Format:**
Post a deliverable named "blueprint.json" with this exact JSON structure:
\`\`\`json
{
  "blueprint": {
    "slug": "service-name",
    "name": "Service Name",
    "description": "What this API does in one sentence",
    "category": "CRM | Communication | File Storage | Other",
    "authType": "oauth2 | api_key | bearer_token | basic_auth | none",
    "authConfig": {},
    "baseUrl": "https://api.example.com/v1",
    "defaultHeaders": {}
  },
  "tools": [
    {
      "name": "snake_case_name",
      "displayName": "Human Readable Name",
      "description": "Detailed description for AI agent",
      "method": "GET|POST|PUT|PATCH|DELETE",
      "path": "/relative/path/{path_param}",
      "pathParams": "[{\\"name\\":\\"path_param\\",\\"type\\":\\"string\\",\\"required\\":true,\\"description\\":\\"...\\"}]",
      "queryParams": "[]",
      "bodySchema": "{}",
      "responseMapping": "{\\"successField\\":\\"ok\\"}",
      "aiUsageHint": "Use this when...",
      "exampleArgs": "{}",
      "timeoutMs": 30000,
      "retryCount": 1
    }
  ]
}
\`\`\`

**Important:**
- Focus on the 20-30 most commonly used endpoints if there are too many
- Include aiUsageHint that tells agents WHEN to use each tool
- Add scraper job ID to your comment: ${jobId}`,
        priority: "high",
        creator: "Integration Engine",
        assignee: "Kaze", // Kaze or Scout will pick this up
        tags: ["integration-scraper", jobId],
      });

      await ctx.runMutation(api.docScraper.updateJobStatus, {
        id: jobId,
        statusMessage: `Task created: ${taskId}. Waiting for agent analysis.`,
      });

      return {
        jobId,
        taskId,
        message: "AI analysis in progress via OpenClaw agent",
      };
    } catch (e: any) {
      await ctx.runMutation(api.docScraper.updateJobStatus, {
        id: jobId,
        status: "failed",
        error: `Task creation failed: ${e.message}`,
      });
      return { jobId, error: e.message };
    }
  },
});

/**
 * Complete AI analysis (called when agent posts deliverable)
 */
export const completeAnalysis = mutation({
  args: {
    jobId: v.id("scraperJobs"),
    blueprintJson: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const parsed = JSON.parse(args.blueprintJson);

      // Create blueprint
      const blueprintId = await ctx.runMutation(api.blueprints.create, {
        ...parsed.blueprint,
        sourceType: "ai_scraped",
        createdBy: args.createdBy,
      });

      // Create tools
      await ctx.runMutation(api.blueprintTools.bulkCreate, {
        blueprintId,
        tools: parsed.tools,
      });

      // Mark job complete
      await ctx.runMutation(api.docScraper.updateJobStatus, {
        id: args.jobId,
        status: "completed",
        blueprintId,
        toolCount: parsed.tools.length,
      });

      return { ok: true, blueprintId, toolCount: parsed.tools.length };
    } catch (e: any) {
      await ctx.runMutation(api.docScraper.updateJobStatus, {
        id: args.jobId,
        status: "failed",
        error: `Analysis completion failed: ${e.message}`,
      });
      throw e;
    }
  },
});

/**
 * Create a scraper job record
 */
export const createJob = mutation({
  args: {
    url: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("scraperJobs", {
      url: args.url,
      status: "pending",
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Update scraper job status
 */
export const updateJobStatus = mutation({
  args: {
    id: v.id("scraperJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("fetching"),
        v.literal("analyzing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    blueprintId: v.optional(v.id("blueprints")),
    toolCount: v.optional(v.number()),
    rawContentLength: v.optional(v.number()),
    statusMessage: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Get scraper job status (for polling)
 */
export const getJob = query({
  args: { id: v.id("scraperJobs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * List recent scraper jobs
 */
export const listJobs = query({
  args: {
    limit: v.optional(v.number()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("scraperJobs").withIndex("by_created").order("desc");

    const jobs = await q.take(args.limit ?? 20);

    if (args.createdBy) {
      return jobs.filter((job) => job.createdBy === args.createdBy);
    }

    return jobs;
  },
});
