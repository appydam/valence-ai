import { useState } from "react";
import {
  Rocket,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  Sparkles,
  Database,
  Mail,
  Shield,
  Loader2,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useIntegrationCall } from "../../framework/useIntegrationCall";
import { useOutboundMission } from "../hooks/useOutboundMission";
import { useOutboundPipeline } from "../hooks/useOutboundPipeline";

const CHECKLIST_ITEMS = [
  { key: "apollo", label: "Apollo connected (contact discovery)", icon: Users, integration: "apollo" },
  { key: "clay", label: "Clay connected (enrichment)", icon: Sparkles, integration: "clay" },
  { key: "hubspot", label: "HubSpot connected (CRM)", icon: Database, integration: "hubspot" },
  { key: "lgm", label: "LaGrowthMachine connected (LinkedIn)", icon: Mail, integration: "lagrowthmachine" },
];

export function CampaignLauncher() {
  const { config } = useNiche();
  const { isConnected } = useIntegrationCall();
  const { launchFullPipeline, loading: launching } = useOutboundMission();
  const { totalTasks, completedTasks, activeTasks } = useOutboundPipeline();
  const [prompt, setPrompt] = useState("");
  const [launched, setLaunched] = useState(false);

  const readyItems = CHECKLIST_ITEMS.filter((item) => isConnected(item.integration));
  const requiredReady = isConnected("apollo") && isConnected("hubspot");

  const handleLaunch = async () => {
    if (!prompt.trim() || launching) return;
    const result = await launchFullPipeline(prompt.trim());
    if (result.success) {
      setLaunched(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: `${config.accentColor}20` }}
        >
          <Rocket className="w-8 h-8" style={{ color: config.accentColor }} />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Launch Campaign</h1>
        <p className="text-sm text-muted-foreground mt-1">
          One prompt. Full pipeline. Companies → Contacts → Enriched → CRM → Sequences.
        </p>
      </div>

      {/* Readiness checklist */}
      <div className="space-y-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Integration Readiness
        </h2>
        {CHECKLIST_ITEMS.map((item) => {
          const Icon = item.icon;
          const ready = isConnected(item.integration);
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                ready ? "border-green-500/30 bg-green-500/5" : "border-border/30 bg-card"
              }`}
            >
              {ready ? (
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${ready ? "text-foreground/70" : "text-muted-foreground/30"}`} />
              <span className={`text-sm ${ready ? "text-foreground" : "text-muted-foreground/50"}`}>
                {item.label}
              </span>
            </div>
          );
        })}
        <p className="text-[10px] text-muted-foreground/40 mt-1">
          {readyItems.length}/{CHECKLIST_ITEMS.length} integrations connected · Apollo + HubSpot required
        </p>
      </div>

      {/* Pipeline status */}
      {totalTasks > 0 && (
        <div className="p-4 rounded-xl border border-border/50 bg-card">
          <h3 className="text-xs font-semibold text-muted-foreground mb-2">Current Pipeline</h3>
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-bold text-foreground">{totalTasks}</p>
              <p className="text-[10px] text-muted-foreground">Total</p>
            </div>
            <div>
              <p className="text-lg font-bold text-green-500">{completedTasks}</p>
              <p className="text-[10px] text-muted-foreground">Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-400">{activeTasks}</p>
              <p className="text-[10px] text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Launch prompt */}
      {!launched ? (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='Describe your target audience, e.g., "Series B fintech companies in the US, 50-200 employees. Target VP Ops and RevOps leaders. 4-step email + LinkedIn connection sequence."'
            className="w-full h-32 px-4 py-3 rounded-xl border border-border/50 bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-blue-500/50 resize-none"
          />
          <button
            onClick={handleLaunch}
            disabled={!prompt.trim() || launching || !requiredReady}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-white font-semibold text-lg transition-all disabled:opacity-30 hover:shadow-lg hover:scale-[1.01]"
            style={{ background: requiredReady ? config.accentColor : "hsl(0,0%,25%)" }}
          >
            {launching ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Launching pipeline...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                Launch Full Pipeline
              </>
            )}
          </button>
          {!requiredReady && (
            <p className="text-xs text-red-400 text-center">Connect Apollo and HubSpot to launch</p>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">Pipeline Launched!</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Kaze is orchestrating your agents. Check the Pipeline page to watch progress.
          </p>
          <button
            onClick={() => { setLaunched(false); setPrompt(""); }}
            className="text-sm font-medium hover:underline"
            style={{ color: config.accentColor }}
          >
            Launch another campaign
          </button>
        </div>
      )}
    </div>
  );
}
