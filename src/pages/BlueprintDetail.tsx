import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { useIntegrationEngine } from "@/hooks/useIntegrationEngine";
import { ApiKeyEntry } from "@/components/integration-engine/ApiKeyEntry";
import { OAuthSetupGuide } from "@/components/integration-engine/OAuthSetupGuide";
import { apiPost } from "@/lib/api";
import { useMutation, useQuery as useConvexQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function BlueprintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const { connectApiKey, connectOAuth, disconnect, testConnection, isLoading } = useIntegrationEngine();

  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [shopName, setShopName] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [showResponseData, setShowResponseData] = useState(false);
  const [testSuiteResults, setTestSuiteResults] = useState<Array<{
    tool: string;
    label: string;
    status: "pending" | "running" | "pass" | "fail";
    data?: any;
    error?: string;
  }> | null>(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editedAuthConfig, setEditedAuthConfig] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [customOAuthClientId, setCustomOAuthClientId] = useState("");
  const [customOAuthClientSecret, setCustomOAuthClientSecret] = useState("");
  const [isSavingCustomOAuth, setIsSavingCustomOAuth] = useState(false);

  const setCustomAuthConfig = useMutation(api.blueprints.setCustomAuthConfig);
  const currentUser = useConvexQuery(api.users.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";

  // All queries fire in parallel — no cascading waits
  const blueprintId = id as Id<"blueprints"> | undefined;

  // Fetch blueprint
  const blueprint = useQuery(api.blueprints.get, blueprintId ? { id: blueprintId } : "skip");

  // Fetch tools — uses ID from URL directly, no need to wait for blueprint query
  const tools = useQuery(
    api.blueprintTools.listByBlueprint,
    blueprintId ? { blueprintId } : "skip"
  );

  // Fetch connection status — fires immediately
  const connections = useQuery(api.connections.listByUser, { userId });

  // Fetch activity — fires immediately
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

    // For Shopify, require a shop name to resolve the {shop} placeholder
    const instanceParams: Record<string, string> | undefined =
      blueprint.slug === "shopify" && shopName
        ? { shop: shopName.replace(/\.myshopify\.com.*$/, "").trim() }
        : undefined;

    if (blueprint.slug === "shopify" && !shopName) {
      toast({ title: "Shop name required", description: "Enter your Shopify store subdomain to continue.", variant: "destructive" });
      return;
    }

    try {
      await connectOAuth(blueprint.slug, instanceParams);
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
        if (Array.isArray(pathParams) && pathParams.length > 0) {
          if (!pathParams.every((p: any) => !p.required)) return false;
        } else if (!Array.isArray(pathParams) && pathParams && Object.keys(pathParams).length > 0) {
          return false;
        }
        // Also exclude tools with required query params
        const queryParams = t.queryParams ? JSON.parse(t.queryParams) : null;
        if (Array.isArray(queryParams) && queryParams.some((p: any) => p.required)) return false;
        // Also exclude tools with required body fields
        const bodySchema = t.bodySchema ? JSON.parse(t.bodySchema) : null;
        if (bodySchema?.required && Array.isArray(bodySchema.required) && bodySchema.required.length > 0) return false;
        // Exclude POST/PATCH/PUT tools that need a body but have no safe default
        if (["POST", "PATCH", "PUT"].includes(t.method) && bodySchema?.properties && Object.keys(bodySchema.properties).length > 0) return false;
        return true;
      });

      const listToolsNoParams = toolsWithoutRequiredParams?.filter((t) =>
        t.name.startsWith("list_")
      );
      const getToolsNoParams = toolsWithoutRequiredParams?.filter((t) => t.method === "GET");
      const postToolsNoParams = toolsWithoutRequiredParams?.filter((t) => t.method === "POST");

      const testTool = listToolsNoParams?.[0] || getToolsNoParams?.[0] || postToolsNoParams?.[0] || toolsWithoutRequiredParams?.[0];

      if (!testTool) {
        // Connection is established — all tools require params so we can't auto-test, but token is valid
        setTestResult({
          success: true,
          message: "Connection established. All tools require parameters so automatic testing is skipped, but your credentials are saved and ready to use."
        });
        toast({
          title: "Connection Ready",
          description: `${blueprint.name} connected — ready for use`,
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


  const handleRunTestSuite = async () => {
    if (!blueprint) return;
    setIsTesting(true);
    setTestResult(null);
    setShowResponseData(false);

    // Define test steps per integration slug
    type TestStep = { tool: string; label: string; args: Record<string, any>; extractForNext?: string };
    const suiteMap: Record<string, TestStep[]> = {
      confluence: [
        { tool: "get_accessible_resources", label: "Get Cloud ID", args: {}, extractForNext: "cloudId" },
        { tool: "list_spaces", label: "List Spaces", args: { cloudId: "__cloudId__" }, extractForNext: "spaceId" },
        {
          tool: "create_page", label: "Create Test Page", args: {
            cloudId: "__cloudId__",
            spaceId: "__spaceId__",
            title: `Mission Control Test — ${new Date().toISOString()}`,
            status: "current",
            body: { representation: "storage", value: "<p>This is an automated test page created by Mission Control. Safe to delete.</p>" },
          }, extractForNext: "pageId",
        },
        { tool: "get_page", label: "Read Test Page", args: { cloudId: "__cloudId__", pageId: "__pageId__", "body-format": "storage" } },
        { tool: "search_pages", label: "Search Pages", args: { cloudId: "__cloudId__", title: "Mission Control", limit: 5 } },
      ],
      jira: [
        { tool: "get_accessible_resources", label: "Get Cloud ID", args: {}, extractForNext: "cloudId" },
        { tool: "list_projects", label: "List Projects", args: { cloudId: "__cloudId__" } },
      ],
      notion: [
        { tool: "search", label: "Search Pages", args: {} },
      ],
      hubspot: [
        { tool: "list_contacts", label: "List Contacts", args: { limit: 5 } },
      ],
      "google-calendar": [
        { tool: "list_calendars", label: "List Calendars", args: {} },
      ],
      "zoho-workspace": [
        { tool: "get_user_profile", label: "Verify Identity (Profile)", args: {} },
        { tool: "crm_list_leads", label: "CRM: List Leads", args: { per_page: 5 } },
        { tool: "books_list_invoices", label: "Books: List Invoices", args: {} },
        { tool: "desk_list_tickets", label: "Desk: List Tickets", args: {} },
      ],
    };

    const steps: TestStep[] = suiteMap[blueprint.slug] ?? [];

    // If no suite defined, fall back to single-tool test
    if (steps.length === 0) {
      await handleTestConnection();
      return;
    }

    // Initialise all steps as pending
    const results = steps.map((s) => ({ tool: s.tool, label: s.label, status: "pending" as const }));
    setTestSuiteResults([...results]);

    // Shared context extracted from responses
    const ctx: Record<string, string> = {};

    const resolveArgs = (args: Record<string, any>): Record<string, any> => {
      const resolve = (v: any): any => {
        if (typeof v === "string") return v.replace(/__(\w+)__/g, (_, k) => ctx[k] ?? v);
        if (typeof v === "object" && v !== null) {
          return Object.fromEntries(Object.entries(v).map(([k, vv]) => [k, resolve(vv)]));
        }
        return v;
      };
      return resolve(args);
    };

    let allPassed = true;
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      // Mark current step running
      results[i] = { ...results[i], status: "running" };
      setTestSuiteResults([...results]);

      try {
        const resolvedArgs = resolveArgs(step.args);
        const res = await testConnection(blueprint.slug, step.tool, resolvedArgs);

        if (res.success) {
          results[i] = { ...results[i], status: "pass", data: res.result };

          // Extract context for subsequent steps
          if (step.extractForNext === "cloudId") {
            const resources = Array.isArray(res.result) ? res.result : [res.result];
            if (resources[0]?.id) ctx.cloudId = resources[0].id;
          } else if (step.extractForNext === "spaceId") {
            // v2 API: results is under .results array, each has .id (numeric)
            const spaces = res.result?.results ?? (Array.isArray(res.result) ? res.result : []);
            if (spaces[0]?.id) ctx.spaceId = String(spaces[0].id);
          } else if (step.extractForNext === "spaceKey") {
            const spaces = res.result?.results ?? (Array.isArray(res.result) ? res.result : []);
            if (spaces[0]?.key) ctx.spaceKey = spaces[0].key;
          } else if (step.extractForNext === "pageId") {
            if (res.result?.id) ctx.pageId = String(res.result.id);
          }
        } else {
          results[i] = { ...results[i], status: "fail", error: res.details || res.error || "Unknown error" };
          allPassed = false;
          // Stop suite on auth failure
          if (res.error === "Authentication failed") break;
        }
      } catch (e: any) {
        results[i] = { ...results[i], status: "fail", error: e.message };
        allPassed = false;
        break;
      }

      setTestSuiteResults([...results]);
    }

    // Mark remaining pending steps as skipped (show as fail with "Skipped")
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === "pending") {
        results[i] = { ...results[i], status: "fail", error: "Skipped (previous step failed)" };
      }
    }
    setTestSuiteResults([...results]);

    setTestResult({
      success: allPassed,
      message: allPassed
        ? `All ${steps.length} tests passed for ${blueprint.name}`
        : `${results.filter((r) => r.status === "fail").length} of ${steps.length} tests failed`,
    });

    setIsTesting(false);
  };

  if (!blueprint) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <p className="text-muted-foreground">Loading blueprint...</p>
        </div>
      </DashboardLayout>
    );
  }

  const authConfig = JSON.parse(blueprint.authConfig || "{}");

  return (
    <DashboardLayout>
    <div className="container mx-auto py-8">
      <Button variant="ghost" size="sm" onClick={() => navigate("/integrations")} className="mb-6 -ml-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Integrations
      </Button>
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
              <Button variant="outline" onClick={() => { setTestSuiteResults(null); handleRunTestSuite(); }} disabled={isTesting}>
                {isTesting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                {isTesting ? "Running..." : "Run Test Suite"}
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
                {blueprint.slug === "shopify" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Shopify Store Subdomain
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        className="flex-1 px-3 py-2 border rounded-md text-sm"
                        placeholder="your-store-name"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">.myshopify.com</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter just the subdomain (e.g. <code>valence-ai-test-store</code>)
                    </p>
                  </div>
                )}
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
                  (blueprint.authType === "oauth2" && blueprint.slug === "shopify" && !shopName) ||
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

      {/* Test Suite Results */}
      {testSuiteResults && (
        <Card className={`mb-6 ${testResult?.success ? "border-green-500" : "border-yellow-500"}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`text-sm flex items-center ${testResult?.success ? "text-green-600" : "text-yellow-600"}`}>
              {testResult?.success ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              {testResult?.message ?? "Running test suite…"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {testSuiteResults.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 py-2 border-b last:border-0">
                <div className="mt-0.5 shrink-0">
                  {step.status === "pending" && <Clock className="w-4 h-4 text-muted-foreground" />}
                  {step.status === "running" && <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />}
                  {step.status === "pass" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  {step.status === "fail" && <XCircle className="w-4 h-4 text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{step.label}</span>
                    <code className="text-[10px] text-muted-foreground bg-muted px-1 rounded">{step.tool}</code>
                  </div>
                  {step.status === "fail" && step.error && (
                    <p className="text-xs text-red-500 mt-0.5 truncate">{step.error}</p>
                  )}
                  {step.status === "pass" && step.data && (
                    <details className="mt-1">
                      <summary className="text-[10px] text-muted-foreground cursor-pointer hover:text-foreground">
                        Show response
                        {Array.isArray(step.data) && (
                          <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">{step.data.length} items</Badge>
                        )}
                      </summary>
                      <pre className="mt-1 text-[10px] bg-muted p-2 rounded overflow-x-auto max-h-48 overflow-y-auto">
                        {JSON.stringify(step.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Test Result (single tool) */}
      {testResult && !testSuiteResults && (
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
      {isConnected && blueprint.slug === "stripe-api" && (
        <Card className="mb-6 border-green-200 dark:border-green-800 bg-gradient-to-br from-[#635BFF]/5 to-transparent">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              {/* Stripe logo / icon area */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#635BFF] flex items-center justify-center shadow-md">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Stripe Connected</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400">
                    Test Mode
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Mode</p>
                    <p className="text-sm font-semibold text-foreground">Test</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">sk_test_...</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Tools</p>
                    <p className="text-sm font-semibold text-foreground">588</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">API endpoints</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Auth</p>
                    <p className="text-sm font-semibold text-foreground">Basic</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Secret key</p>
                  </div>
                </div>
                <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Using test mode. Switch to a <code className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[10px]">sk_live_...</code> key to go live.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && blueprint.slug === "gong" && (
        <Card className="mb-6 border-border bg-gradient-to-br from-orange-500/5 to-transparent">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Gong Connected</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Tools</p>
                    <p className="text-sm font-semibold text-foreground">53</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">API endpoints</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Auth</p>
                    <p className="text-sm font-semibold text-foreground">Basic</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Key + Secret</p>
                  </div>
                  <div className="rounded-lg border border-border bg-card px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Access</p>
                    <p className="text-sm font-semibold text-foreground">Full</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Calls & stats</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isConnected && blueprint.slug === "notion" && (
        <Card className="mb-6 border-border bg-gradient-to-br from-foreground/5 to-transparent">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-foreground flex items-center justify-center shadow-md">
                <span className="text-background font-bold text-lg">N</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Notion Connected</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Live
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Remember to share Notion pages with your integration. Go to any page → <strong className="text-foreground">···</strong> → <strong className="text-foreground">Connect to</strong> → select your integration.</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Zoho Workspace — Connected Apps Overview */}
      {blueprint.slug === "zoho-workspace" && (
        <Card className="mb-6 border-border bg-gradient-to-br from-[#E42527]/5 to-transparent">
          <CardContent className="pt-5 pb-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[#E42527] flex items-center justify-center shadow-md">
                <img src="https://cdn.worldvectorlogo.com/logos/zoho.svg" className="w-5 h-5 brightness-0 invert" alt="Zoho" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">Zoho Workspace</h3>
                  {isConnected && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">8 apps accessible via a single OAuth connection</p>
              </div>
            </div>

            {/* App Cards Grid */}
            {(() => {
              // Apps confirmed working via OAuth consent screen
              // Each entry: label, abbr, color classes, description, toolCount, active
              const apps = [
                { key: "crm",       label: "Zoho CRM",      abbr: "CRM", color: "blue",   desc: "Leads, Contacts, Deals, Accounts", tools: 6,  active: isConnected },
                { key: "books",     label: "Zoho Books",    abbr: "₹",   color: "amber",  desc: "Invoices, Payments, Contacts",      tools: 4,  active: isConnected },
                { key: "desk",      label: "Zoho Desk",     abbr: "DSK", color: "rose",   desc: "Tickets, Support Contacts",         tools: 4,  active: isConnected },
                { key: "projects",  label: "Zoho Projects", abbr: "PRJ", color: "orange", desc: "Projects, Tasks, My Tasks",         tools: 4,  active: false },
                { key: "mail",      label: "Zoho Mail",     abbr: "✉",   color: "purple", desc: "Send, Read, Folders",               tools: 4,  active: false },
                { key: "cliq",      label: "Zoho Cliq",     abbr: "CLQ", color: "green",  desc: "Channels, DMs, Users",              tools: 4,  active: false },
                { key: "workdrive", label: "WorkDrive",     abbr: "WD",  color: "indigo", desc: "Files, Folders, Team Folders",      tools: 4,  active: false },
                { key: "people",    label: "Zoho People",   abbr: "HR",  color: "yellow", desc: "Employees, Leave, HR Records",      tools: 3,  active: false },
              ];
              const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
                blue:   { bg: "bg-blue-500/10",   text: "text-blue-600 dark:text-blue-400",   badge: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300" },
                amber:  { bg: "bg-amber-500/10",  text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300" },
                rose:   { bg: "bg-rose-500/10",   text: "text-rose-600 dark:text-rose-400",   badge: "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300" },
                orange: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", badge: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300" },
                purple: { bg: "bg-purple-500/10", text: "text-purple-600 dark:text-purple-400", badge: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300" },
                green:  { bg: "bg-green-500/10",  text: "text-green-600 dark:text-green-400",  badge: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" },
                indigo: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", badge: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300" },
                yellow: { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", badge: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300" },
              };
              return (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {apps.map((app) => {
                    const c = colorMap[app.color];
                    return (
                      <div key={app.key} className={`rounded-lg border bg-card px-3 py-2.5 flex flex-col gap-1.5 relative transition-all ${app.active ? "border-green-500/50 shadow-sm shadow-green-500/10" : "border-border opacity-60"}`}>
                        {app.active && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-green-500" title="Connected" />
                        )}
                        <div className="flex items-center gap-1.5">
                          <div className={`w-5 h-5 rounded ${c.bg} flex items-center justify-center shrink-0`}>
                            <span className={`text-[9px] font-bold ${c.text}`}>{app.abbr}</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground truncate">{app.label}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-tight">{app.desc}</p>
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-[10px] font-medium ${c.text}`}>{app.tools} tools</p>
                          {app.active
                            ? <span className="text-[9px] font-semibold text-green-600 dark:text-green-400">Active</span>
                            : <span className="text-[9px] text-muted-foreground">Not connected</span>
                          }
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Footer note */}
            <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>CRM, Books, and Desk are confirmed active. Additional apps (Projects, Mail, Cliq, WorkDrive, People) can be enabled by upgrading your Zoho plan or activating those products.</span>
            </div>
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

              {/* Enterprise OAuth Override — admin only */}
              {isAdmin && blueprint.authType === "oauth2" && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Use Custom OAuth App</p>
                      <p className="text-xs text-muted-foreground">
                        Override the default Valence OAuth app with your own (for compliance or custom scopes)
                      </p>
                    </div>
                    <Switch
                      checked={!!blueprint.customAuthConfig}
                      onCheckedChange={async (checked) => {
                        if (!checked) {
                          // Clear custom config — revert to Valence default
                          await setCustomAuthConfig({ id: blueprint._id, customAuthConfig: undefined });
                          toast({ title: "Reverted to Default", description: "Using Valence's OAuth app" });
                        } else {
                          // Pre-fill from existing authConfig
                          const existing = JSON.parse(blueprint.authConfig || "{}");
                          setCustomOAuthClientId(existing.clientId || "");
                          setCustomOAuthClientSecret("");
                        }
                      }}
                    />
                  </div>

                  {blueprint.customAuthConfig && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
                        Custom OAuth App Active
                      </p>
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        This blueprint uses your organization's OAuth credentials instead of Valence's defaults.
                      </p>
                    </div>
                  )}

                  {!blueprint.customAuthConfig && !!blueprint.authType && (
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">Custom Client ID</Label>
                        <Input
                          placeholder="Your OAuth App Client ID"
                          value={customOAuthClientId}
                          onChange={(e) => setCustomOAuthClientId(e.target.value)}
                          className="text-sm mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Custom Client Secret</Label>
                        <Input
                          type="password"
                          placeholder="Your OAuth App Client Secret"
                          value={customOAuthClientSecret}
                          onChange={(e) => setCustomOAuthClientSecret(e.target.value)}
                          className="text-sm mt-1"
                        />
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Stored encrypted. Will replace the Valence-managed secret for this integration.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        disabled={!customOAuthClientId || !customOAuthClientSecret || isSavingCustomOAuth}
                        onClick={async () => {
                          setIsSavingCustomOAuth(true);
                          try {
                            const baseConfig = JSON.parse(blueprint.authConfig || "{}");
                            const customConfig = {
                              ...baseConfig,
                              clientId: customOAuthClientId,
                              clientSecret: customOAuthClientSecret,
                            };
                            await setCustomAuthConfig({
                              id: blueprint._id,
                              customAuthConfig: JSON.stringify(customConfig),
                            });
                            toast({ title: "Custom OAuth Saved", description: "Your OAuth credentials are now active" });
                            setCustomOAuthClientId("");
                            setCustomOAuthClientSecret("");
                          } catch (error: any) {
                            toast({ title: "Save Failed", description: error.message, variant: "destructive" });
                          } finally {
                            setIsSavingCustomOAuth(false);
                          }
                        }}
                      >
                        {isSavingCustomOAuth ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Custom OAuth
                      </Button>
                    </div>
                  )}
                </div>
              )}

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
    </DashboardLayout>
  );
}
