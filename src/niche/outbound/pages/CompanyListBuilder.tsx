import { useState } from "react";
import { Building2, Sparkles, Send, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { CsvUploader } from "../components/CsvUploader";
import { CompanyTable } from "../components/CompanyTable";
import { useCsvImport } from "../hooks/useCsvImport";

export function CompanyListBuilder() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { headers, rows, errors, fileName, loading: csvLoading, parseFile, clear } = useCsvImport();
  const [prompt, setPrompt] = useState("");

  const handleAiSource = async () => {
    if (!prompt.trim() || agentLoading) return;
    const text = prompt.trim();
    setPrompt("");

    await triggerAgent(
      "Scout",
      `Source companies: ${text.length > 60 ? text.slice(0, 60) + "..." : text}`,
      `User request from AI Outbound Engine — Company Sourcing:\n\n"${text}"\n\nIMPORTANT: Do NOT waste Apollo credits on company search. Use FREE web sources:\n- Crunchbase (web_fetch crunchbase.com/search)\n- Google search: "series B SaaS" + "company" + specific filters\n- TechCrunch, ProductHunt for startup lists\n- LinkedIn company pages\n- Industry directories and lists\n\nYou CAN use Apollo organization_enrich (by domain) to enrich companies you've already found — that endpoint is free.\n\nReturn a structured list with: company name, domain, industry, employee count, funding stage, and location. Deliver as a formatted table.`,
      ["niche:outbound", "stage:companies"],
      { priority: "high" }
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Companies</h1>
        <p className="text-sm text-muted-foreground">Upload a CSV or let Scout source companies with Apollo</p>
      </div>

      {/* CSV Upload */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Upload Company List
        </h2>
        <CsvUploader onFileSelect={parseFile} fileName={fileName} onClear={clear} />
        {errors.length > 0 && (
          <div className="space-y-1">
            {errors.slice(0, 5).map((err, i) => (
              <p key={i} className="text-xs text-red-400">{err}</p>
            ))}
          </div>
        )}
      </div>

      {/* AI Source */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
          Or let AI source companies
        </h2>
        <div
          className="rounded-xl border bg-card flex items-center gap-2 px-4 py-3"
          style={{ borderColor: prompt ? config.accentColor : "hsl(0,0%,18%)" }}
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAiSource()}
            placeholder='e.g., "50 Series B SaaS companies in the US with 50-200 employees"'
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
          />
          <button
            onClick={handleAiSource}
            disabled={!prompt.trim() || agentLoading}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-white transition-all disabled:opacity-30"
            style={{ background: config.accentColor }}
          >
            {agentLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["50 Series B SaaS in US", "20 fintech startups in Europe", "30 e-commerce brands with $5M+ funding"].map((s) => (
            <button
              key={s}
              onClick={() => setPrompt(s)}
              className="px-2.5 py-1 rounded-full border border-border/40 text-[10px] text-muted-foreground/60 hover:text-foreground hover:border-border transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table display */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {rows.length} companies loaded
            </h2>
          </div>
          <CompanyTable headers={headers} rows={rows} />
        </div>
      )}
    </div>
  );
}
