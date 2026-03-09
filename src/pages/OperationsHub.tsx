import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CustomerList } from "@/components/ops/CustomerList";
import { CustomerPreFlight } from "@/components/ops/CustomerPreFlight";
import { CustomerDetail } from "@/components/ops/CustomerDetail";
import { PilotPlaybook } from "@/components/ops/PilotPlaybook";
import { OnboardingGuide } from "@/components/ops/OnboardingGuide";
import {
  Shield,
  Rocket,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
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
  Users,
  BookMarked,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Shared helpers (preserved from original)
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

// ─────────────────────────────────────────────────
// Reference Tab (preserved from original ops page)
// ─────────────────────────────────────────────────
function ReferenceTab() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Quick Links */}
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

      {/* Prerequisites */}
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

      {/* Env Vars Reference */}
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
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Tenant Config (src/tenants.json — per customer)</p>
            <InfoTable
              rows={[
                { label: "convexUrl", value: "Convex deployment URL (e.g. https://happy-animal-123.convex.cloud)" },
                { label: "convexSiteUrl", value: "Convex site URL (e.g. https://happy-animal-123.convex.site)" },
                { label: "clerkPublishableKey", value: "From Clerk dashboard" },
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
                  { label: "Total Idle (5 agents)", value: "~600-900 MB RAM" },
                  { label: "Total Peak (3 active)", value: "~1.5-2.5 GB RAM" },
                  { label: "Disk (base)", value: "~1.5-2 GB" },
                  { label: "Disk (sessions)", value: "~50-200 MB per JSONL" },
                  { label: "Recommended", value: "2 GB RAM min, 4 GB for heavy usage" },
                ]}
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Docker */}
      <Section title="Docker Agent Server" icon={Package}>
        <p className="text-sm text-muted-foreground">
          Self-contained Docker image for on-prem customers who prefer containers.
        </p>
        <CommandBlock label="Build" command={`docker build -f deployment-scripts/Dockerfile.agents -t mission-control-agents .`} />
        <CommandBlock
          label="Run"
          command={`docker run -d \\\n  -e MISSION_CONTROL_API_KEY=vk_live_xxx \\\n  -e MISSION_CONTROL_URL=https://your-project.convex.cloud \\\n  -e ANTHROPIC_API_KEY=sk-ant-xxx \\\n  --name mc-agents \\\n  mission-control-agents`}
        />
      </Section>

      {/* Batch Operations */}
      <Section title="Batch Operations (All Customers)" icon={RefreshCw}>
        <div className="space-y-3">
          <CommandBlock label="Deploy Convex functions to all" command={`./update-all.sh --functions-only`} />
          <CommandBlock label="Dry run (preview only)" command={`./update-all.sh --dry-run --functions-only`} />
          <CommandBlock label="Set env var across all" command={`./update-all.sh --env ANTHROPIC_API_KEY sk-ant-xxx`} />
          <CommandBlock label="Sync SOUL files to all servers" command={`./update-all.sh --soul-sync`} />
          <CommandBlock label="Trigger Vercel rebuild for all" command={`./update-all.sh --vercel-redeploy`} />
          <CommandBlock label="Restart agents on all servers" command={`./update-all.sh --agent-restart`} />
        </div>
      </Section>

      {/* Server File Structure */}
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
            <strong>Kaze is special:</strong> reads from workspace root <code className="bg-accent px-1 rounded">workspace/SOUL.md</code>, not from <code className="bg-accent px-1 rounded">workspace/agents/kaze/SOUL.md</code>.
          </p>
        </div>
      </Section>

      {/* Troubleshooting */}
      <Section title="Troubleshooting & Common Failures" icon={AlertTriangle}>
        <div className="space-y-4">
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">Agent not heartbeating</p>
            <CommandBlock command={`ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>\nps aux | grep openclaw\nsudo journalctl -u openclaw-agents -n 50\nsudo systemctl restart openclaw-agents`} />
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">Agent session crash / recovery loop</p>
            <CommandBlock
              command={`# Find corrupt session\nls -lt ~/.openclaw/agents/<agent>/sessions/\n\n# Delete corrupt file + lock\nrm ~/.openclaw/agents/<agent>/sessions/<file>.jsonl\nrm -f ~/.openclaw/agents/<agent>/sessions/<file>.jsonl.lock\n\n# Re-wake agent\nnpx convex run agentWakeup:triggerWakeup \\\n  '{"agentName":"Forge","taskId":"...","reason":"continue_work"}' \\\n  --url https://valence-<slug>.convex.cloud`}
            />
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">OAuth callback not working</p>
            <CommandBlock command={`https://valence-<slug>.convex.site/api/integrations/oauth/callback`} />
          </div>
          <div className="rounded-lg border p-3 space-y-2">
            <p className="text-sm font-semibold text-foreground">Server disk full</p>
            <CommandBlock command={`ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>\ndf -h\nfind ~/.openclaw/agents -name '*.jsonl' -size +50M -delete\nsudo apt-get autoremove -y`} />
          </div>
        </div>
      </Section>

      {/* Teardown */}
      <Section title="Customer Teardown" icon={Trash2}>
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 mb-3">
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0" />
            <strong>Destructive operation.</strong> Deletes Lightsail instance, SSH keys, marks customer as deleted.
          </p>
        </div>
        <CommandBlock label="Run teardown" command={`./teardown-customer.sh <slug>`} />
        <div className="mt-3">
          <p className="text-xs font-semibold text-foreground mb-1">Manual cleanup:</p>
          <div className="space-y-1">
            {[
              "Delete Convex project from dashboard",
              "Remove Vercel deployment",
              "Cancel Stripe subscription",
              "Remove OAuth callback URLs",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Key Files */}
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
            { label: "Teardown", value: "deployment-scripts/teardown-customer.sh" },
            { label: "Docker image", value: "deployment-scripts/Dockerfile.agents" },
            { label: "On-prem install", value: "deployment-scripts/install-agent-server.sh" },
            { label: "Operator runbook", value: "deployment-scripts/RUNBOOK.md" },
            { label: "On-prem guide", value: "deployment-scripts/ON-PREM-GUIDE.md" },
          ]}
        />
      </Section>
    </div>
  );
}

// ═════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════
type Tab = "customers" | "guide" | "playbook" | "reference";

export default function OperationsHub() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>("customers");

  // URL-based views
  const isNewCustomer = searchParams.get("new") === "1";
  const customerSlug = searchParams.get("customer");

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

  // Determine content to show
  const showCustomerDetail = !!customerSlug;
  const showNewCustomer = isNewCustomer;
  const showMainView = !showCustomerDetail && !showNewCustomer;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Rocket className="w-6 h-6 text-primary" />
              Operations Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Customer provisioning, pilot playbook, and deployment reference.
            </p>
          </div>
        </div>

        {/* Sub-views via URL params */}
        {showNewCustomer && (
          <CustomerPreFlight
            onBack={() => setSearchParams({})}
            onCreated={(slug) => setSearchParams({ customer: slug })}
          />
        )}

        {showCustomerDetail && (
          <CustomerDetail
            slug={customerSlug}
            onBack={() => setSearchParams({})}
          />
        )}

        {/* Main tabbed view */}
        {showMainView && (
          <>
            {/* Tab bar */}
            <div className="flex gap-1 border-b border-border pb-0">
              {([
                { id: "customers" as const, label: "Customers", icon: Users },
                { id: "guide" as const, label: "Onboarding Guide", icon: Rocket },
                { id: "playbook" as const, label: "Pilot Playbook", icon: BookMarked },
                { id: "reference" as const, label: "Reference", icon: BookOpen },
              ]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div>
              {activeTab === "customers" && (
                <CustomerList
                  onNewCustomer={() => setSearchParams({ new: "1" })}
                  onSelectCustomer={(slug) => setSearchParams({ customer: slug })}
                />
              )}
              {activeTab === "guide" && <OnboardingGuide />}
              {activeTab === "playbook" && <PilotPlaybook />}
              {activeTab === "reference" && <ReferenceTab />}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
