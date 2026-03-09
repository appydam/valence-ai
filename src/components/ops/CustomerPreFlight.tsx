import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PlanSelector } from "./PlanSelector";
import {
  ArrowLeft, Rocket, UserPlus, Building2, Globe, Mail,
  User, Briefcase, HardDrive, MapPin, Key, StickyNote, Import,
} from "lucide-react";

type Plan = "business" | "enterprise" | "enterprise_plus";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function CustomerPreFlight({ onBack, onCreated }: { onBack: () => void; onCreated: (slug: string) => void }) {
  const createProvisioning = useMutation(api.customerProvisioning.create);
  const pilotInterests = useQuery(api.customerProvisioning.listPilotInterests);

  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [domain, setDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [plan, setPlan] = useState<Plan>("business");
  const [deploymentModel, setDeploymentModel] = useState<"cloud" | "onprem">("cloud");
  const [anthropicKeyPref, setAnthropicKeyPref] = useState<"we_provide" | "customer_provides">("we_provide");
  const [serverSize, setServerSize] = useState("small_2_0");
  const [serverRegion, setServerRegion] = useState("ap-south-1");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCompanyNameChange = (v: string) => {
    setCompanyName(v);
    if (!slugEdited) {
      const s = slugify(v);
      setSlug(s);
      setDomain(`${s}.valence.ai`);
    }
  };

  const handleSlugChange = (v: string) => {
    setSlug(v);
    setSlugEdited(true);
    setDomain(`${v}.valence.ai`);
  };

  const handlePlanSelect = (p: Plan, dep: "cloud" | "onprem") => {
    setPlan(p);
    setDeploymentModel(dep);
  };

  const handleImport = (interest: { name: string; email: string; company: string; role?: string; useCase?: string }) => {
    setCompanyName(interest.company);
    setAdminEmail(interest.email);
    setContactName(interest.name);
    setContactRole(interest.role ?? "");
    setNotes(interest.useCase ?? "");
    const s = slugify(interest.company);
    setSlug(s);
    setDomain(`${s}.valence.ai`);
  };

  const handleCreate = async () => {
    if (!companyName.trim() || !slug.trim() || !adminEmail.trim()) {
      setError("Company name, slug, and admin email are required.");
      return;
    }
    setCreating(true);
    setError("");
    try {
      await createProvisioning({
        slug: slug.trim(),
        companyName: companyName.trim(),
        domain: domain.trim() || `${slug.trim()}.valence.ai`,
        adminEmail: adminEmail.trim(),
        plan,
        deploymentModel,
        contactName: contactName.trim() || undefined,
        contactRole: contactRole.trim() || undefined,
        anthropicKeyPreference: anthropicKeyPref,
        serverSize: deploymentModel === "cloud" ? serverSize : undefined,
        serverRegion: deploymentModel === "cloud" ? serverRegion : undefined,
        notes: notes.trim() || undefined,
      });
      onCreated(slug.trim());
    } catch (err: any) {
      setError(err.message || "Failed to create");
    }
    setCreating(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            New Customer Pre-Flight
          </h2>
          <p className="text-xs text-muted-foreground">Collect client info before provisioning</p>
        </div>
      </div>

      {/* Import from pilot interest */}
      {pilotInterests && pilotInterests.length > 0 && (
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Import className="w-3.5 h-3.5 text-primary" />
            Import from Pilot Interest
          </h3>
          <div className="flex flex-wrap gap-2">
            {pilotInterests.map((pi) => (
              <button
                key={pi._id}
                onClick={() => handleImport(pi)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs hover:bg-accent/50 transition-colors"
              >
                <UserPlus className="w-3 h-3 text-muted-foreground" />
                <span className="font-medium text-foreground">{pi.company}</span>
                <span className="text-muted-foreground">({pi.name})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Plan selector */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Select Plan</h3>
        <PlanSelector selected={plan} onSelect={handlePlanSelect} />
      </div>

      {/* Customer info form */}
      <div className="rounded-xl border bg-card p-4 space-y-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Customer Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => handleCompanyNameChange(e.target.value)}
              placeholder="Acme Corp"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Slug
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="acme"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm font-mono text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="acme.valence.ai"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Admin Email *
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="cto@acme.com"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <User className="w-3 h-3" /> Contact Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Contact Role
            </label>
            <input
              type="text"
              value={contactRole}
              onChange={(e) => setContactRole(e.target.value)}
              placeholder="CTO"
              className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Deployment options (cloud only) */}
      {deploymentModel === "cloud" && (
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Server Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> Server Size
              </label>
              <select
                value={serverSize}
                onChange={(e) => setServerSize(e.target.value)}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="small_2_0">Small — 2GB RAM, 2 vCPU (~$12/mo)</option>
                <option value="medium_2_0">Medium — 4GB RAM, 2 vCPU (~$24/mo)</option>
                <option value="large_2_0">Large — 8GB RAM, 2 vCPU (~$48/mo)</option>
                <option value="xlarge_2_0">XL — 16GB RAM, 4 vCPU (~$84/mo)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Server Region
              </label>
              <select
                value={serverRegion}
                onChange={(e) => setServerRegion(e.target.value)}
                className="w-full bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="ap-south-1">Mumbai (ap-south-1)</option>
                <option value="us-east-1">N. Virginia (us-east-1)</option>
                <option value="us-west-2">Oregon (us-west-2)</option>
                <option value="eu-west-1">Ireland (eu-west-1)</option>
                <option value="ap-southeast-1">Singapore (ap-southeast-1)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* API key preference */}
      <div className="rounded-xl border bg-card p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Key className="w-3.5 h-3.5" /> Anthropic API Key
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setAnthropicKeyPref("we_provide")}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              anthropicKeyPref === "we_provide" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <p className="text-sm font-medium text-foreground">We Provide</p>
            <p className="text-xs text-muted-foreground">Use our shared Anthropic key</p>
          </button>
          <button
            onClick={() => setAnthropicKeyPref("customer_provides")}
            className={`rounded-lg border-2 p-3 text-left transition-all ${
              anthropicKeyPref === "customer_provides" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <p className="text-sm font-medium text-foreground">Customer Provides</p>
            <p className="text-xs text-muted-foreground">Client uses their own key</p>
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border bg-card p-4 space-y-2">
        <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <StickyNote className="w-3 h-3" /> Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special requirements, compliance needs, integration preferences..."
          className="w-full h-20 bg-secondary rounded-lg px-3 py-2 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
          <p className="text-xs text-red-500">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={creating || !companyName.trim() || !slug.trim() || !adminEmail.trim()}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
        >
          <Rocket className="w-4 h-4" />
          {creating ? "Creating..." : "Start Provisioning"}
        </button>
      </div>
    </div>
  );
}
