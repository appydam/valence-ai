import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Code, Edit, CheckCircle2, ArrowLeft } from "lucide-react";
import { useDocScraper } from "@/hooks/useDocScraper";
import { useCurrentUserId } from "@/hooks/useCurrentUserId";
import { apiPost } from "@/lib/api";
import { DashboardLayout } from "@/components/DashboardLayout";

type AuthType = "oauth2" | "api_key" | "bearer_token" | "basic_auth" | "none";
type SourceType = "manual" | "ai_scraped" | "openapi_import";

interface BlueprintForm {
  slug: string;
  name: string;
  description: string;
  category: string;
  authType: AuthType;
  authConfig: string;
  baseUrl: string;
  defaultHeaders: string;
  sourceType: SourceType;
  sourceUrl?: string;
  iconUrl?: string;
}

export default function BlueprintWizard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const userId = useCurrentUserId();
  const { startScrape, isProcessing, job, blueprintId, error: scraperError } = useDocScraper();

  const [step, setStep] = useState(1);
  const [sourceType, setSourceType] = useState<SourceType>("manual");
  const [docUrl, setDocUrl] = useState("");

  // Pre-fill form from URL params (from template catalog)
  const prefilledName = searchParams.get("name") || "";
  const prefilledCategory = searchParams.get("category") || "Other";

  const [form, setForm] = useState<BlueprintForm>({
    slug: "",
    name: prefilledName,
    description: "",
    category: prefilledCategory,
    authType: "api_key",
    authConfig: JSON.stringify({ headerName: "X-API-Key" }, null, 2),
    baseUrl: "",
    defaultHeaders: "{}",
    sourceType: "manual",
  });

  const updateForm = (updates: Partial<BlueprintForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  // Auto-navigate when blueprint is created
  useEffect(() => {
    if (blueprintId) {
      toast({
        title: "Blueprint Created!",
        description: job?.toolCount ? `Successfully created with ${job.toolCount} tools` : "Blueprint created successfully",
      });
      navigate(`/integrations/blueprint/${blueprintId}`);
    }
  }, [blueprintId, navigate, toast, job]);

  // Show error toasts
  useEffect(() => {
    if (scraperError) {
      toast({
        title: "Scraping Failed",
        description: scraperError,
        variant: "destructive",
      });
    }
  }, [scraperError, toast]);

  const handleDocScrape = async () => {
    if (!docUrl) {
      toast({
        title: "URL Required",
        description: "Please enter an API documentation URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await startScrape(docUrl, {
        suggestedName: form.name || undefined,
        suggestedCategory: form.category !== "Other" ? form.category : undefined,
      });

      if (result.blueprintId) {
        // OpenAPI spec - completed immediately
        toast({
          title: "Blueprint Created!",
          description: `Successfully imported OpenAPI spec with ${result.toolCount} tools`,
        });
        navigate(`/integrations/blueprint/${result.blueprintId}`);
      } else if (result.jobId) {
        // HTML docs - needs AI analysis, show progress UI
        toast({
          title: "Analysis Started",
          description: "AI agent is analyzing the documentation...",
        });
      }
    } catch (error: any) {
      // Error toast handled by useEffect above
    }
  };

  const handleCreateBlueprint = async () => {
    try {
      const result = await apiPost("/api/integrations/blueprints", {
        ...form,
        createdBy: userId,
      });

      if (result.id) {
        toast({
          title: "Blueprint Created!",
          description: `${form.name} is now available`,
        });
        navigate(`/integrations/blueprint/${result.id}`);
      } else {
        throw new Error("Failed to create blueprint");
      }
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <DashboardLayout>
    <div className="container max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate("/integrations")} className="mb-4 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Integrations
        </Button>
        <h1 className="text-3xl font-bold">Create Integration Blueprint</h1>
        <p className="text-muted-foreground mt-2">
          Add a new API integration to your agent toolkit
        </p>
      </div>

      <Tabs value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ai_scraped">
            <Upload className="w-4 h-4 mr-2" />
            Paste API Docs URL
          </TabsTrigger>
          <TabsTrigger value="openapi_import">
            <Code className="w-4 h-4 mr-2" />
            Import OpenAPI Spec
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Edit className="w-4 h-4 mr-2" />
            Create Manually
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai_scraped" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Doc Scraping</CardTitle>
              <CardDescription>
                Paste any API documentation URL and our AI will extract the blueprint and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="docUrl">Documentation URL</Label>
                <Input
                  id="docUrl"
                  placeholder="https://api.example.com/docs"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="suggestedName">Suggested Name (Optional)</Label>
                  <Input
                    id="suggestedName"
                    placeholder="Example API"
                    value={form.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="suggestedCategory">Suggested Category (Optional)</Label>
                  <Select value={form.category} onValueChange={(v) => updateForm({ category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRM">CRM</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="File Storage">File Storage</SelectItem>
                      <SelectItem value="Project Management">Project Management</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {job && isProcessing && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">
                      {job.status === "scraping" && "Fetching documentation..."}
                      {job.status === "analyzing" && "Agent analyzing API structure..."}
                      {job.status === "pending" && "Preparing analysis..."}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This may take 30 seconds to 2 minutes depending on the documentation size.
                  </p>
                </div>
              )}

              <Button
                onClick={handleDocScrape}
                disabled={isProcessing || !docUrl}
                className="w-full"
              >
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isProcessing ? "Analyzing Documentation..." : "Start AI Analysis"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openapi_import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Import OpenAPI Specification</CardTitle>
              <CardDescription>
                Paste the URL to an OpenAPI/Swagger spec for instant blueprint generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openApiUrl">OpenAPI Spec URL</Label>
                <Input
                  id="openApiUrl"
                  placeholder="https://api.example.com/openapi.json"
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Must be a valid OpenAPI 3.x or Swagger 2.x JSON/YAML file
                </p>
              </div>

              <Button
                onClick={handleDocScrape}
                disabled={isProcessing || !docUrl}
                className="w-full"
              >
                {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isProcessing ? "Importing Spec..." : "Import OpenAPI Spec"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blueprint Details</CardTitle>
              <CardDescription>Define the API service configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Service Name</Label>
                  <Input
                    id="name"
                    placeholder="Example API"
                    value={form.name}
                    onChange={(e) => {
                      updateForm({ name: e.target.value, slug: generateSlug(e.target.value) });
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (Auto-generated)</Label>
                  <Input id="slug" value={form.slug} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What this API does in one sentence"
                  value={form.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.category} onValueChange={(v) => updateForm({ category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRM">CRM</SelectItem>
                      <SelectItem value="Communication">Communication</SelectItem>
                      <SelectItem value="File Storage">File Storage</SelectItem>
                      <SelectItem value="Project Management">Project Management</SelectItem>
                      <SelectItem value="Analytics">Analytics</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="authType">Authentication Type</Label>
                  <Select value={form.authType} onValueChange={(v) => updateForm({ authType: v as AuthType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api_key">API Key</SelectItem>
                      <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                      <SelectItem value="bearer_token">Bearer Token</SelectItem>
                      <SelectItem value="basic_auth">Basic Auth</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://api.example.com/v1"
                  value={form.baseUrl}
                  onChange={(e) => updateForm({ baseUrl: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="authConfig">Auth Configuration (JSON)</Label>
                <Textarea
                  id="authConfig"
                  placeholder='{"headerName": "X-API-Key"}'
                  value={form.authConfig}
                  onChange={(e) => updateForm({ authConfig: e.target.value })}
                  className="font-mono text-sm"
                  rows={6}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  For API keys: {`{"headerName": "X-API-Key"}`}<br />
                  For OAuth: {`{"clientId": "...", "clientSecret": "...", "authorizeUrl": "...", "tokenUrl": "...", "scopes": ["read", "write"]}`}
                </p>
              </div>

              <Button
                onClick={handleCreateBlueprint}
                disabled={!form.name || !form.slug || !form.baseUrl}
                className="w-full"
              >
                Create Blueprint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </DashboardLayout>
  );
}
