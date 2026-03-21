import { useState } from "react";
import { Rocket, ChevronRight, Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { PlatformSelector } from "../components/PlatformSelector";
import { AD_PLATFORMS, CAMPAIGN_OBJECTIVES, BUDGET_TYPES } from "../data/adsPlatforms";
import { ADS_TEMPLATES } from "../data/adsTemplates";

type Step = "platform" | "objective" | "details" | "budget" | "review";

const STEPS: { id: Step; label: string }[] = [
  { id: "platform", label: "Platform" },
  { id: "objective", label: "Objective" },
  { id: "details", label: "Details" },
  { id: "budget", label: "Budget" },
  { id: "review", label: "Review" },
];

interface PushResult {
  platform: string;
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}

export function CampaignBuilder() {
  const { config } = useNiche();
  const { execute, isConnected, loading: pushLoading } = useIntegrationCall();
  const [step, setStep] = useState<Step>("platform");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [objective, setObjective] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [budgetType, setBudgetType] = useState("daily");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pushResults, setPushResults] = useState<PushResult[]>([]);

  const currentStepIndex = STEPS.findIndex((s) => s.id === step);

  const canNext = () => {
    switch (step) {
      case "platform":
        return selectedPlatforms.length > 0;
      case "objective":
        return objective !== "";
      case "details":
        return campaignName.trim() !== "";
      case "budget":
        return budgetAmount !== "" && startDate !== "";
      default:
        return true;
    }
  };

  const handleLaunchWithAI = () => {
    // In production, this triggers the autopilot template
    const template = ADS_TEMPLATES[0]; // Campaign Launch template
    alert(
      `Launching "${template.name}" autopilot with:\n` +
      `Platforms: ${selectedPlatforms.join(", ")}\n` +
      `Objective: ${objective}\n` +
      `Campaign: ${campaignName}\n` +
      `Budget: $${budgetAmount}/${budgetType}`
    );
  };

  const handlePushToPlatform = async () => {
    const campaignPayload = {
      name: campaignName,
      objective,
      budget: parseFloat(budgetAmount),
      budgetType,
      startDate,
      endDate: endDate || undefined,
    };

    const platformSlugs: Record<string, string> = {
      google: "google-ads",
      facebook: "facebook-ads",
      instagram: "facebook-ads",
      tiktok: "tiktok",
    };

    const results: PushResult[] = selectedPlatforms.map((p) => ({
      platform: p,
      status: "loading" as const,
    }));
    setPushResults([...results]);

    for (let i = 0; i < selectedPlatforms.length; i++) {
      const platformId = selectedPlatforms[i];
      const slug = platformSlugs[platformId] ?? platformId;
      try {
        const res = await execute(slug, "create_campaign", campaignPayload);
        results[i] = {
          platform: platformId,
          status: res.success ? "success" : "error",
          message: res.success ? "Campaign created" : (res.error ?? "Failed"),
        };
      } catch (err: any) {
        results[i] = {
          platform: platformId,
          status: "error",
          message: err.message || "Push failed",
        };
      }
      setPushResults([...results]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your ad campaign — AI agents will handle the rest
        </p>
      </div>

      {/* Step Progress */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <button
              onClick={() => i <= currentStepIndex && setStep(s.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                s.id === step
                  ? "text-white"
                  : i < currentStepIndex
                  ? "bg-green-500/10 text-green-500"
                  : "bg-muted text-muted-foreground"
              }`}
              style={s.id === step ? { background: config.accentColor } : undefined}
            >
              <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">
                {i < currentStepIndex ? "✓" : i + 1}
              </span>
              {s.label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="rounded-xl border border-border bg-card p-6">
        {step === "platform" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Select Platforms</h2>
            <p className="text-sm text-muted-foreground">
              Choose where you want to run your ads
            </p>
            <PlatformSelector
              selected={selectedPlatforms}
              onChange={setSelectedPlatforms}
            />
          </div>
        )}

        {step === "objective" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Campaign Objective</h2>
            <p className="text-sm text-muted-foreground">
              What do you want to achieve?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CAMPAIGN_OBJECTIVES.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => setObjective(obj.id)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    objective === obj.id
                      ? "border-2 shadow-sm"
                      : "border-border hover:border-border/80"
                  }`}
                  style={
                    objective === obj.id
                      ? { borderColor: config.accentColor, background: `${config.accentColor}08` }
                      : undefined
                  }
                >
                  <p className="text-sm font-medium text-foreground">{obj.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Campaign Details</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g., Spring Collection Launch"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the campaign goal and target audience..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === "budget" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Budget & Schedule</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground block mb-2">
                  Budget Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {BUDGET_TYPES.map((bt) => (
                    <button
                      key={bt.id}
                      onClick={() => setBudgetType(bt.id)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        budgetType === bt.id
                          ? "border-2 shadow-sm"
                          : "border-border hover:border-border/80"
                      }`}
                      style={
                        budgetType === bt.id
                          ? { borderColor: config.accentColor, background: `${config.accentColor}08` }
                          : undefined
                      }
                    >
                      <p className="text-sm font-medium">{bt.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{bt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground block mb-1.5">
                  {budgetType === "daily" ? "Daily Budget" : "Total Budget"} ($)
                </label>
                <input
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g., 500"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">
                    End Date (optional)
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Review & Launch</h2>
            <div className="space-y-3">
              <div className="flex justify-between px-3 py-2 rounded-lg bg-accent/30">
                <span className="text-sm text-muted-foreground">Platforms</span>
                <span className="text-sm font-medium">
                  {selectedPlatforms.map((p) => AD_PLATFORMS.find((ap) => ap.id === p)?.name).join(", ")}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2 rounded-lg bg-accent/30">
                <span className="text-sm text-muted-foreground">Objective</span>
                <span className="text-sm font-medium capitalize">{objective}</span>
              </div>
              <div className="flex justify-between px-3 py-2 rounded-lg bg-accent/30">
                <span className="text-sm text-muted-foreground">Campaign</span>
                <span className="text-sm font-medium">{campaignName}</span>
              </div>
              <div className="flex justify-between px-3 py-2 rounded-lg bg-accent/30">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="text-sm font-medium">
                  ${budgetAmount}/{budgetType === "daily" ? "day" : "total"}
                </span>
              </div>
              <div className="flex justify-between px-3 py-2 rounded-lg bg-accent/30">
                <span className="text-sm text-muted-foreground">Schedule</span>
                <span className="text-sm font-medium">
                  {startDate} {endDate ? `→ ${endDate}` : "(ongoing)"}
                </span>
              </div>
            </div>

            {/* Push to Platform Results */}
            {pushResults.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-sm font-medium text-foreground">Push Status</h3>
                {pushResults.map((pr) => {
                  const platform = AD_PLATFORMS.find((ap) => ap.id === pr.platform);
                  return (
                    <div
                      key={pr.platform}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-accent/20"
                    >
                      <span className="text-sm">{platform?.icon ?? pr.platform}</span>
                      <span className="text-xs font-medium text-foreground flex-1">
                        {platform?.name ?? pr.platform}
                      </span>
                      {pr.status === "loading" && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                      )}
                      {pr.status === "success" && (
                        <span className="flex items-center gap-1 text-xs text-green-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {pr.message}
                        </span>
                      )}
                      {pr.status === "error" && (
                        <span className="flex items-center gap-1 text-xs text-red-400">
                          <XCircle className="w-3.5 h-3.5" />
                          {pr.message}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(STEPS[currentStepIndex - 1]?.id ?? "platform")}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors ${
            currentStepIndex === 0 ? "invisible" : ""
          }`}
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          {step === "review" ? (
            <>
              <button
                onClick={handlePushToPlatform}
                disabled={pushLoading || pushResults.some((r) => r.status === "loading")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-accent/30 transition-colors disabled:opacity-50"
              >
                {pushResults.some((r) => r.status === "loading") ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Push to Platform
              </button>
              <button
                onClick={handleLaunchWithAI}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
                style={{ background: config.accentColor }}
              >
                <Rocket className="w-4 h-4" />
                Launch with AI Agents
              </button>
            </>
          ) : (
            <button
              onClick={() => setStep(STEPS[currentStepIndex + 1]?.id ?? "review")}
              disabled={!canNext()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: config.accentColor }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
