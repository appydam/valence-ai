import { useState } from "react";
import {
  BookOpen, ChevronDown, ChevronRight, ExternalLink, Copy, Check,
  Server, Globe, Database, Key, Users, Shield, Rocket,
  Terminal, AlertTriangle, CheckCircle2, Clock, Zap,
  FolderTree, RefreshCw, Wrench, FileText, HelpCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Shared UI helpers
// ─────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="shrink-0 p-0.5 rounded text-muted-foreground hover:text-foreground"
    >
      {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function Cmd({ label, command }: { label?: string; command: string }) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
      <div className="flex items-start gap-2 bg-background border rounded-lg px-3 py-2 font-mono text-xs text-foreground overflow-x-auto">
        <pre className="flex-1 whitespace-pre-wrap break-all">{command}</pre>
        <CopyBtn text={command} />
      </div>
    </div>
  );
}

function Callout({ type, children }: { type: "info" | "warn" | "critical" | "time" }) {
  const cfg = {
    info: { bg: "bg-blue-500/5 border-blue-500/20", label: "Info", color: "text-blue-400" },
    warn: { bg: "bg-yellow-500/5 border-yellow-500/20", label: "Important", color: "text-yellow-400" },
    critical: { bg: "bg-red-500/5 border-red-500/20", label: "Critical", color: "text-red-400" },
    time: { bg: "bg-green-500/5 border-green-500/20", label: "Time Estimate", color: "text-green-400" },
  };
  const c = cfg[type];
  return (
    <div className={`rounded-lg border p-3 ${c.bg}`}>
      <p className={`text-xs font-semibold mb-1 ${c.color}`}>{c.label}</p>
      <div className="text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

function Section({
  title, icon: Icon, children, defaultOpen = false, badge, number,
}: {
  title: string; icon: React.ElementType; children: React.ReactNode;
  defaultOpen?: boolean; badge?: string; number?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 w-full px-5 py-4 text-left hover:bg-accent/30 transition-colors">
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
        {number && <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{number}</span>}
        <Icon className="w-5 h-5 text-primary shrink-0" />
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {badge && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{badge}</span>}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  );
}

function ExtLink({ label, url, desc }: { label: string; url: string; desc?: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 rounded-lg border hover:bg-accent/30 transition-colors group">
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground group-hover:text-primary">{label}</p>
        {desc && <p className="text-xs text-muted-foreground truncate">{desc}</p>}
      </div>
    </a>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-0.5">
      <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
      <span className="text-xs text-foreground">{children}</span>
    </div>
  );
}

function NumberedStep({ n, title, time, children }: { n: string; title: string; time?: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-primary/30 pl-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{n}</span>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {time && <span className="text-[10px] text-muted-foreground bg-accent px-1.5 py-0.5 rounded-full ml-auto">{time}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────

export function OnboardingGuide() {
  return (
    <div className="space-y-4 max-w-4xl">
      {/* Header */}
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Customer Onboarding Guide
        </h2>
        <p className="text-xs text-muted-foreground">
          Complete step-by-step guide for onboarding a new client. Follow this from top to bottom.
        </p>
      </div>

      <Callout type="time">
        <p><strong>Total time: ~15-20 minutes</strong> per customer (cloud deployment). On-prem takes longer due to customer-side setup.</p>
        <p className="mt-1">This guide assumes you have all prerequisite tools installed. If not, complete the Prerequisites section first.</p>
      </Callout>

      {/* ════════════════════════════════════════════════════ */}
      {/* PREREQUISITES */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="Prerequisites — Install These on YOUR Machine" icon={Key} number="0" badge="Your laptop">
        <p className="text-sm text-muted-foreground">
          These tools need to be installed on <strong>your laptop</strong> (not the client's). The client never touches any of this — they only use the dashboard we give them. Install these once, and you're set for all future customer onboardings.
        </p>

        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Tools to Install on Your Machine</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { tool: "AWS CLI", what: "Creates Lightsail servers for customers", how: "Run: aws configure (need IAM access key with Lightsail permissions)" },
                { tool: "Convex CLI", what: "Deploys backend code & sets env vars", how: "Bundled with npm — just run: npx convex login" },
                { tool: "Node.js 20+", what: "Required for Convex CLI and provisioning scripts", how: "Install: nvm install 20 && nvm use 20" },
                { tool: "Git + SSH", what: "Clone repo, SSH into customer servers", how: "Should already be installed on macOS/Linux" },
              ].map((r) => (
                <div key={r.tool} className="rounded-lg border p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{r.tool}</p>
                  <p className="text-[10px] text-muted-foreground">{r.what}</p>
                  <p className="text-[10px] text-primary">{r.how}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Dashboard Accounts You Need Access To</p>
            <p className="text-xs text-muted-foreground mb-2">Ask Arpit for login credentials or team invites to these services:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ExtLink label="Convex Dashboard" url="https://dashboard.convex.dev" desc="Create projects, view data, set env vars" />
              <ExtLink label="Vercel Dashboard" url="https://vercel.com/dashboard" desc="Deploy frontend, assign custom domains" />
              <ExtLink label="Clerk Dashboard" url="https://dashboard.clerk.com" desc="Auth provider — get publishable key" />
              <ExtLink label="AWS Lightsail" url="https://lightsail.aws.amazon.com" desc="View/manage customer agent servers" />
              <ExtLink label="Anthropic Console" url="https://console.anthropic.com" desc="Get API keys for AI agents" />
              <ExtLink label="GitHub OAuth Apps" url="https://github.com/settings/developers" desc="Add redirect URIs for new customers" />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Verify everything works</p>
            <Cmd label="Run these on your machine (all should succeed)" command={[
              `# AWS access`,
              `aws lightsail get-regions --query 'regions[0].name' --output text`,
              ``,
              `# Node.js version`,
              `node --version  # Should be v20+`,
              ``,
              `# Convex CLI`,
              `npx convex --version`,
              ``,
              `# You have the repo cloned`,
              `ls agent-orchestrator/deployment-scripts/provision-customer.sh`,
            ].join("\n")} />
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* WHAT TO COLLECT FROM CLIENT */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="What to Collect From the Client (Before You Start)" icon={Users} number="A" badge="Pre-call">
        <p className="text-sm text-muted-foreground">
          Collect this info during the sales/demo call or via email before you start provisioning.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Required (can't start without these)</p>
            <CheckItem><strong>Company name</strong> — legal entity name (e.g., "Acme Corp")</CheckItem>
            <CheckItem><strong>Admin email</strong> — who gets the first login invite</CheckItem>
            <CheckItem><strong>Contact name + role</strong> — primary point of contact</CheckItem>
            <CheckItem><strong>Preferred plan</strong> — Business ($2,499/mo) / Enterprise ($4,999/mo) / Enterprise+ (custom)</CheckItem>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Good to know (can fill later)</p>
            <CheckItem><strong>Deployment model</strong> — cloud (we host agents) vs on-prem (they host agents)</CheckItem>
            <CheckItem><strong>Day-1 integrations</strong> — GitHub, Slack, Jira, etc.</CheckItem>
            <CheckItem><strong>Anthropic API key</strong> — do we provide or do they?</CheckItem>
            <CheckItem><strong>Compliance needs</strong> — SOC2, HIPAA, data residency</CheckItem>
            <CheckItem><strong>Expected number of users</strong> — affects plan tier</CheckItem>
            <CheckItem><strong>Server region preference</strong> — default: ap-south-1 (Mumbai)</CheckItem>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2 mt-2">
          <p className="text-xs font-bold text-foreground">About the customer's domain/URL</p>
          <p className="text-xs text-muted-foreground">
            Each customer gets a subdomain on our domain. For example, if we own <code className="bg-accent px-1 rounded">use-valence.ai</code>, a customer "Acme" gets <code className="bg-accent px-1 rounded">acme.use-valence.ai</code>. <strong>This costs nothing extra</strong> — subdomains are just DNS records.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>How subdomains work:</strong> You go to your DNS provider (Cloudflare, Namecheap, etc.) where <code className="bg-accent px-1 rounded">use-valence.ai</code> is managed, and add a <strong>CNAME record</strong>:
          </p>
          <Cmd command={`Type: CNAME\nName: acme          (this creates acme.use-valence.ai)\nTarget: cname.vercel-dns.com`} />
          <p className="text-xs text-muted-foreground">
            That's it — a CNAME record is free (no extra charge from DNS or Vercel). Vercel automatically handles SSL certificates and serves the customer's frontend on that subdomain. You also add this domain in Vercel's project settings (Step 3). You can add unlimited subdomains this way at zero cost.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong>Alternatively</strong>, the customer can use their own domain (e.g., <code className="bg-accent px-1 rounded">mc.acme.com</code>). In that case, <em>they</em> add the CNAME record in their DNS, and you just add the domain in Vercel. Also free.
          </p>
        </div>

        <Callout type="info">
          <p>Once you have the required info, go to <strong>/ops → New Customer</strong> to enter it into the system. The system generates a unique slug and creates a tracking record with 6 provisioning steps.</p>
        </Callout>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* ARCHITECTURE OVERVIEW */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="Architecture — What You're Setting Up" icon={FolderTree} number="B" badge="Understand this">
        <p className="text-sm text-muted-foreground mb-3">
          Each customer gets 3 isolated components, all hosted on <strong>our accounts</strong> (not the client's). The client never sees any code or infrastructure — they just get a URL to log into.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <p className="text-sm font-bold text-foreground">Convex Backend</p>
            </div>
            <p className="text-xs text-muted-foreground">Serverless database + API. Each customer gets a <strong>new Convex project</strong> under our Convex account.</p>
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <p>- Same code deployed to each project</p>
              <p>- Isolated data per customer</p>
              <p>- All projects bill to our Convex plan</p>
              <p>- Pro plan ($25/mo) covers many projects</p>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-green-400" />
              <p className="text-sm font-bold text-foreground">Vercel Frontend</p>
            </div>
            <p className="text-xs text-muted-foreground">React dashboard — <strong>single Vercel project</strong> serves all customers. The app resolves which Convex backend to connect to based on the subdomain.</p>
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <p>- One deploy, all customers (via tenants.json)</p>
              <p>- Subdomain routing: acme.use-valence.ai → Acme's Convex</p>
              <p>- Adding a customer = add entry + CNAME + redeploy</p>
              <p>- Cost: $0 — single Vercel hobby project</p>
            </div>
          </div>
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-bold text-foreground">Agent Server</p>
            </div>
            <p className="text-xs text-muted-foreground">AWS Lightsail VM running 5 AI agents via OpenClaw. One server per customer.</p>
            <div className="text-[10px] text-muted-foreground space-y-0.5">
              <p>- 5 agents: Kaze, Scout, Forge, Ghost, Sentinel</p>
              <p>- OpenClaw gateway (systemd service)</p>
              <p>- SSH proxy + agent wakeup run here too</p>
              <p>- Cost: ~$12/mo per customer (small_2_0)</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2 mt-2">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider">How multi-tenancy works</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong className="text-foreground">Convex:</strong> Each customer needs isolated data (their tasks, agents, integrations). A new Convex project = a completely separate database. All projects live under our Convex account and bill to our plan. Convex Pro ($25/mo) supports many projects — each project doesn't cost $25 separately.</p>
            <p><strong className="text-foreground">Vercel:</strong> A <strong>single Vercel project</strong> serves all customers. The frontend reads the subdomain from the URL (e.g., <code className="bg-accent px-1 rounded">acme</code> from <code className="bg-accent px-1 rounded">acme.use-valence.ai</code>) and looks up the matching Convex URL from <code className="bg-accent px-1 rounded">src/tenants.json</code>. To add a customer, you add their entry to tenants.json and trigger a Vercel redeploy (~30 sec). All subdomains are added to the same Vercel project. <strong>Cost: $0 extra.</strong></p>
            <p><strong className="text-foreground">Agent Server:</strong> Each customer needs their own Lightsail VM because agents need isolated file system, sessions, and API keys. The SSH proxy server and agent wakeup server also run on this same Lightsail instance (not on Railway — they're Node.js processes on the agent server).</p>
          </div>
        </div>

        <Callout type="critical">
          <p><strong>Code is proprietary.</strong> Customers never see the source code. We deploy compiled/built artifacts (Convex functions, Vercel builds) from our private repo. The customer only interacts with the dashboard at their domain. The agent server runs the OpenClaw runtime, not our source code.</p>
        </Callout>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* THE 6-STEP PROCESS */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="The 6-Step Onboarding Process (Cloud Deployment)" icon={Rocket} number="C" defaultOpen badge="~15 min">
        <Callout type="time">
          <p><strong>Steps 1-2:</strong> ~5 min (Convex setup). <strong>Step 3:</strong> ~5 min (server provision + add tenant). <strong>Steps 4-6:</strong> ~5 min (configure + verify + invite).</p>
        </Callout>

        <p className="text-sm text-muted-foreground">
          Before starting: go to <strong>/ops → New Customer</strong>, fill in the client info, and click <strong>"Start Provisioning"</strong>.
          This creates a tracking record. Then follow the steps on the customer detail page — all commands are pre-filled with the customer's data.
        </p>

        {/* Step 1 */}
        <NumberedStep n="1" title="Create Convex Project" time="~2 min">
          <p className="text-xs text-muted-foreground">Create a new Convex project (a new isolated database) for this customer. This is a manual dashboard step.</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>1. Open <a href="https://dashboard.convex.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Convex Dashboard</a> (logged into our account)</p>
            <p>2. Click <strong>"Create a project"</strong></p>
            <p>3. Name it <strong>valence-{"<slug>"}</strong> (e.g., <code className="bg-accent px-1 rounded">valence-acme</code>)</p>
            <p>4. Select <strong>"Production"</strong> deployment type</p>
            <p>5. Go to <strong>Settings → URL & Deploy Key</strong></p>
            <p>6. Copy the <strong>Deployment URL</strong> (e.g., <code className="bg-accent px-1 rounded">https://happy-animal-123.convex.cloud</code>)</p>
            <p>7. Copy the <strong>HTTP Actions URL</strong> (e.g., <code className="bg-accent px-1 rounded">https://happy-animal-123.convex.site</code>)</p>
            <p>8. Paste both URLs into the tracking page at /ops</p>
          </div>
          <Callout type="info">
            <p>The project name is <code className="bg-accent px-0.5 rounded">valence-{"<slug>"}</code> but the actual URLs Convex assigns will be random like <code className="bg-accent px-0.5 rounded">happy-animal-123.convex.cloud</code>. That's fine — we use whatever URLs Convex gives us.</p>
          </Callout>
        </NumberedStep>

        {/* Step 2 */}
        <NumberedStep n="2" title="Deploy Backend + Set Env Vars + Seed Database" time="~3 min">
          <p className="text-xs text-muted-foreground">
            This deploys our backend code to the new Convex project, sets all required environment variables, and seeds the database with initial data (5 agents, plan limits, brand config). One copy-paste block.
          </p>
          <Cmd label="Copy this entire block and run from agent-orchestrator/" command={[
            `# ── Deploy schema & functions to the new project ──`,
            `cd agent-orchestrator`,
            `npx convex deploy --project valence-<SLUG> --typecheck=disable`,
            ``,
            `# ── Set environment variables ──`,
            `npx convex env set ALLOWED_ORIGIN "https://<DOMAIN>" --project valence-<SLUG>`,
            `npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.valence.ai" --project valence-<SLUG>`,
            `# SSH proxy & agent wakeup run on the customer's Lightsail server`,
            `# Set these AFTER Step 3 when you have the server IP:`,
            `# npx convex env set SSH_PROXY_URL "http://<LIGHTSAIL_IP>:3001" --project valence-<SLUG>`,
            `# npx convex env set AGENT_WAKEUP_WEBHOOK_URL "http://<LIGHTSAIL_IP>:3333" --project valence-<SLUG>`,
            `npx convex env set ANTHROPIC_API_KEY "sk-ant-api03-YOUR_KEY_HERE" --project valence-<SLUG>`,
            `npx convex env set INTEGRATION_ENCRYPTION_KEY "$(openssl rand -hex 32)" --project valence-<SLUG>`,
            `npx convex env set SSH_PROXY_SECRET "$(openssl rand -hex 16)" --project valence-<SLUG>`,
            `npx convex env set AGENT_WAKEUP_WEBHOOK_SECRET "$(openssl rand -hex 16)" --project valence-<SLUG>`,
            ``,
            `# ── OAuth secrets (same across all customers — copy from existing) ──`,
            `npx convex env set OAUTH_SECRET_GITHUB "YOUR_GITHUB_OAUTH_SECRET" --project valence-<SLUG>`,
            `# npx convex env set OAUTH_SECRET_SLACK "YOUR_SLACK_SECRET" --project valence-<SLUG>`,
            `# npx convex env set OAUTH_SECRET_GOOGLE "YOUR_GOOGLE_SECRET" --project valence-<SLUG>`,
            ``,
            `# ── Seed database with agents, plans, brand config ──`,
            `npx convex run seedCustomer:seedNewCustomer '{"companyName":"<COMPANY>","adminEmail":"<EMAIL>"}' --url <CONVEX_URL>`,
            `npx convex run billing:seedPlanLimits '{}' --url <CONVEX_URL>`,
          ].join("\n")} />

          <Callout type="warn">
            <p>Replace placeholders with actual values. On the /ops tracking page, all commands are <strong>pre-filled</strong> with the customer's data — just copy from there.</p>
            <p className="mt-1">The SSH_PROXY_URL and AGENT_WAKEUP_WEBHOOK_URL are <strong>commented out</strong> because you need the server IP first (from Step 3). Come back and set them after provisioning the server.</p>
          </Callout>
        </NumberedStep>

        {/* Step 3 */}
        <NumberedStep n="3" title="Provision Lightsail Server + Add to Vercel (PARALLEL)" time="~5 min">
          <Callout type="info">
            <p><strong>Do these in parallel!</strong> Start the server script in one terminal (takes ~5 min). While it bootstraps, do the Vercel + DNS steps in your browser/editor. Both finish around the same time.</p>
          </Callout>

          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-bold text-primary flex items-center gap-1"><Terminal className="w-3 h-3" /> TERMINAL — Start server provisioning</p>
            <Cmd command={[
              `cd agent-orchestrator/deployment-scripts`,
              `./provision-server.sh <SLUG> small_2_0`,
            ].join("\n")} />
            <p className="text-[10px] text-muted-foreground">This auto-creates SSH key, launches Ubuntu 22.04 instance on Lightsail, installs Node.js + OpenClaw, creates directory structure. Takes ~5 min. Outputs the server IP when done — paste it into /ops.</p>
          </div>

          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-2">
            <p className="text-xs font-bold text-yellow-400 flex items-center gap-1"><Globe className="w-3 h-3" /> EDITOR + BROWSER — Register tenant + add subdomain (while server bootstraps)</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>We use a single Vercel project for all customers.</strong> No need to create a new Vercel project. Just add the tenant config and subdomain:</p>
            </div>
            <Cmd label="1. Add tenant entry to src/tenants.json" command={[
              `// In agent-orchestrator/src/tenants.json, add inside "tenants":`,
              `"<SLUG>": {`,
              `  "convexUrl": "<CONVEX_URL_FROM_STEP_1>",`,
              `  "convexSiteUrl": "<CONVEX_SITE_URL_FROM_STEP_1>",`,
              `  "clerkPublishableKey": "pk_live_YOUR_KEY_HERE"`,
              `}`,
            ].join("\n")} />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>2. Commit and push — this triggers a Vercel redeploy (~30 sec)</p>
              <p>3. In <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Vercel Dashboard</a> → our project → <strong>Settings → Domains</strong> → Add <code className="bg-accent px-1 rounded">{"<SLUG>"}.use-valence.ai</code></p>
              <p>4. In your DNS provider (Cloudflare/Namecheap), add a CNAME record: <code className="bg-accent px-1 rounded">{"<SLUG>"}</code> → <code className="bg-accent px-1 rounded">cname.vercel-dns.com</code></p>
              <p>5. Wait for DNS propagation (~1-5 min), then verify the site loads at <code className="bg-accent px-1 rounded">{"<SLUG>"}.use-valence.ai</code></p>
            </div>
            <Callout type="info">
              <p>The app reads the subdomain from the URL and looks up the Convex URL in <code className="bg-accent px-0.5 rounded">tenants.json</code>. That's how one Vercel deploy serves all customers — each sees their own isolated data.</p>
            </Callout>
          </div>

          <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-2">
            <p className="text-xs font-bold text-green-400 flex items-center gap-1"><Database className="w-3 h-3" /> AFTER SERVER IS UP — Set remaining env vars</p>
            <p className="text-xs text-muted-foreground">Once provision-server.sh finishes and gives you the IP, set the SSH proxy and wakeup URLs:</p>
            <Cmd command={[
              `npx convex env set SSH_PROXY_URL "http://<LIGHTSAIL_IP>:3001" --project valence-<SLUG>`,
              `npx convex env set AGENT_WAKEUP_WEBHOOK_URL "http://<LIGHTSAIL_IP>:3333" --project valence-<SLUG>`,
            ].join("\n")} />
          </div>
        </NumberedStep>

        {/* Step 4 */}
        <NumberedStep n="4" title="Configure Agent Server (SOUL files + env + start)" time="~3 min">
          <p className="text-xs text-muted-foreground">
            Once the server is up (Step 3 terminal finished), sync the agent personality files, set environment variables, and start the agent service. Two copy-paste blocks.
          </p>

          <Cmd label="Block 1: Sync SOUL files + skills to the new server" command={[
            `cd agent-orchestrator/deployment-scripts`,
            ``,
            `# Sync agent SOUL files (scout, forge, ghost, sentinel)`,
            `rsync -avz -e "ssh -i keys/valence-<SLUG>-key.pem" \\`,
            `  ../server-files/agents/ \\`,
            `  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/agents/`,
            ``,
            `# Sync Kaze's root SOUL.md (special — lives at workspace root, not agents/)`,
            `scp -i keys/valence-<SLUG>-key.pem \\`,
            `  ../server-files/SOUL.md \\`,
            `  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/SOUL.md`,
            ``,
            `# Sync skills`,
            `rsync -avz -e "ssh -i keys/valence-<SLUG>-key.pem" \\`,
            `  ../server-files/skills/ \\`,
            `  ubuntu@<IP>:/home/ubuntu/.openclaw/workspace/skills/`,
          ].join("\n")} />

          <Cmd label="Block 2: Set env vars + start agents (single SSH command)" command={[
            `ssh -i keys/valence-<SLUG>-key.pem ubuntu@<IP> 'bash -s' << 'REMOTE'`,
            `# Write environment file`,
            `cat > ~/.openclaw/.env << 'EOF'`,
            `MISSION_CONTROL_URL=<CONVEX_SITE_URL>`,
            `MISSION_CONTROL_API_KEY=vk_live_REPLACE_ME`,
            `ANTHROPIC_API_KEY=sk-ant-api03-REPLACE_ME`,
            `EOF`,
            ``,
            `# Start and enable the agent gateway`,
            `sudo systemctl start openclaw-agents`,
            `sudo systemctl enable openclaw-agents`,
            ``,
            `# Verify it's running`,
            `sleep 3 && sudo systemctl status openclaw-agents --no-pager | head -15`,
            `REMOTE`,
          ].join("\n")} />

          <Callout type="warn">
            <p>Replace <code className="bg-accent px-0.5 rounded">{"<IP>"}</code> with the Lightsail IP from Step 3. Replace API keys with actual values.</p>
            <p className="mt-1"><strong>Kaze is special:</strong> Its SOUL.md lives at the workspace root (<code className="bg-accent px-0.5 rounded">/workspace/SOUL.md</code>), not inside <code className="bg-accent px-0.5 rounded">agents/kaze/</code>. The other 4 agents have their SOUL.md inside <code className="bg-accent px-0.5 rounded">agents/{"<name>"}/SOUL.md</code> as normal.</p>
          </Callout>
        </NumberedStep>

        {/* Step 5 */}
        <NumberedStep n="5" title="Add OAuth Callbacks + Verify" time="~2 min">
          <p className="text-xs text-muted-foreground">
            Add the customer's callback URL to each OAuth provider the customer will use, then run verification scripts.
          </p>

          <Cmd label="Callback URL to add to each OAuth provider's app settings" command={`<CONVEX_SITE_URL>/api/integrations/oauth/callback`} />

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Add this as a <strong>redirect URI</strong> in each provider's developer console. You only need providers the customer wants:</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {[
                { name: "GitHub", where: "Settings → Developer Settings → OAuth Apps → your app → Callback URLs" },
                { name: "Slack", where: "api.slack.com → Your App → OAuth & Permissions → Redirect URLs" },
                { name: "Google", where: "Cloud Console → Credentials → OAuth Client → Authorized redirect URIs" },
                { name: "Jira", where: "developer.atlassian.com → Your App → OAuth 2.0 → Callback URL" },
                { name: "Linear", where: "linear.app → Settings → API → OAuth Apps → Callback URLs" },
                { name: "Notion", where: "notion.so → My Integrations → OAuth → Redirect URIs" },
              ].map((p) => (
                <div key={p.name} className="flex items-start gap-1.5 px-2 py-1 rounded border">
                  <span className="font-semibold text-foreground shrink-0">{p.name}:</span>
                  <span className="text-[10px]">{p.where}</span>
                </div>
              ))}
            </div>
          </div>

          <Cmd label="Run verification scripts (from deployment-scripts/)" command={[
            `./verify-customer.sh <SLUG>`,
            `./smoke-test.sh <SLUG>`,
          ].join("\n")} />

          <p className="text-xs text-muted-foreground"><strong>Manual spot-checks:</strong></p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>1. Open the customer's URL — should show Clerk login page</p>
            <p>2. Convex dashboard → customer's project → <code className="bg-accent px-1 rounded">agents</code> table → 5 rows</p>
            <p>3. Convex dashboard → <code className="bg-accent px-1 rounded">planLimits</code> table → 3 rows</p>
            <p>4. SSH to server → <code className="bg-accent px-1 rounded">systemctl is-active openclaw-agents</code> → should say "active"</p>
          </div>
        </NumberedStep>

        {/* Step 6 */}
        <NumberedStep n="6" title="Send Admin Invite & Go Live" time="~1 min">
          <p className="text-xs text-muted-foreground">
            Send an email to the admin with their dashboard URL. They'll sign up via Clerk and go through a 5-step onboarding wizard (company name → integrations → meet agents → invite team → launch).
          </p>

          <Cmd label="Email template (customize and send)" command={[
            `Subject: Your Mission Control is live!`,
            ``,
            `Hey <NAME>,`,
            ``,
            `Your Mission Control instance is ready:`,
            ``,
            `  Dashboard: https://<CUSTOMER_DOMAIN>`,
            `  Sign up with: <ADMIN_EMAIL>`,
            ``,
            `When you log in, you'll go through a quick setup:`,
            `  1. Welcome & company info`,
            `  2. Connect integrations (GitHub, Slack, etc.)`,
            `  3. Meet your AI squad (5 agents)`,
            `  4. Invite your team`,
            `  5. Launch!`,
            ``,
            `Let me know if you hit any issues.`,
            ``,
            `– Arpit`,
          ].join("\n")} />

          <p className="text-xs text-muted-foreground mt-2"><strong>Post-handoff checklist (check after 24 hours):</strong></p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>1. Customer signed up → completed onboarding wizard → landed on dashboard</p>
            <p>2. They created a test task and assigned to Kaze → Kaze woke up and worked on it</p>
            <p>3. They connected at least one integration (recommend GitHub first)</p>
            <p>4. Heartbeat page shows all 5 agents online</p>
            <p>5. Check in with customer to see if they need help</p>
          </div>
        </NumberedStep>

        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-4">
          <p className="text-sm font-bold text-green-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Done! Customer is live.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Mark all steps as done in the /ops tracking page. The customer status will automatically change to "active".
          </p>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* ON-PREM VARIANT */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="On-Prem Variant (Enterprise+ Customers)" icon={Shield} number="D" badge="Only agent server differs">
        <p className="text-sm text-muted-foreground">
          On-prem is almost identical to cloud. The <strong>only difference</strong> is who hosts the agent server (the Lightsail VM with OpenClaw). Everything else — Convex backend, Vercel frontend, OAuth, seeding — is exactly the same.
        </p>

        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-xs font-bold text-foreground">What's different:</p>
          <div className="border rounded-lg overflow-hidden text-xs">
            <table className="w-full">
              <thead>
                <tr className="bg-accent/30">
                  <td className="px-3 py-2 font-semibold text-foreground">Step</td>
                  <td className="px-3 py-2 font-semibold text-foreground">Cloud (we host)</td>
                  <td className="px-3 py-2 font-semibold text-foreground">On-Prem (they host)</td>
                </tr>
              </thead>
              <tbody>
                {[
                  ["1. Convex Project", "Same", "Same"],
                  ["2. Deploy + Env + Seed", "Same", "Same"],
                  ["3. Server + Tenant", "We run provision-server.sh + add to tenants.json", "We add to tenants.json only. They set up their own server."],
                  ["4. Configure Server", "We SSH in and configure", "We give them an install script. They run it."],
                  ["5. OAuth + Verify", "Same", "Same"],
                  ["6. Send Invite", "Same", "Same"],
                ].map(([step, cloud, onprem], i) => (
                  <tr key={step} className={i % 2 === 0 ? "bg-background" : "bg-accent/20"}>
                    <td className="px-3 py-1.5 font-medium text-foreground">{step}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{cloud}</td>
                    <td className="px-3 py-1.5 text-muted-foreground">{onprem}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-2">
          <p className="text-xs font-bold text-foreground">Install script to share with customer's DevOps team:</p>
          <Cmd label="Option 1: One-liner install" command={[
            `curl -fsSL https://install.valence.ai/agents | bash -s -- \\`,
            `  --convex-url <CONVEX_SITE_URL> \\`,
            `  --api-key vk_live_REPLACE_ME \\`,
            `  --anthropic-key sk-ant-api03-REPLACE_ME`,
          ].join("\n")} />

          <Cmd label="Option 2: Docker" command={[
            `docker run -d \\`,
            `  -e MISSION_CONTROL_URL=<CONVEX_SITE_URL> \\`,
            `  -e MISSION_CONTROL_API_KEY=vk_live_REPLACE_ME \\`,
            `  -e ANTHROPIC_API_KEY=sk-ant-api03-REPLACE_ME \\`,
            `  --name mc-agents --restart unless-stopped \\`,
            `  mission-control-agents:latest`,
          ].join("\n")} />

          <p className="text-xs text-muted-foreground"><strong>Their server needs:</strong> Ubuntu 22.04+, 2 vCPU, 2GB RAM, 10GB disk, outbound HTTPS to *.convex.cloud and api.anthropic.com.</p>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* WHAT THE CUSTOMER SEES */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="What the Customer Experiences (After You Send the Invite)" icon={Users} number="E">
        <p className="text-sm text-muted-foreground">
          The customer never sees anything technical. Here's their journey after you email them the URL:
        </p>

        <div className="space-y-2">
          {[
            { step: "1", title: "Sign up", desc: "They open their dashboard URL → see a Clerk sign-up page → create account with email + password" },
            { step: "2", title: "Welcome", desc: "Enter company name and basic info. This stores their brand config in the database." },
            { step: "3", title: "Connect Integrations", desc: "OAuth popups for GitHub, Slack, Jira, etc. Each opens the provider's auth page → they approve → redirects back." },
            { step: "4", title: "Meet the Squad", desc: "See the 5 AI agents (Kaze, Scout, Forge, Ghost, Sentinel) with roles. Just informational, no action needed." },
            { step: "5", title: "Invite Team", desc: "Optional — invite colleagues via email. They'll also sign up via the same Clerk-powered sign-up page." },
            { step: "6", title: "Launch", desc: "Completes onboarding → redirected to the main dashboard → can start creating tasks for agents." },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3 px-3 py-2 rounded-lg border">
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">{s.step}</span>
              <div>
                <p className="text-xs font-semibold text-foreground">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Callout type="info">
          <p>The customer <strong>never</strong> sees any infrastructure details, SSH commands, deployment scripts, or source code. They only interact with the polished dashboard UI. All provisioning is done by us before they get the invite link.</p>
        </Callout>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* TROUBLESHOOTING */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="Troubleshooting — Common Issues" icon={AlertTriangle} number="F">
        <div className="space-y-3">
          {[
            {
              problem: "Convex deploy fails",
              fix: "Make sure you're using --project valence-<slug> and --typecheck=disable. Check the Convex dashboard for the project — it should exist. Check dashboard logs for function errors.",
            },
            {
              problem: "Customer's subdomain shows blank page or error",
              fix: "Tenant entry missing or wrong in src/tenants.json. Check that the slug matches the subdomain, and the convexUrl/convexSiteUrl/clerkPublishableKey are correct. Commit, push, wait for Vercel redeploy.",
            },
            {
              problem: "Agents not heartbeating after Step 4",
              fix: "SSH into server: ssh -i keys/valence-<slug>-key.pem ubuntu@<IP>. Check: sudo journalctl -u openclaw-agents -n 50. Common cause: wrong MISSION_CONTROL_URL in .env — it should be the .convex.site URL, not .convex.cloud.",
            },
            {
              problem: "Agent crash / 'session recovery' spam on a task",
              fix: "Corrupt session file. SSH into server → rm ~/.openclaw/agents/<agent>/sessions/<file>.jsonl and its .lock file → sudo systemctl restart openclaw-agents.",
            },
            {
              problem: "OAuth redirect not working for customer",
              fix: "You forgot to add the callback URL to the provider's OAuth app in Step 5. Go to the provider's developer console and add: <convex-site-url>/api/integrations/oauth/callback",
            },
            {
              problem: "Customer can't sign up (Clerk error)",
              fix: "Wrong clerkPublishableKey in tenants.json for this slug. Get the correct one from Clerk dashboard → your app → API Keys. Update tenants.json, commit, push.",
            },
            {
              problem: "provision-server.sh times out or fails",
              fix: "Check AWS Lightsail console — instance may be stuck. Common: region quota exceeded. Try a different region or request AWS quota increase.",
            },
            {
              problem: "Server disk full / agents crashing after weeks of use",
              fix: "Agent session files grow large. SSH in and run: find ~/.openclaw/agents -name '*.jsonl' -size +50M -delete && sudo apt-get autoremove -y",
            },
          ].map((item, i) => (
            <div key={i} className="rounded-lg border p-3 space-y-1">
              <p className="text-xs font-semibold text-red-400">{item.problem}</p>
              <p className="text-xs text-muted-foreground">{item.fix}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* QUICK REFERENCE */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="Quick Reference — Key Values" icon={FileText} number="G">
        <div className="space-y-3">
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Naming Conventions</p>
            <div className="border rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <tbody>
                  {[
                    ["Convex project name", "valence-<slug>"],
                    ["Convex URL", "Random — e.g. https://happy-animal-123.convex.cloud"],
                    ["Convex Site URL", "Random — e.g. https://happy-animal-123.convex.site"],
                    ["Vercel project", "Single shared project (all customers)"],
                    ["Tenant config", "src/tenants.json → entry keyed by <slug>"],
                    ["Customer domain", "<slug>.use-valence.ai (or customer's own domain)"],
                    ["Lightsail instance", "valence-<slug>"],
                    ["SSH key pair", "valence-<slug>-key"],
                    ["SSH key file", "deployment-scripts/keys/valence-<slug>-key.pem"],
                  ].map(([label, value], i) => (
                    <tr key={label} className={i % 2 === 0 ? "bg-background" : "bg-accent/20"}>
                      <td className="px-3 py-1.5 font-medium text-foreground w-1/3">{label}</td>
                      <td className="px-3 py-1.5 text-muted-foreground font-mono">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">The 5 AI Agents</p>
            <div className="grid grid-cols-5 gap-2">
              {[
                { name: "Kaze", emoji: "🌀", role: "Chief of Staff — orchestrates and delegates" },
                { name: "Scout", emoji: "🔭", role: "Research & Intel — web research, data" },
                { name: "Forge", emoji: "🔨", role: "Builder — code, dev, implementation" },
                { name: "Ghost", emoji: "👻", role: "Content & Comms — writing, emails" },
                { name: "Sentinel", emoji: "🛡️", role: "QA & Review — quality, testing" },
              ].map((a) => (
                <div key={a.name} className="rounded-lg border p-2 text-center">
                  <p className="text-lg">{a.emoji}</p>
                  <p className="text-xs font-bold text-foreground">{a.name}</p>
                  <p className="text-[9px] text-muted-foreground">{a.role}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Key Scripts (in deployment-scripts/)</p>
            <div className="border rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <tbody>
                  {[
                    ["provision-customer.sh", "Full interactive provisioning (8 steps with prompts)"],
                    ["provision-server.sh", "Create Lightsail server for a customer (5 steps)"],
                    ["verify-customer.sh", "Post-provision health check (8 checks)"],
                    ["smoke-test.sh", "Full smoke test (12 checks)"],
                    ["update-all.sh", "Batch update all active customers at once"],
                    ["teardown-customer.sh", "Delete a customer completely (destructive!)"],
                  ].map(([script, desc], i) => (
                    <tr key={script} className={i % 2 === 0 ? "bg-background" : "bg-accent/20"}>
                      <td className="px-3 py-1.5 font-mono text-primary">{script}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Plan Tiers</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { plan: "Business", price: "$2,499-3,499/mo", model: "Claude Sonnet", agents: "5", deploy: "Cloud only" },
                { plan: "Enterprise", price: "$4,999-5,999/mo", model: "Sonnet + Opus", agents: "10", deploy: "Cloud or dedicated" },
                { plan: "Enterprise+", price: "Custom", model: "Custom", agents: "Unlimited", deploy: "On-prem available" },
              ].map((p) => (
                <div key={p.plan} className="rounded-lg border p-3 space-y-1">
                  <p className="text-xs font-bold text-foreground">{p.plan}</p>
                  <p className="text-xs text-primary font-semibold">{p.price}</p>
                  <div className="text-[10px] text-muted-foreground">
                    <p>Model: {p.model}</p>
                    <p>Agents: {p.agents}</p>
                    <p>Deploy: {p.deploy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Monthly Infrastructure Cost Per Customer</p>
            <div className="border rounded-lg overflow-hidden text-xs">
              <table className="w-full">
                <tbody>
                  {[
                    ["Lightsail server (small_2_0)", "~$12/mo"],
                    ["Convex (shared plan)", "Covered by our Pro plan ($25/mo total)"],
                    ["Vercel (our account)", "Free — hobby tier, unlimited projects + subdomains"],
                    ["Anthropic API (agent usage)", "Variable — depends on task volume"],
                    ["DNS / domain", "Covered by our domain registration"],
                  ].map(([item, cost], i) => (
                    <tr key={item} className={i % 2 === 0 ? "bg-background" : "bg-accent/20"}>
                      <td className="px-3 py-1.5 font-medium text-foreground">{item}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{cost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════ */}
      {/* BATCH OPERATIONS */}
      {/* ════════════════════════════════════════════════════ */}
      <Section title="Day 2+ — Batch Operations & Maintenance" icon={RefreshCw} number="H">
        <p className="text-sm text-muted-foreground">
          After onboarding multiple customers, use these to update all of them at once.
        </p>

        <Cmd label="Deploy updated Convex functions to all customers" command={`./update-all.sh --functions-only`} />
        <Cmd label="Set an env var across all customers" command={`./update-all.sh --env ANTHROPIC_API_KEY sk-ant-xxx`} />
        <Cmd label="Sync updated SOUL files to all servers" command={`./update-all.sh --soul-sync`} />
        <Cmd label="Restart agents on all servers" command={`./update-all.sh --agent-restart`} />
        <Cmd label="Trigger Vercel rebuild for all" command={`./update-all.sh --vercel-redeploy`} />
        <Cmd label="Preview without making changes (dry run)" command={`./update-all.sh --dry-run --functions-only`} />

        <Callout type="info">
          <p>All batch operations log to <code className="bg-accent px-1 rounded">deployment-scripts/logs/update_YYYYMMDD_HHMMSS.log</code>.</p>
        </Callout>
      </Section>
    </div>
  );
}
