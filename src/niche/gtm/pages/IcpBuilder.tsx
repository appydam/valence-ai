import { useState } from "react";
import { Target, Plus, X, Sparkles, Save, Users } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { IcpScorecard } from "../components/IcpScorecard";

const INDUSTRY_OPTIONS = [
  "SaaS", "Fintech", "Healthtech", "E-commerce", "DevTools", "Cybersecurity", "AI/ML", "EdTech", "Martech",
];

const COMPANY_SIZE_OPTIONS = [
  "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+",
];

const REVENUE_OPTIONS = [
  "Pre-revenue", "$0-$1M", "$1M-$10M", "$10M-$50M", "$50M-$100M", "$100M+",
];

const FUNDING_OPTIONS = [
  "Bootstrapped", "Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Public",
];

const ROLE_OPTIONS = [
  "CEO/Founder", "CTO", "VP Engineering", "VP Sales", "VP Marketing", "Head of Growth", "Director of Ops", "Product Manager",
];

const SENIORITY_OPTIONS = ["C-Level", "VP", "Director", "Manager", "IC Lead"];

const DEPARTMENT_OPTIONS = ["Engineering", "Sales", "Marketing", "Product", "Operations", "Finance"];

const TECH_SIGNALS = [
  "Uses Segment", "Uses Salesforce", "React in GitHub", "Kubernetes in job posts",
  "HubSpot on website", "Stripe integration", "AWS infrastructure", "Uses Snowflake",
];

const SAVED_ICPS = [
  { name: "Series A SaaS — VP Engineering", score: 87, audience: "12,400" },
  { name: "Fintech Growth Leaders", score: 72, audience: "8,200" },
];

export function IcpBuilder() {
  const { config } = useNiche();
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["SaaS", "DevTools"]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(["51-200", "201-500"]);
  const [selectedRevenue, setSelectedRevenue] = useState<string[]>(["$1M-$10M", "$10M-$50M"]);
  const [selectedFunding, setSelectedFunding] = useState<string[]>(["Series A", "Series B"]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["VP Engineering", "CTO"]);
  const [selectedSeniority, setSelectedSeniority] = useState<string[]>(["C-Level", "VP"]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(["Engineering"]);
  const [selectedTechSignals, setSelectedTechSignals] = useState<string[]>(["Uses Segment"]);

  const [weights, setWeights] = useState({
    industry: 80,
    companySize: 70,
    revenue: 60,
    funding: 75,
    role: 90,
    seniority: 85,
    department: 50,
    techSignals: 65,
  });

  const estimatedAudience = Math.round(
    (selectedIndustries.length * 2200 +
      selectedSizes.length * 1800 +
      selectedRoles.length * 1400) *
      (1 + selectedTechSignals.length * 0.1)
  );

  const overallScore = Math.round(
    Object.values(weights).reduce((a, b) => a + b, 0) / Object.values(weights).length
  );

  const toggleItem = (
    item: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(selected.includes(item) ? selected.filter((s) => s !== item) : [...selected, item]);
  };

  const renderChipSelector = (
    label: string,
    options: string[],
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => (
    <div>
      <label className="text-xs font-medium text-muted-foreground block mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => toggleItem(option, selected, setter)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSelected
                  ? "border-transparent text-white"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
              style={isSelected ? { background: config.accentColor } : undefined}
            >
              {isSelected ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderWeightSlider = (label: string, key: keyof typeof weights) => (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-24 shrink-0">{label}</span>
      <input
        type="range"
        min={0}
        max={100}
        value={weights[key]}
        onChange={(e) => setWeights({ ...weights, [key]: Number(e.target.value) })}
        className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${config.accentColor} ${weights[key]}%, hsl(0,0%,20%) ${weights[key]}%)`,
        }}
      />
      <span className="text-xs font-medium text-foreground w-8 text-right">{weights[key]}%</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">ICP Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define your Ideal Customer Profile to target the right leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-4 h-4" />
            AI Suggest
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: config.accentColor }}
          >
            <Save className="w-4 h-4" />
            Save ICP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Criteria Builder */}
        <div className="lg:col-span-2 space-y-4">
          {/* Company Criteria */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: config.accentColor }} />
              Company Criteria
            </h2>
            {renderChipSelector("Industry", INDUSTRY_OPTIONS, selectedIndustries, setSelectedIndustries)}
            {renderChipSelector("Company Size", COMPANY_SIZE_OPTIONS, selectedSizes, setSelectedSizes)}
            {renderChipSelector("Revenue", REVENUE_OPTIONS, selectedRevenue, setSelectedRevenue)}
            {renderChipSelector("Funding Stage", FUNDING_OPTIONS, selectedFunding, setSelectedFunding)}
          </div>

          {/* Contact Criteria */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: config.accentColor }} />
              Contact Criteria
            </h2>
            {renderChipSelector("Role / Title", ROLE_OPTIONS, selectedRoles, setSelectedRoles)}
            {renderChipSelector("Seniority", SENIORITY_OPTIONS, selectedSeniority, setSelectedSeniority)}
            {renderChipSelector("Department", DEPARTMENT_OPTIONS, selectedDepartments, setSelectedDepartments)}
          </div>

          {/* Tech Stack Signals */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
              Tech Stack Signals
            </h2>
            {renderChipSelector("Signals", TECH_SIGNALS, selectedTechSignals, setSelectedTechSignals)}
          </div>

          {/* Scoring Weights */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold">Scoring Weights</h2>
            {renderWeightSlider("Industry", "industry")}
            {renderWeightSlider("Company Size", "companySize")}
            {renderWeightSlider("Revenue", "revenue")}
            {renderWeightSlider("Funding Stage", "funding")}
            {renderWeightSlider("Role", "role")}
            {renderWeightSlider("Seniority", "seniority")}
            {renderWeightSlider("Department", "department")}
            {renderWeightSlider("Tech Signals", "techSignals")}
          </div>
        </div>

        {/* Right — Preview Panel */}
        <div className="space-y-4">
          {/* Estimated Audience */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold text-foreground">Estimated Audience</h2>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-foreground">{estimatedAudience.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">matching leads</p>
            </div>
            <IcpScorecard score={overallScore} />
          </div>

          {/* Saved ICPs */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Saved ICPs</h2>
            {SAVED_ICPS.map((icp) => (
              <div
                key={icp.name}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{icp.name}</p>
                  <p className="text-xs text-muted-foreground">{icp.audience} leads</p>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${config.accentColor}15`,
                    color: config.accentColor,
                  }}
                >
                  {icp.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
