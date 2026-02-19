import { useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Key,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  Play,
  Loader2,
  AlertTriangle,
  Info,
  Zap,
  Edit,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useIntegrationEngine } from "@/hooks/useIntegrationEngine";
import { ApiKeyEntry } from "@/components/integration-engine/ApiKeyEntry";
import { OAuthSetupGuide } from "@/components/integration-engine/OAuthSetupGuide";
import { apiPost } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function BlueprintDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const { connectApiKey, connectOAuth, disconnect, testConnection, isLoading } = useIntegrationEngine();

  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [showResponseData, setShowResponseData] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editedAuthConfig, setEditedAuthConfig] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Fetch blueprint
  const blueprint = useQuery(api.blueprints.get, id ? { id: id as Id<"blueprints"> } : "skip");

  // Fetch tools
  const tools = useQuery(
    api.blueprintTools.listByBlueprint,
    blueprint ? { blueprintId: blueprint._id } : "skip"
  );

  // Fetch connection status
  const connections = useQuery(api.connections.listByUser, { userId });

  // Fetch activity for this integration
  const allActivity = useQuery(api.integrationActivity.list, {
    userId,
    limit: 100,
  });
  const activity = allActivity?.filter((a) => a.integrationType === blueprint?.slug) ?? [];

  const connection = connections?.find((c) => c.blueprintId === blueprint?._id);
  const isConnected = connection?.status === "active";
  const hasError = connection?.status === "error";

  // Check if OAuth is properly configured
  const isOAuthConfigured = () => {
    if (blueprint?.authType !== "oauth2") return true;
    try {
      const authConfig = JSON.parse(blueprint.authConfig || "{}");
      return !!authConfig.clientId && !!authConfig.authorizeUrl;
    } catch {
      return false;
    }
  };

  const handleConnectApiKey = async (credentials: string) => {
    if (!blueprint) return;

    try {
      await connectApiKey(blueprint.slug, credentials);
      toast({
        title: "Connected!",
        description: `${blueprint.name} is now available to agents`,
      });
      setConnectDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleConnectOAuth = async () => {
    if (!blueprint) return;

    try {
      await connectOAuth(blueprint.slug);
      toast({
        title: "Connected!",
        description: `${blueprint.name} is now available to agents`,
      });
      setConnectDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async () => {
    if (!blueprint || !connection) return;

    try {
      await disconnect(blueprint._id);
      toast({
        title: "Disconnected",
        description: `${blueprint.name} is no longer available`,
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveAuthConfig = async () => {
    if (!blueprint) return;

    setIsSaving(true);
    try {
      // Validate JSON
      JSON.parse(editedAuthConfig);

      const result = await apiPost("/api/integrations/blueprints/update", {
        id: blueprint._id,
        authConfig: editedAuthConfig,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      toast({
        title: "Configuration Saved",
        description: "OAuth configuration updated successfully",
      });
      setIsEditingConfig(false);
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message || "Invalid JSON configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!blueprint) return;

    setIsTesting(true);
    setTestResult(null);
    setShowResponseData(false);

    try {
      // Pick a safe tool for testing
      // Priority:
      // 1. List tools without path params (e.g., list_calendars)
      // 2. GET tools without path params
      // 3. POST tools without path params (e.g., create_spreadsheet)
      // 4. Any tool without required path params

      const toolsWithoutRequiredParams = tools?.filter((t) => {
        const pathParams = t.pathParams ? JSON.parse(t.pathParams) : null;
        if (!pathParams) return true;
        if (Array.isArray(pathParams) && pathParams.length > 0) {
          // Check if all params are optional
          return pathParams.every((p: any) => !p.required);
        }
        if (!Array.isArray(pathParams) && Object.keys(pathParams).length > 0) return false;
        return true;
      });

      const listToolsNoParams = toolsWithoutRequiredParams?.filter((t) =>
        t.name.startsWith("list_")
      );
      const getToolsNoParams = toolsWithoutRequiredParams?.filter((t) => t.method === "GET");
      const postToolsNoParams = toolsWithoutRequiredParams?.filter((t) => t.method === "POST");

      const testTool = listToolsNoParams?.[0] || getToolsNoParams?.[0] || postToolsNoParams?.[0] || toolsWithoutRequiredParams?.[0];

      if (!testTool) {
        setTestResult({
          success: false,
          message: "No suitable test tool found. All tools require parameters. Your connection is established but cannot be automatically tested."
        });
        return;
      }

      const result = await testConnection(blueprint.slug, testTool.name, {});

      if (result.success) {
        setTestResult({
          success: true,
          message: `Connection verified! Tested "${testTool.displayName}" successfully.`,
          data: result.result,
        });
        toast({
          title: "Connection Working",
          description: `${blueprint.name} is responding correctly`,
        });
      } else {
        const errorMsg = result.details || result.error || "Unknown error";
        // Check for common issues
        if (errorMsg.includes("object_not_found") || errorMsg.includes("shared with your integration")) {
          setTestResult({
            success: false,
            message: "Authentication works, but no content is shared with the integration. See setup instructions below.",
          });
        } else if (errorMsg.includes("401") || errorMsg.includes("unauthorized")) {
          setTestResult({
            success: false,
            message: "Authentication failed. Your API key or token may be invalid or expired. Try disconnecting and reconnecting.",
          });
        } else {
          setTestResult({
            success: false,
            message: `Test failed: ${errorMsg.substring(0, 200)}`,
          });
        }
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Connection test failed: ${error.message}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Setup instructions for specific integrations
  const getSetupInstructions = (slug: string): { title: string; steps: string[] } | null => {
    const instructions: Record<string, { title: string; steps: string[] }> = {
      notion: {
        title: "Notion Setup Required",
        steps: [
          "Open your Notion workspace",
          "Navigate to any page you want the AI to access",
          "Click the '...' menu in the top-right corner",
          "Select 'Connect to' (or 'Add connections')",
          "Find and select your integration (e.g., 'my AI')",
          "Click 'Confirm' to grant access",
          "Repeat for any additional pages or databases",
        ],
      },
      "stripe-api": {
        title: "Stripe Setup",
        steps: [
          "Your Stripe API key is connected and ready to use",
          "Use test mode keys (sk_test_...) for testing",
          "Switch to live keys (sk_live_...) for production",
        ],
      },
      "gong": {
        title: "Gong Setup",
        steps: [
          "Your Gong API token is connected",
          "Ensure your token has the required scopes for the tools you want to use",
          "Contact your Gong admin if you need additional API permissions",
        ],
      },
    };
    return instructions[slug] || null;
  };

  if (!blueprint) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-muted-foreground">Loading blueprint...</p>
      </div>
    );
  }

  const authConfig = JSON.parse(blueprint.authConfig || "{}");

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{blueprint.name}</h1>
            <Badge variant={blueprint.status === "active" ? "default" : "secondary"}>
              {blueprint.status}
            </Badge>
            <Badge variant={isConnected ? "default" : hasError ? "destructive" : "outline"}>
              {isConnected ? (
                <>
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : hasError ? (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Error
                </>
              ) : (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Not Connected
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground">{blueprint.description}</p>
          <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
            <span>Category: {blueprint.category}</span>
            <span>Auth: {blueprint.authType}</span>
            <span>Version: {blueprint.version}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!isConnected && (
            <Button onClick={() => setConnectDialogOpen(true)}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Connect
            </Button>
          )}
          {isConnected && (
            <>
              <Button variant="outline" onClick={handleTestConnection} disabled={isTesting}>
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                {isTesting ? "Testing..." : "Test Connection"}
              </Button>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Connection Dialog */}
      {connectDialogOpen && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect {blueprint.name}</CardTitle>
            <CardDescription>
              {blueprint.authType === "api_key"
                ? "Enter your API key to enable this integration"
                : blueprint.authType === "oauth2"
                ? "Configure OAuth credentials to enable this integration"
                : "Enter your secret key or token to enable this integration"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {blueprint.authType === "oauth2" && !isOAuthConfigured() && (
              <div className="space-y-3">
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900 dark:text-orange-100 mb-1">
                        OAuth Not Configured
                      </p>
                      <p className="text-xs text-orange-800 dark:text-orange-200">
                        This blueprint needs OAuth credentials before you can connect. Please set up the OAuth app first.
                      </p>
                    </div>
                  </div>
                </div>
                <OAuthSetupGuide blueprint={blueprint} />
              </div>
            )}

            {blueprint.authType === "oauth2" && isOAuthConfigured() && (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    Click "Connect" below to open the OAuth authorization page in a popup window.
                    You'll be redirected to {blueprint.name} to authorize access.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p className="font-medium">What happens next:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>A secure popup window will open</li>
                    <li>You'll authorize {blueprint.name} access</li>
                    <li>The popup will close automatically</li>
                    <li>Your encrypted access token will be stored</li>
                  </ol>
                </div>
              </div>
            )}

            {(blueprint.authType === "api_key" || blueprint.authType === "bearer_token" || blueprint.authType === "basic_auth") && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  {authConfig.format === "key:secret"
                    ? "Access Key : Access Key Secret"
                    : blueprint.authType === "api_key"
                    ? "API Key"
                    : "Secret Key / Token"}
                </label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder={authConfig.format === "key:secret"
                    ? "accessKey:accessKeySecret"
                    : blueprint.authType === "api_key"
                    ? "Enter your API key"
                    : "Enter your secret key (e.g., sk_live_...)"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                {authConfig.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {authConfig.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  This will be encrypted and stored securely
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (blueprint.authType === "oauth2") {
                    handleConnectOAuth();
                  } else {
                    handleConnectApiKey(apiKey);
                  }
                }}
                disabled={
                  isLoading ||
                  (blueprint.authType === "oauth2" && !isOAuthConfigured()) ||
                  (blueprint.authType !== "oauth2" && !apiKey)
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {blueprint.authType === "oauth2" ? "Opening OAuth..." : "Connecting..."}
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
              <Button variant="outline" onClick={() => setConnectDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {hasError && connection?.lastError && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Connection Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{connection.lastError}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Consecutive failures: {connection.consecutiveFailures}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Test Result */}
      {testResult && (
        <Card className={`mb-6 ${testResult.success ? "border-green-500" : "border-yellow-500"}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm flex items-center ${testResult.success ? "text-green-600" : "text-yellow-600"}`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {testResult.success ? "Connection Test Passed" : "Connection Test Issue"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">{testResult.message}</p>
            {testResult.data && (
              <div>
                <button
                  onClick={() => setShowResponseData(!showResponseData)}
                  className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showResponseData ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                  {showResponseData ? "Hide" : "Show"} Response Data
                  {Array.isArray(testResult.data) && (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                      {testResult.data.length} items
                    </Badge>
                  )}
                </button>
                {showResponseData && (
                  <pre className="mt-2 text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-96 overflow-y-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Setup Instructions */}
      {isConnected && getSetupInstructions(blueprint.slug) && (
        <Card className="mb-6 border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center text-blue-700">
              <Info className="w-4 h-4 mr-2" />
              {getSetupInstructions(blueprint.slug)!.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-sm space-y-1.5 list-decimal list-inside text-muted-foreground">
              {getSetupInstructions(blueprint.slug)!.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="tools" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tools">
            Tools ({tools?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle>Available Tools</CardTitle>
              <CardDescription>
                API endpoints available to agents when this integration is connected
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!tools || tools.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tools defined yet. Tools can be added via API or doc scraping.
                </p>
              ) : (
                <div className="space-y-2">
                  {tools.map((tool) => {
                    const isExpanded = expandedTool === tool._id;
                    const pathParams = JSON.parse(tool.pathParams || "[]");
                    const queryParams = JSON.parse(tool.queryParams || "[]");
                    const bodySchema = JSON.parse(tool.bodySchema || "{}");

                    return (
                      <div key={tool._id} className="border rounded-lg">
                        <div
                          className="p-4 cursor-pointer hover:bg-accent/50 flex items-center justify-between"
                          onClick={() => setExpandedTool(isExpanded ? null : tool._id)}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {tool.method}
                              </Badge>
                              <span className="font-semibold">{tool.displayName}</span>
                              <Badge variant="secondary">{tool.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{tool.description}</p>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>

                        {isExpanded && (
                          <div className="border-t p-4 bg-muted/30 space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Endpoint</p>
                              <code className="text-xs bg-background px-2 py-1 rounded">
                                {tool.method} {blueprint.baseUrl}{tool.path}
                              </code>
                            </div>

                            {tool.aiUsageHint && (
                              <div>
                                <p className="text-sm font-medium mb-1">AI Usage Hint</p>
                                <p className="text-sm text-muted-foreground">{tool.aiUsageHint}</p>
                              </div>
                            )}

                            {pathParams.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Path Parameters</p>
                                <div className="text-xs space-y-1">
                                  {pathParams.map((param: any) => (
                                    <div key={param.name} className="flex gap-2">
                                      <code className="bg-background px-1 rounded">{param.name}</code>
                                      <span className="text-muted-foreground">
                                        {param.type} {param.required && "(required)"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {queryParams.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Query Parameters</p>
                                <div className="text-xs space-y-1">
                                  {queryParams.map((param: any) => (
                                    <div key={param.name} className="flex gap-2">
                                      <code className="bg-background px-1 rounded">{param.name}</code>
                                      <span className="text-muted-foreground">
                                        {param.type} {param.required && "(required)"}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {Object.keys(bodySchema).length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-1">Request Body Schema</p>
                                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                  {JSON.stringify(bodySchema, null, 2)}
                                </pre>
                              </div>
                            )}

                            {tool.exampleArgs && (
                              <div>
                                <p className="text-sm font-medium mb-1">Example Arguments</p>
                                <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                                  {tool.exampleArgs}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration</CardTitle>
                {blueprint.authType === "oauth2" && !isEditingConfig && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingConfig(true);
                      setEditedAuthConfig(JSON.stringify(authConfig, null, 2));
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit OAuth
                  </Button>
                )}
                {isEditingConfig && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveAuthConfig}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingConfig(false)}
                      disabled={isSaving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-1">Base URL</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">{blueprint.baseUrl}</code>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Authentication Type</p>
                <p className="text-sm">{blueprint.authType}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Auth Configuration</p>
                {isEditingConfig ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editedAuthConfig}
                      onChange={(e) => setEditedAuthConfig(e.target.value)}
                      className="font-mono text-xs min-h-[200px]"
                      placeholder="Enter OAuth configuration as JSON..."
                    />
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-900 dark:text-blue-100 mb-2 font-medium">
                        OAuth Configuration Fields:
                      </p>
                      <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                        <li><strong>clientId:</strong> Your OAuth app's Client ID</li>
                        <li><strong>clientSecret:</strong> Your Client Secret (or env var like OAUTH_SECRET_LINEAR)</li>
                        <li><strong>authorizeUrl:</strong> Provider's authorization endpoint</li>
                        <li><strong>tokenUrl:</strong> Provider's token exchange endpoint</li>
                        <li><strong>scopes:</strong> Array of permission scopes (e.g., ["read", "write"])</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {JSON.stringify(authConfig, null, 2)}
                  </pre>
                )}
              </div>

              {blueprint.defaultHeaders && blueprint.defaultHeaders !== "{}" && (
                <div>
                  <p className="text-sm font-medium mb-1">Default Headers</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {blueprint.defaultHeaders}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-sm font-medium mb-1">Source Type</p>
                <Badge>{blueprint.sourceType}</Badge>
              </div>

              {blueprint.sourceUrl && (
                <div>
                  <p className="text-sm font-medium mb-1">Source URL</p>
                  <a
                    href={blueprint.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {blueprint.sourceUrl}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>API calls made using this integration</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No activity yet. Use the "Test Connection" button or execute a tool to see activity here.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Tool</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.map((entry) => (
                      <TableRow key={entry._id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(entry.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{entry.toolName}</TableCell>
                        <TableCell className="text-sm">{entry.agentName || "Manual"}</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "success" ? "default" : "destructive"}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                          {entry.errorMessage || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
