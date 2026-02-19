/**
 * OpenAPI/Swagger spec parser
 * Deterministically extracts blueprint + tools from OpenAPI 3.x / Swagger 2.x specs
 */

interface OpenAPISpec {
  openapi?: string;
  swagger?: string;
  info?: {
    title?: string;
    description?: string;
    version?: string;
  };
  servers?: Array<{ url: string }>;
  host?: string;
  basePath?: string;
  schemes?: string[];
  paths?: Record<string, any>;
  components?: {
    securitySchemes?: Record<string, any>;
  };
  securityDefinitions?: Record<string, any>;
}

interface ParsedBlueprint {
  slug: string;
  name: string;
  description: string;
  category: string;
  authType: "oauth2" | "api_key" | "bearer_token" | "basic_auth" | "none";
  authConfig: string; // JSON string
  baseUrl: string;
  defaultHeaders: string; // JSON string
  sourceType: "manual" | "ai_scraped" | "openapi_import";
  sourceUrl?: string;
}

interface ParsedTool {
  name: string;
  displayName: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  pathParams?: string; // JSON array
  queryParams?: string; // JSON array
  bodySchema?: string; // JSON Schema
  responseMapping?: string; // JSON
  aiUsageHint?: string;
  exampleArgs?: string; // JSON
  timeoutMs?: number;
  retryCount?: number;
}

export interface ParsedOpenAPI {
  blueprint: ParsedBlueprint;
  tools: ParsedTool[];
}

/**
 * Parse OpenAPI/Swagger spec
 */
export function parseOpenAPISpec(specContent: string): ParsedOpenAPI {
  let spec: OpenAPISpec;

  try {
    spec = JSON.parse(specContent);
  } catch (e) {
    throw new Error("Failed to parse OpenAPI spec as JSON. YAML parsing not yet implemented.");
  }

  // Validate it's an OpenAPI/Swagger spec
  if (!spec.openapi && !spec.swagger) {
    throw new Error("Not a valid OpenAPI/Swagger spec");
  }

  const blueprint = extractBlueprint(spec);
  const tools = extractTools(spec);

  return { blueprint, tools };
}

/**
 * Extract blueprint info from spec
 */
function extractBlueprint(spec: OpenAPISpec): ParsedBlueprint {
  const name = spec.info?.title || "Unnamed API";
  const description = spec.info?.description || "";
  const slug = slugify(name);

  // Extract base URL
  let baseUrl = "";
  if (spec.servers && spec.servers.length > 0) {
    baseUrl = spec.servers[0].url;
  } else if (spec.host) {
    const scheme = spec.schemes?.[0] || "https";
    const basePath = spec.basePath || "";
    baseUrl = `${scheme}://${spec.host}${basePath}`;
  }

  baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash

  // Detect auth type
  const { authType, authConfig } = detectAuth(spec);

  return {
    slug,
    name,
    description,
    category: "Other", // Auto-categorization could be added later
    authType,
    authConfig: JSON.stringify(authConfig),
    baseUrl,
    defaultHeaders: JSON.stringify({}),
    sourceType: "openapi_import",
  };
}

/**
 * Detect authentication scheme from spec
 */
function detectAuth(spec: OpenAPISpec): {
  authType: "oauth2" | "api_key" | "bearer_token" | "basic_auth" | "none";
  authConfig: Record<string, any>;
} {
  const securitySchemes =
    spec.components?.securitySchemes || spec.securityDefinitions || {};

  // Check for OAuth2
  for (const [name, scheme] of Object.entries(securitySchemes)) {
    if ((scheme as any).type === "oauth2") {
      const flows = (scheme as any).flows || (scheme as any).flow;
      return {
        authType: "oauth2",
        authConfig: {
          // These would need to be filled in manually by user
          authorizeUrl: "",
          tokenUrl: "",
          scopes: [],
          clientId: "",
          clientSecretEncrypted: "",
        },
      };
    }

    // Check for API key
    if ((scheme as any).type === "apiKey") {
      return {
        authType: "api_key",
        authConfig: {
          headerName: (scheme as any).name || "X-API-Key",
          headerPrefix: "",
        },
      };
    }

    // Check for HTTP bearer
    if (
      (scheme as any).type === "http" &&
      (scheme as any).scheme === "bearer"
    ) {
      return {
        authType: "bearer_token",
        authConfig: {
          headerName: "Authorization",
        },
      };
    }

    // Check for HTTP basic
    if (
      (scheme as any).type === "http" &&
      (scheme as any).scheme === "basic"
    ) {
      return {
        authType: "basic_auth",
        authConfig: {},
      };
    }
  }

  return {
    authType: "none",
    authConfig: {},
  };
}

/**
 * Extract tools from spec paths
 */
function extractTools(spec: OpenAPISpec): ParsedTool[] {
  const tools: ParsedTool[] = [];
  const paths = spec.paths || {};

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      const upperMethod = method.toUpperCase();

      if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(upperMethod)) {
        continue; // Skip non-HTTP methods (like "parameters")
      }

      const tool = operationToTool(
        path,
        upperMethod as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
        operation
      );

      tools.push(tool);
    }
  }

  return tools;
}

/**
 * Convert OpenAPI operation to tool definition
 */
function operationToTool(
  path: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  operation: any
): ParsedTool {
  const name = operation.operationId || generateToolName(path, method);
  const displayName =
    operation.summary || titleCase(name.replace(/_/g, " "));
  const description = operation.description || operation.summary || "";

  // Extract parameters
  const pathParams: any[] = [];
  const queryParams: any[] = [];
  const params = operation.parameters || [];

  for (const param of params) {
    if (param.in === "path") {
      pathParams.push({
        name: param.name,
        type: param.schema?.type || "string",
        required: param.required || false,
        description: param.description || "",
      });
    } else if (param.in === "query") {
      queryParams.push({
        name: param.name,
        type: param.schema?.type || "string",
        required: param.required || false,
        description: param.description || "",
        default: param.schema?.default,
      });
    }
  }

  // Extract request body schema
  let bodySchema: any = null;
  if (operation.requestBody) {
    const content = operation.requestBody.content?.["application/json"];
    if (content?.schema) {
      bodySchema = content.schema;
    }
  }

  return {
    name,
    displayName,
    description,
    method,
    path,
    pathParams: pathParams.length > 0 ? JSON.stringify(pathParams) : undefined,
    queryParams:
      queryParams.length > 0 ? JSON.stringify(queryParams) : undefined,
    bodySchema: bodySchema ? JSON.stringify(bodySchema) : undefined,
    responseMapping: JSON.stringify({ successField: "success" }),
    aiUsageHint: `Use when you need to ${displayName.toLowerCase()}.`,
    timeoutMs: 30000,
    retryCount: 1,
  };
}

/**
 * Generate tool name from path and method
 */
function generateToolName(path: string, method: string): string {
  // Remove leading slash and path params
  let name = path.replace(/^\//, "").replace(/\{[^}]+\}/g, "");
  // Replace slashes with underscores
  name = name.replace(/\//g, "_");
  // Lowercase method + name
  name = `${method.toLowerCase()}_${name}`;
  // Remove trailing underscores
  name = name.replace(/_+$/, "");
  return name;
}

/**
 * Convert string to slug (lowercase-hyphenated)
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Title case a string
 */
function titleCase(text: string): string {
  return text
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
