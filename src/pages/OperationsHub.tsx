import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Shield,
  Rocket,
  Cloud,
  Building2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Terminal,
  FileText,
  Key,
  Globe,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  BookOpen,
  Wrench,
  RefreshCw,
  Trash2,
  Package,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Clipboard helper
// ─────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// ─────────────────────────────────────────────────
// Collapsible Section
// ─────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-accent/30 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
        {badge && (
          <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Command Block
// ─────────────────────────────────────────────────
function CommandBlock({ label, command }: { label?: string; command: string }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-start gap-2 bg-background border rounded-lg px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
        <pre className="flex-1 whitespace-pre-wrap break-all">{command}</pre>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Step Card
// ─────────────────────────────────────────────────
function StepCard({
  step,
  title,
  type,
  children,
}: {
  step: number;
  title: string;
  type: "auto" | "manual" | "semi";
  children: React.ReactNode;
}) {
  const typeColors = {
    auto: "bg-green-500/10 text-green-500 border-green-500/30",
    manual: "bg-yellow-500/10 text-yellow-500 border-yellow-500/30",
    semi: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  };
  const typeLabels = { auto: "Automatic", manual: "Manual", semi: "Semi-auto" };
  return (
    <div className="relative pl-8 pb-6 border-l-2 border-border/50 last:border-0 last:pb-0">
      <div className="absolute -left-3.5 top-0 w-7 h-7 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
        <span className="text-xs font-bold text-primary">{step}</span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${typeColors[type]}`}>
            {typeLabels[type]}
          </span>
        </div>
        <div className="text-sm text-muted-foreground space-y-2">{children}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Info Table
// ─────────────────────────────────────────────────
function InfoTable({ rows }: { rows: { label: string; value: string; copy?: boolean }[] }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-accent/20"}>
              <td className="px-3 py-2 font-medium text-foreground w-1/3">{row.label}</td>
              <td className="px-3 py-2 text-muted-foreground font-mono">
                <span className="break-all">{row.value}</span>
                {row.copy && <CopyButton text={row.value} />}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────
// External Link Row
// ─────────────────────────────────────────────────
function LinkRow({ label, url, description }: { label: string; url: string; description?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border hover:bg-accent/30 transition-colors group"
    >
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary">{label}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
    </a>
  );
}

// ═════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════
export default function OperationsHub() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const [deploymentModel, setDeploymentModel] = useState<"cloud" | "onprem">("cloud");

  if (currentUser && currentUser.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-2">
            <Shield className="w-12 h-12 text-muted-foreground mx-auto" />
            <h2 className="text-lg font-semibold text-foreground">Admin Access Required</h2>
            <p className="text-sm text-muted-foreground">This page is restricted to administrators.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (currentUser === undefined) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Rocket className="w-6 h-6 text-primary" />
            Enterprise Onboarding Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Step-by-step guide for provisioning new customers — everything in one place.
          </p>
        </div>

        {/* Deployment Model Toggle */}
        <div className="rounded-xl border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider">
            Choose Deployment Model
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setDeploymentModel("cloud")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                deploymentModel === "cloud"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Cloud className={`w-6 h-6 ${deploymentModel === "cloud" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold text-foreground">Cloud (We Host Everything)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Separate Convex + Vercel + Lightsail per customer. We manage the full stack.
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">~$22-160/mo</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">Best for startups</span>
              </div>
            </button>
            <button
              onClick={() => setDeploymentModel("onprem")}
              className={`rounded-xl border-2 p-4 text-left transition-all ${
                deploymentModel === "onprem"
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Building2 className={`w-6 h-6 ${deploymentModel === "onprem" ? "text-primary" : "text-muted-foreground"}`} />
                <span className="text-sm font-semibold text-foreground">On-Prem Hybrid</span>
              </div>
              <p className="text-xs text-muted-foreground">
                We host dashboard + backend. Customer hosts agent server on their infra.
              </p>
              <div className="mt-3 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">~$0-45/mo to us</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-muted-foreground">Enterprise / security-sensitive</span>
              </div>
            </button>
          </div>
        </div>

        {/* ─── PREREQUISITES ───────────────────────── */}
        <Section title="Prerequisites" icon={Wrench} badge="Before you start">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoTable
              rows={[
                { label: "AWS CLI", value: "aws configure (Lightsail access)" },
                { label: "Vercel CLI", value: "npm i -g vercel", copy: true },
                { label: "Convex CLI", value: "npx convex (bundled)", copy: false },
                { label: "Node.js", value: "v20+ required" },
              ]}
            />
            <InfoTable
              rows={[
                { label: "Clerk Dashboard", value: "Auth provider setup" },
                { label: "Anthropic API Key", value: "For doc scraper + agents" },
                { label: "OAuth Apps", value: "GitHub, Slack, Google, etc." },
                { label: "SSH Key Access", value: "deployment-scripts/keys/" },
              ]}
            />
          </div>
        </Section>

        {/* ─── PROVISIONING STEPS ──────────────────── */}
        <Section title={`Provisioning Steps (${deploymentModel === "cloud" ? "Cloud" : "On-Prem"})`} icon={Rocket} defaultOpen badge="8 Steps">
          {/* Step 0: Run the script */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
            <p className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Quick Start Command
            </p>
            {deploymentModel === "cloud" ? (
              <CommandBlock
                command={`cd agent-orchestrator/deployment-scripts\n./provision-customer.sh <slug> <domain> <admin-email> [plan]`}
              />
            ) : (
              <CommandBlock
                command={`cd agent-orchestrator/deployment-scripts\n./provision-customer.sh <slug> <domain> <admin-email> --no-server`}
              />
            )}
            <p className="text-xs text-muted-foreground">
              Example: <code className="bg-accent px-1 rounded">./provision-customer.sh acme acme.valence.ai cto@acme.com pro</code>
            </p>
          </div>

          <div className="space-y-0 mt-4">
            <StepCard step={1} title="Create Convex Project" type="manual">
              <p>Go to Convex Dashboard and create a new project named <code className="bg-accent px-1 rounded text-xs">valence-{"<slug>"}</code>.</p>
              <LinkRow label="Convex Dashboard" url="https://dashboard.convex.dev" description="Create project → copy deployment URL" />
              <p className="text-xs">Copy both the deployment URL (<code>.convex.cloud</code>) and the site URL (<code>.convex.site</code>).</p>
            </StepCard>

            <StepCard step={2} title="Deploy Schema + Functions" type="auto">
              <p>The provisioning script runs this automatically:</p>
              <CommandBlock command={`npx convex deploy --project valence-<slug> --typecheck=disable`} />
            </StepCard>

            <StepCard step={3} title="Set Environment Variables" type="auto">
              <p>Uses <code className="bg-accent px-1 rounded text-xs">env-template.convex</code> — auto-generates encryption keys.</p>
              <InfoTable
                rows={[
                  { label: "ALLOWED_ORIGIN", value: "https://<domain>" },
                  { label: "INTEGRATION_ENCRYPTION_KEY", value: "Auto-generated (AES-256-GCM)" },
                  { label: "CLERK_JWT_ISSUER_DOMAIN", value: "https://clerk.valence.ai" },
                  { label: "SSH_PROXY_URL", value: "http://<lightsail-ip>:3001 (on agent server)" },
                  { label: "SSH_PROXY_SECRET", value: "Auto-generated" },
                  { label: "ANTHROPIC_API_KEY", value: "From Anthropic console" },
                  { label: "AGENT_WAKEUP_WEBHOOK_URL", value: "http://<lightsail-ip>:3333 (on agent server)" },
                  { label: "AGENT_WAKEUP_WEBHOOK_SECRET", value: "Auto-generated" },
                  { label: "OAUTH_SECRET_*", value: "Same secrets for all customers (set once)" },
                ]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                OAuth secrets (<code className="bg-accent px-1 rounded">OAUTH_SECRET_GITHUB</code>, etc.) are shared across all customers — registered once by you as the developer. Customers never see or configure these.
              </p>
            </StepCard>

            <StepCard step={4} title="Seed Database" type="auto">
              <CommandBlock command={`npx convex run seedCustomer:seedNewCustomer\nnpx convex run billing:seedPlanLimits`} />
            </StepCard>

            <StepCard step={5} title="Create Vercel Deployment" type="manual">
              <LinkRow label="Vercel Dashboard" url="https://vercel.com" description="Import repo → set env vars → assign custom domain" />
              <InfoTable
                rows={[
                  { label: "VITE_CONVEX_URL", value: "https://valence-<slug>.convex.cloud", copy: false },
                  { label: "VITE_CONVEX_SITE_URL", value: "https://valence-<slug>.convex.site", copy: false },
                  { label: "VITE_CLERK_PUBLISHABLE_KEY", value: "From Clerk dashboard", copy: false },
                  { label: "VITE_SENTRY_DSN", value: "Optional — from Sentry project", copy: false },
                ]}
              />
              <p className="text-xs">Set custom domain: <code className="bg-accent px-1 rounded">{"<slug>"}.valence.ai</code></p>
            </StepCard>

            {deploymentModel === "cloud" ? (
              <StepCard step={6} title="Provision Lightsail Server" type="semi">
                <CommandBlock command={`./provision-server.sh <slug> small_2_0`} />
                <InfoTable
                  rows={[
                    { label: "small_2_0", value: "2GB RAM, 2 vCPU — ~$12/mo (default)" },
                    { label: "medium_2_0", value: "4GB RAM, 2 vCPU — ~$24/mo" },
                    { label: "large_2_0", value: "8GB RAM, 2 vCPU — ~$48/mo" },
                  ]}
                />
                <p className="text-xs">Creates Lightsail instance, SSH key, opens port 22, runs bootstrap.</p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-foreground">Post-provision — sync files to server:</p>
                  <CommandBlock
                    label="Sync SOUL files"
                    command={`rsync -avz -e "ssh -i keys/valence-<slug>-key.pem" \\\n  ../server-files/agents/ \\\n  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/agents/`}
                  />
                  <CommandBlock
                    label="Sync Kaze root SOUL"
                    command={`scp -i keys/valence-<slug>-key.pem \\\n  ../server-files/SOUL.md \\\n  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/SOUL.md`}
                  />
                  <CommandBlock
                    label="Sync skills"
                    command={`rsync -avz -e "ssh -i keys/valence-<slug>-key.pem" \\\n  ../server-files/skills/ \\\n  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/skills/`}
                  />
                  <CommandBlock
                    label="Set env vars on server"
                    command={`ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>\ncat >> ~/.openclaw/.env <<EOF\nMISSION_CONTROL_API_KEY=vk_live_xxx\nMISSION_CONTROL_URL=https://valence-<slug>.convex.cloud\nANTHROPIC_API_KEY=sk-ant-xxx\nEOF`}
                  />
                </div>
              </StepCard>
            ) : (
              <StepCard step={6} title="Generate Customer Install Command" type="semi">
                <p>Provide the customer with this one-liner:</p>
                <CommandBlock
                  command={`curl -fsSL https://your-domain/install.sh | bash -s -- \\\n  --api-key <their-api-key> \\\n  --convex-url <their-convex-http-url> \\\n  --anthropic-key <their-anthropic-key>`}
                />
                <div className="rounded-lg bg-accent/50 p-3 space-y-2 mt-2">
                  <p className="text-xs font-semibold text-foreground">Customer Server Requirements</p>
                  <InfoTable
                    rows={[
                      { label: "OS", value: "Ubuntu 22.04+ or Debian 12+" },
                      { label: "CPU", value: "2 vCPU minimum" },
                      { label: "RAM", value: "2 GB minimum" },
                      { label: "Disk", value: "10 GB minimum" },
                      { label: "Outbound", value: "*.convex.cloud (443), api.anthropic.com (443)" },
                      { label: "Inbound", value: "Port 22 from SSH proxy (or customer network)" },
                    ]}
                  />
                </div>
                <p className="text-xs mt-2">Or use Docker (see Docker section below).</p>
              </StepCard>
            )}

            <StepCard step={7} title="Add OAuth Redirect URI (if new Convex site URL)" type="manual">
              <p>Each customer has a unique <code className="bg-accent px-1 rounded text-xs">.convex.site</code> URL. Add it as a redirect URI to your existing OAuth apps:</p>
              <CommandBlock command={`https://valence-<slug>.convex.site/api/integrations/oauth/callback`} />
              <div className="flex flex-wrap gap-2 mt-1">
                {["GitHub", "Slack", "Google", "Jira", "Linear", "Notion"].map((p) => (
                  <span key={p} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{p}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                The OAuth apps themselves are registered once by you. You just need to add each new customer's callback URL as an additional redirect URI. The client ID and secret stay the same.
              </p>
            </StepCard>

            <StepCard step={8} title="Verify & Smoke Test" type="auto">
              <CommandBlock label="Quick verify" command={`./verify-customer.sh <slug>`} />
              <CommandBlock label="Full smoke test" command={`./smoke-test.sh <slug>`} />
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-foreground">Checks performed:</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    "Vercel HTTP 200",
                    "React #root present",
                    "Convex health endpoint",
                    "Heartbeat API reachable",
                    "Tasks API reachable",
                    "SSH proxy healthy",
                    "SSH connectivity",
                    "OpenClaw CLI installed",
                    "SOUL files present",
                    "Agent processes running",
                    "Env file exists",
                    "Disk usage < 80%",
                  ].map((check) => (
                    <div key={check} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                      {check}
                    </div>
                  ))}
                </div>
              </div>
            </StepCard>
          </div>
        </Section>

        {/* ─── IMPORTANT LINKS ─────────────────────── */}
        <Section title="Quick Links & Dashboards" icon={Globe} badge="Bookmarks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <LinkRow label="Convex Dashboard" url="https://dashboard.convex.dev" description="Projects, functions, logs, data" />
            <LinkRow label="Vercel Dashboard" url="https://vercel.com/dashboard" description="Deployments, domains, env vars" />
            <LinkRow label="Clerk Dashboard" url="https://dashboard.clerk.com" description="Auth, users, organizations" />
            <LinkRow label="AWS Lightsail Console" url="https://lightsail.aws.amazon.com" description="Instances, snapshots, networking" />
            <LinkRow label="GitHub Repo" url="https://github.com/arpitdhamija-ai" description="Agent repos, org settings" />
            <LinkRow label="Sentry Dashboard" url="https://sentry.io" description="Error tracking, performance" />
            <LinkRow label="Stripe Dashboard" url="https://dashboard.stripe.com" description="Billing, subscriptions, invoices" />
            <LinkRow label="Anthropic Console" url="https://console.anthropic.com" description="API keys, usage, billing" />
          </div>
        </Section>

        {/* ─── ENV VARS REFERENCE ──────────────────── */}
        <Section title="Environment Variables Reference" icon={Key}>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Convex (Per Customer)</p>
              <InfoTable
                rows={[
                  { label: "ALLOWED_ORIGIN", value: "https://<customer-domain>" },
                  { label: "INTEGRATION_ENCRYPTION_KEY", value: "32-byte hex (auto-generated)" },
                  { label: "CLERK_JWT_ISSUER_DOMAIN", value: "https://clerk.valence.ai" },
                  { label: "ANTHROPIC_API_KEY", value: "sk-ant-xxx (for doc scraper)" },
                  { label: "SSH_PROXY_URL", value: "http://<lightsail-ip>:3001 (on agent server)" },
                  { label: "SSH_PROXY_SECRET", value: "Bearer token matching SSH proxy" },
                  { label: "AGENT_WAKEUP_WEBHOOK_URL", value: "http://<lightsail-ip>:3333 (on agent server)" },
                  { label: "AGENT_WAKEUP_WEBHOOK_SECRET", value: "HMAC secret matching wakeup server" },
                  { label: "OAUTH_SECRET_*", value: "Copied from your master OAuth apps (same for all customers)" },
                ]}
              />
              <p className="text-xs text-muted-foreground mt-1">
                OAuth secrets are from your one-time OAuth app registrations (GitHub, Slack, Google, etc.). Same values copied to every customer's Convex project. Customers never configure these — they just click "Connect" in the dashboard.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Vercel (Per Customer)</p>
              <InfoTable
                rows={[
                  { label: "VITE_CONVEX_URL", value: "https://valence-<slug>.convex.cloud" },
                  { label: "VITE_CONVEX_SITE_URL", value: "https://valence-<slug>.convex.site" },
                  { label: "VITE_CLERK_PUBLISHABLE_KEY", value: "From Clerk dashboard" },
                  { label: "VITE_SENTRY_DSN", value: "From Sentry (optional)" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Agent Server (.env)</p>
              <InfoTable
                rows={[
                  { label: "MISSION_CONTROL_API_KEY", value: "vk_live_xxx (from dashboard API Keys)" },
                  { label: "MISSION_CONTROL_URL", value: "https://valence-<slug>.convex.cloud" },
                  { label: "ANTHROPIC_API_KEY", value: "sk-ant-xxx" },
                ]}
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Shared Services (On Lightsail Server)</p>
              <InfoTable
                rows={[
                  { label: "SSH_PROXY_SECRET", value: "Bearer token for SSH proxy auth" },
                  { label: "SSH proxy port", value: "3001 (Express.js on agent server)" },
                  { label: "WEBHOOK_SECRET", value: "HMAC secret for agent wakeup" },
                  { label: "Wakeup server port", value: "3333 (on agent server)" },
                ]}
              />
              <div className="mt-3 rounded-lg bg-accent/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-foreground">Resource Usage (Per Agent Server)</p>
                <InfoTable
                  rows={[
                    { label: "SSH Proxy", value: "~30-50 MB RAM, negligible CPU (Express.js)" },
                    { label: "Agent Wakeup Server", value: "~30-50 MB RAM, negligible CPU (Express.js)" },
                    { label: "OpenClaw Gateway", value: "~100-200 MB RAM idle, up to ~500 MB per active agent session" },
                    { label: "Per Active Agent", value: "~200-500 MB RAM (Claude API streaming + context)" },
                    { label: "Node.js Overhead", value: "~80-120 MB base" },
                    { label: "OS + System", value: "~300-400 MB RAM" },
                    { label: "Total Idle (5 agents)", value: "~600-900 MB RAM" },
                    { label: "Total Peak (3 agents active)", value: "~1.5-2.5 GB RAM" },
                    { label: "Disk (base install)", value: "~1.5-2 GB (Node.js + OpenClaw + deps)" },
                    { label: "Disk (agent sessions)", value: "~50-200 MB per session JSONL (grows over time)" },
                    { label: "Disk (logs)", value: "~100 MB/week (rotate recommended)" },
                    { label: "Recommended Instance", value: "2 GB RAM minimum, 4 GB for heavy usage" },
                  ]}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ─── DOCKER ──────────────────────────────── */}
        <Section title="Docker Agent Server" icon={Package}>
          <p className="text-sm text-muted-foreground">
            Self-contained Docker image for on-prem customers who prefer containers over bare metal.
          </p>
          <CommandBlock label="Build the image" command={`docker build -f deployment-scripts/Dockerfile.agents -t mission-control-agents .`} />
          <CommandBlock
            label="Run the container"
            command={`docker run -d \\\n  -e MISSION_CONTROL_API_KEY=vk_live_xxx \\\n  -e MISSION_CONTROL_URL=https://your-project.convex.cloud \\\n  -e ANTHROPIC_API_KEY=sk-ant-xxx \\\n  --name mc-agents \\\n  mission-control-agents`}
          />
          <div className="rounded-lg bg-accent/50 p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground">Image Details</p>
            <InfoTable
              rows={[
                { label: "Base", value: "node:20-slim" },
                { label: "User", value: "agent (non-root)" },
                { label: "Agents", value: "kaze, scout, forge, ghost, sentinel" },
                { label: "Health check", value: "pgrep -f 'openclaw' every 30s" },
                { label: "Entrypoint", value: "npx openclaw gateway start" },
              ]}
            />
          </div>
        </Section>

        {/* ─── BATCH OPERATIONS ────────────────────── */}
        <Section title="Batch Operations (All Customers)" icon={RefreshCw}>
          <div className="space-y-3">
            <CommandBlock label="Deploy Convex functions to all" command={`./update-all.sh --functions-only`} />
            <CommandBlock label="Dry run (preview only)" command={`./update-all.sh --dry-run --functions-only`} />
            <CommandBlock label="Set env var across all" command={`./update-all.sh --env ANTHROPIC_API_KEY sk-ant-xxx`} />
            <CommandBlock label="Sync SOUL files to all servers" command={`./update-all.sh --soul-sync`} />
            <CommandBlock label="Trigger Vercel rebuild for all" command={`./update-all.sh --vercel-redeploy`} />
            <CommandBlock label="Restart agents on all servers" command={`./update-all.sh --agent-restart`} />
            <CommandBlock label="Nightly Lightsail snapshots" command={`./lightsail-snapshots.sh [--dry-run]`} />
            <p className="text-xs text-muted-foreground">All logs saved to: <code className="bg-accent px-1 rounded">deployment-scripts/logs/update_YYYYMMDD_HHMMSS.log</code></p>
          </div>
        </Section>

        {/* ─── SERVER FILE STRUCTURE ───────────────── */}
        <Section title="Server File Structure & Sync" icon={FileText}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Local Repo</p>
              <pre className="text-xs font-mono bg-background border rounded-lg p-3 text-muted-foreground whitespace-pre overflow-x-auto">{`server-files/
├── SOUL.md              ← Kaze root
├── agents/
│   ├── kaze/SOUL.md
│   ├── scout/SOUL.md
│   ├── forge/SOUL.md
│   ├── ghost/SOUL.md
│   └── sentinel/SOUL.md
└── skills/
    └── mission-control/
        └── SKILL.md`}</pre>
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Maps to Server</p>
              <pre className="text-xs font-mono bg-background border rounded-lg p-3 text-muted-foreground whitespace-pre overflow-x-auto">{`/home/ubuntu/.openclaw/
├── workspace/
│   ├── SOUL.md           ← Kaze reads
│   ├── agents/
│   │   ├── kaze/SOUL.md
│   │   ├── scout/SOUL.md
│   │   └── ...
│   └── skills/
│       └── mission-control/
└── agents/
    └── (runtime sessions)`}</pre>
            </div>
          </div>
          <div className="mt-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-xs text-yellow-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <strong>Kaze is special:</strong> reads from workspace root <code className="bg-accent px-1 rounded">workspace/SOUL.md</code>, not from <code className="bg-accent px-1 rounded">workspace/agents/kaze/SOUL.md</code>. Keep both copies in sync!
            </p>
          </div>
        </Section>

        {/* ─── TROUBLESHOOTING ─────────────────────── */}
        <Section title="Troubleshooting & Common Failures" icon={AlertTriangle}>
          <div className="space-y-4">
            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">Agent not heartbeating</p>
              <CommandBlock command={`ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>\nps aux | grep openclaw\nsudo journalctl -u openclaw-agents -n 50\nsudo systemctl restart openclaw-agents`} />
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">Agent session crash / recovery loop</p>
              <CommandBlock
                command={`# Find corrupt session (look for largest/newest .jsonl)\nls -lt ~/.openclaw/agents/<agent>/sessions/\n\n# Delete corrupt file + lock\nrm ~/.openclaw/agents/<agent>/sessions/<file>.jsonl\nrm -f ~/.openclaw/agents/<agent>/sessions/<file>.jsonl.lock\n\n# Re-wake agent\nnpx convex run agentWakeup:triggerWakeup \\\n  '{"agentName":"Forge","taskId":"...","reason":"continue_work"}' \\\n  --url https://valence-<slug>.convex.cloud`}
              />
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">OAuth callback not working</p>
              <p className="text-xs text-muted-foreground">
                Verify callback URL is registered in the OAuth provider's app settings. Must be exactly:
              </p>
              <CommandBlock command={`https://valence-<slug>.convex.site/api/integrations/oauth/callback`} />
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">Convex functions not updating</p>
              <p className="text-xs text-muted-foreground">
                Make sure you're deploying to the right deployment. For dev:
              </p>
              <CommandBlock command={`npx convex dev --once --typecheck=disable`} />
              <p className="text-xs text-muted-foreground">
                <strong>Never</strong> use <code className="bg-accent px-1 rounded">npx convex deploy</code> for the dev deployment — that goes to production.
              </p>
            </div>

            <div className="rounded-lg border p-3 space-y-2">
              <p className="text-sm font-semibold text-foreground">Server disk full</p>
              <CommandBlock command={`ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>\ndf -h\n# Clean agent session files\nfind ~/.openclaw/agents -name '*.jsonl' -size +50M -delete\nsudo apt-get autoremove -y`} />
            </div>
          </div>
        </Section>

        {/* ─── TEARDOWN ────────────────────────────── */}
        <Section title="Customer Teardown" icon={Trash2}>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-3">
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <strong>Destructive operation.</strong> This deletes the Lightsail instance, SSH keys, and marks customer as deleted.
            </p>
          </div>
          <CommandBlock label="Run teardown script" command={`./teardown-customer.sh <slug>`} />
          <p className="text-xs text-muted-foreground mt-2">
            Confirmation required: type <code className="bg-accent px-1 rounded">DELETE {"<slug>"}</code> to proceed.
          </p>
          <div className="mt-3">
            <p className="text-xs font-semibold text-foreground mb-1">Manual cleanup still needed:</p>
            <div className="space-y-1">
              {[
                "Delete Convex project from dashboard",
                "Remove Vercel deployment",
                "Cancel Stripe subscription",
                "Remove OAuth callback URLs from each provider",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ─── KEY FILES ───────────────────────────── */}
        <Section title="Key File Reference" icon={BookOpen}>
          <InfoTable
            rows={[
              { label: "Provisioning script", value: "deployment-scripts/provision-customer.sh" },
              { label: "Server provisioning", value: "deployment-scripts/provision-server.sh" },
              { label: "Env template", value: "deployment-scripts/env-template.convex" },
              { label: "Customer registry", value: "deployment-scripts/customers.json" },
              { label: "SSH keys dir", value: "deployment-scripts/keys/" },
              { label: "Verify script", value: "deployment-scripts/verify-customer.sh" },
              { label: "Smoke tests", value: "deployment-scripts/smoke-test.sh" },
              { label: "Update all", value: "deployment-scripts/update-all.sh" },
              { label: "Snapshots", value: "deployment-scripts/lightsail-snapshots.sh" },
              { label: "Teardown", value: "deployment-scripts/teardown-customer.sh" },
              { label: "Docker image", value: "deployment-scripts/Dockerfile.agents" },
              { label: "On-prem install", value: "deployment-scripts/install-agent-server.sh" },
              { label: "Operator runbook", value: "deployment-scripts/RUNBOOK.md" },
              { label: "On-prem guide", value: "deployment-scripts/ON-PREM-GUIDE.md" },
              { label: "SSH proxy service", value: "ssh-proxy-service/ (root level)" },
              { label: "Agent wakeup server", value: "server-files/agent-wakeup-server.js" },
              { label: "Server SOUL files", value: "server-files/agents/<name>/SOUL.md" },
              { label: "PROJECT_BIBLE", value: "PROJECT_BIBLE.md" },
            ]}
          />
        </Section>

        {/* ─── POST-ONBOARDING CHECKLIST ───────────── */}
        <Section title="Post-Onboarding Verification Checklist" icon={CheckCircle2} badge="Must pass">
          <div className="space-y-2">
            {[
              { check: "Customer signs up via Clerk → lands on onboarding page", category: "Auth" },
              { check: "Onboarding wizard completes (company name, integrations, agents, invite)", category: "Setup" },
              { check: "Create a task → assign to Kaze → verify Kaze wakes up and claims it", category: "Agents" },
              { check: "Connect GitHub OAuth → verify token stored and tool execution works", category: "Integrations" },
              { check: "Kill an agent process → sweep cron detects and re-wakes within 10 min", category: "Recovery" },
              { check: "Dashboard loads all pages without errors", category: "Frontend" },
              { check: "Heartbeat shows all 5 agents online", category: "Health" },
              { check: "SSH proxy can reach agent server", category: "Network" },
              ...(deploymentModel === "onprem"
                ? [{ check: "Customer restarts their server → agents auto-recover", category: "On-Prem" }]
                : []),
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border">
                <div className="w-5 h-5 rounded border-2 border-muted-foreground/30 shrink-0" />
                <span className="text-sm text-foreground flex-1">{item.check}</span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground shrink-0">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
