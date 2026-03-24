import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ProvisioningStep, CommandBlock, LinkRow } from "./ProvisioningStep";
import { InfraInfoPanel } from "./InfraInfoPanel";
import {
  ArrowLeft, Loader2, ExternalLink, Pencil, Save, X,
} from "lucide-react";

// ─────────────────────────────────────────────────
// Inline infra-ID input for collecting URLs/IPs
// ─────────────────────────────────────────────────
function InfraInput({
  label,
  placeholder,
  value,
  onSave,
}: {
  label: string;
  placeholder: string;
  value?: string;
  onSave: (val: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value ?? "");

  if (value && !editing) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-500/5 border border-green-500/20 px-3 py-2">
        <span className="text-xs text-muted-foreground">{label}:</span>
        <span className="text-xs font-mono text-foreground flex-1">{value}</span>
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-foreground">
          <Pencil className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}:</span>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2 py-1.5 rounded-lg border bg-background text-xs font-mono"
        autoFocus
      />
      <button
        onClick={() => { if (input.trim()) { onSave(input.trim()); setEditing(false); } }}
        disabled={!input.trim()}
        className="p-1 rounded text-green-500 hover:bg-green-500/10 disabled:opacity-50"
      >
        <Save className="w-3.5 h-3.5" />
      </button>
      {value && (
        <button onClick={() => { setInput(value); setEditing(false); }} className="p-1 rounded text-muted-foreground hover:bg-accent">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Callout box for tips/warnings
// ─────────────────────────────────────────────────
function Callout({ type, children }: { type: "tip" | "warning" | "parallel"; children: React.ReactNode }) {
  const styles = {
    tip: "bg-blue-500/5 border-blue-500/20 text-blue-400",
    warning: "bg-yellow-500/5 border-yellow-500/20 text-yellow-400",
    parallel: "bg-green-500/5 border-green-500/20 text-green-400",
  };
  const labels = { tip: "💡 Tip", warning: "⚠️ Note", parallel: "⚡ Speed Tip" };
  return (
    <div className={`rounded-lg border p-3 ${styles[type]}`}>
      <p className="text-xs font-semibold mb-1">{labels[type]}</p>
      <div className="text-xs text-muted-foreground">{children}</div>
    </div>
  );
}

function SubStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <div className="border-l-2 border-border/50 pl-3 py-2 space-y-2">
      <p className="text-xs font-semibold text-foreground">
        <span className="text-primary font-mono">{number}</span> {title}
      </p>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Step instructions per step ID
// ─────────────────────────────────────────────────
function StepInstructions({
  stepId,
  customer,
  onUpdateInfra,
}: {
  stepId: string;
  customer: NonNullable<ReturnType<typeof useQuery<typeof api.customerProvisioning.getBySlug>>>;
  onUpdateInfra: (updates: Record<string, string>) => void;
}) {
  const s = customer.slug;
  const d = customer.domain;
  const ip = customer.lightsailIp ?? "<LIGHTSAIL_IP>";
  const convexUrl = customer.convexUrl ?? `https://valence-${s}.convex.cloud`;
  const convexSiteUrl = customer.convexSiteUrl ?? `https://valence-${s}.convex.site`;
  const keyPath = customer.sshKeyPath ?? `keys/valence-${s}-key.pem`;
  const serverSize = customer.serverSize ?? "small_2_0";
  const serverRegion = customer.serverRegion ?? "ap-south-1";

  switch (stepId) {
    // ═══════════════════════════════════════════════════
    // STEP 1: Create Convex Project (~2 min)
    // ═══════════════════════════════════════════════════
    case "create_convex":
      return (
        <>
          <Callout type="tip">This is the only fully manual step. Everything after this has copy-paste commands.</Callout>

          <SubStep number="1a" title="Open Convex Dashboard">
            <LinkRow label="Convex Dashboard" url="https://dashboard.convex.dev" description="Log in → Create a project" />
          </SubStep>

          <SubStep number="1b" title="Create the project">
            <p className="text-xs text-muted-foreground">
              Click <strong>"Create a project"</strong> → name it <code className="bg-accent px-1 rounded text-xs">valence-{s}</code> → select <strong>"Production"</strong> deployment type.
            </p>
          </SubStep>

          <SubStep number="1c" title="Copy both URLs and paste below">
            <p className="text-xs text-muted-foreground">
              After creating, go to <strong>Settings → URL & Deploy Key</strong>. Copy the deployment URL and the HTTP Actions URL.
            </p>
            <InfraInput label="Convex URL" placeholder={`https://valence-${s}.convex.cloud`} value={customer.convexUrl} onSave={(v) => onUpdateInfra({ convexUrl: v, convexProject: `valence-${s}` })} />
            <InfraInput label="Site URL" placeholder={`https://valence-${s}.convex.site`} value={customer.convexSiteUrl} onSave={(v) => onUpdateInfra({ convexSiteUrl: v })} />
          </SubStep>
        </>
      );

    // ═══════════════════════════════════════════════════
    // STEP 2: Deploy + Env + Seed (merged, ~3 min)
    // ═══════════════════════════════════════════════════
    case "deploy_and_seed":
      return (
        <>
          <Callout type="tip">This runs 3 things in sequence: deploy schema/functions, set all env vars, seed database. One copy-paste block.</Callout>

          <SubStep number="2a" title="Deploy functions + set env vars + seed (all-in-one)">
            <CommandBlock label="Run from agent-orchestrator/" command={[
              `# ── Deploy schema & functions ──`,
              `cd agent-orchestrator && npx convex deploy --project valence-${s} --typecheck=disable`,
              ``,
              `# ── Set environment variables ──`,
              `npx convex env set ALLOWED_ORIGIN "https://${d}" --project valence-${s}`,
              `npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.valence.ai" --project valence-${s}`,
              `# SSH proxy & wakeup run on the customer's Lightsail server`,
              `# Set these AFTER Step 3 when you have the server IP:`,
              `# npx convex env set SSH_PROXY_URL "http://<LIGHTSAIL_IP>:3001" --project valence-${s}`,
              `# npx convex env set AGENT_WAKEUP_WEBHOOK_URL "http://<LIGHTSAIL_IP>:3333" --project valence-${s}`,
              `npx convex env set ANTHROPIC_API_KEY "sk-ant-api03-REPLACE_ME" --project valence-${s}`,
              `npx convex env set INTEGRATION_ENCRYPTION_KEY "$(openssl rand -hex 32)" --project valence-${s}`,
              `npx convex env set SSH_PROXY_SECRET "$(openssl rand -hex 16)" --project valence-${s}`,
              `npx convex env set AGENT_WAKEUP_WEBHOOK_SECRET "$(openssl rand -hex 16)" --project valence-${s}`,
              ``,
              `# ── OAuth secrets (same across all customers) ──`,
              `npx convex env set OAUTH_SECRET_GITHUB "f488481cd66bf82267354e93bf76dce1b168b3d9" --project valence-${s}`,
              `# npx convex env set OAUTH_SECRET_SLACK "REPLACE_ME" --project valence-${s}`,
              `# npx convex env set OAUTH_SECRET_GOOGLE "REPLACE_ME" --project valence-${s}`,
              ``,
              `# ── Seed database ──`,
              `npx convex run seedCustomer:seedNewCustomer '{"companyName":"${customer.companyName}","adminEmail":"${customer.adminEmail}"}' --url ${convexUrl}`,
              `npx convex run billing:seedPlanLimits '{}' --url ${convexUrl}`,
            ].join("\n")} />
          </SubStep>

          <Callout type="warning">
            <p><strong>ANTHROPIC_API_KEY:</strong> Replace <code className="bg-accent px-0.5 rounded">sk-ant-api03-REPLACE_ME</code> with {customer.anthropicKeyPreference === "customer_provides" ? "the customer's API key" : "your Anthropic API key"}.</p>
            <p className="mt-1"><strong>OAuth secrets:</strong> Uncomment Slack/Google lines when you have those client secrets.</p>
          </Callout>
        </>
      );

    // ═══════════════════════════════════════════════════
    // STEP 3: Provision Server + Register Tenant (PARALLEL)
    // ═══════════════════════════════════════════════════
    case "provision_server_and_vercel":
      return (
        <>
          <Callout type="parallel">
            Run the server provisioning script in <strong>Terminal 1</strong>, then immediately add the tenant config + subdomain while the server bootstraps (~5 min). Both happen at the same time.
          </Callout>

          {/* Part A: Lightsail */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
            <p className="text-xs font-bold text-primary">TERMINAL 1 — Lightsail Server (takes ~5 min, runs in background)</p>

            <SubStep number="3a" title="Run provision-server.sh">
              <CommandBlock label="Run from agent-orchestrator/deployment-scripts/" command={[
                `cd agent-orchestrator/deployment-scripts`,
                `./provision-server.sh ${s} ${serverSize}`,
              ].join("\n")} />
              <p className="text-xs text-muted-foreground">
                This creates an SSH key at <code className="bg-accent px-1 rounded">{keyPath}</code>, launches a <code className="bg-accent px-1 rounded">{serverSize}</code> Lightsail instance in <code className="bg-accent px-1 rounded">{serverRegion}</code>, opens port 22, and waits for Node.js + OpenClaw bootstrap to finish.
              </p>
            </SubStep>

            <SubStep number="3b" title="Paste the Lightsail IP when script finishes">
              <InfraInput label="Lightsail IP" placeholder="13.233.xx.xx" value={customer.lightsailIp} onSave={(v) => onUpdateInfra({ lightsailIp: v, lightsailInstance: `valence-${s}`, sshKeyPath: `keys/valence-${s}-key.pem` })} />
            </SubStep>
          </div>

          {/* Part B: Tenant config + subdomain — do while waiting */}
          <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 space-y-2">
            <p className="text-xs font-bold text-yellow-400">EDITOR + BROWSER — Register Tenant (do while server bootstraps)</p>
            <p className="text-[10px] text-muted-foreground">We use a single Vercel project for all customers. Just add the tenant config and subdomain — no new Vercel project needed.</p>

            <SubStep number="3c" title="Add tenant entry to src/tenants.json">
              <CommandBlock label="Add this entry inside the 'tenants' object in src/tenants.json" command={[
                `"${s}": {`,
                `  "convexUrl": "${convexUrl}",`,
                `  "convexSiteUrl": "${convexSiteUrl}",`,
                `  "clerkPublishableKey": "pk_live_REPLACE_ME"`,
                `}`,
              ].join("\n")} />
            </SubStep>

            <SubStep number="3d" title="Commit + push to trigger Vercel redeploy">
              <CommandBlock label="Commit the tenant config change" command={[
                `git add src/tenants.json`,
                `git commit -m "Add tenant: ${s}"`,
                `git push`,
              ].join("\n")} />
              <p className="text-xs text-muted-foreground">Vercel auto-deploys on push (~30 sec). The app reads the subdomain and looks up the Convex URL from tenants.json.</p>
            </SubStep>

            <SubStep number="3e" title="Add subdomain to Vercel + DNS">
              <LinkRow label="Vercel Dashboard → Settings → Domains" url="https://vercel.com/dashboard" description="Add domain to existing project" />
              <p className="text-xs text-muted-foreground mt-1">
                Add <code className="bg-accent px-1 rounded">{d}</code> to the Vercel project's domains. Then in your DNS provider, add a CNAME record: <code className="bg-accent px-1 rounded">{s}</code> → <code className="bg-accent px-1 rounded">cname.vercel-dns.com</code>. Wait ~1-5 min for propagation.
              </p>
            </SubStep>

            <SubStep number="3f" title="Verify the site loads">
              <p className="text-xs text-muted-foreground">
                Open <code className="bg-accent px-1 rounded">https://{d}</code> — should show the Clerk login page.
              </p>
            </SubStep>
          </div>

          <Callout type="warning">
            <strong>Clerk:</strong> Get the publishable key from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Clerk Dashboard</a> → your app → API Keys. If using a shared Clerk instance across customers, use the same key.
          </Callout>
        </>
      );

    // ═══════════════════════════════════════════════════
    // STEP 4: Configure Agent Server (merged: SOUL + env + start)
    // ═══════════════════════════════════════════════════
    case "configure_agent_server":
      return (
        <>
          <Callout type="tip">
            One SSH session to do everything: sync files, set env, start agents. Make sure Step 3's server provisioning is finished first (you have the IP).
          </Callout>

          <SubStep number="4a" title="Sync SOUL files, skills, and Kaze root SOUL">
            <CommandBlock label="Run from agent-orchestrator/deployment-scripts/" command={[
              `# Sync agent SOUL files (scout, forge, ghost, sentinel)`,
              `rsync -avz -e "ssh -i ${keyPath}" \\`,
              `  ../server-files/agents/ \\`,
              `  ubuntu@${ip}:/home/ubuntu/.openclaw/workspace/agents/`,
              ``,
              `# Sync Kaze's root SOUL.md (special — lives at workspace root)`,
              `scp -i ${keyPath} \\`,
              `  ../server-files/SOUL.md \\`,
              `  ubuntu@${ip}:/home/ubuntu/.openclaw/workspace/SOUL.md`,
              ``,
              `# Sync skills`,
              `rsync -avz -e "ssh -i ${keyPath}" \\`,
              `  ../server-files/skills/ \\`,
              `  ubuntu@${ip}:/home/ubuntu/.openclaw/workspace/skills/`,
            ].join("\n")} />
          </SubStep>

          <SubStep number="4b" title="Set server environment variables + start agents">
            <CommandBlock label="Single SSH command — sets .env and starts service" command={[
              `ssh -i ${keyPath} ubuntu@${ip} 'bash -s' << 'REMOTE'`,
              `# Write environment file`,
              `cat > ~/.openclaw/.env << 'EOF'`,
              `MISSION_CONTROL_URL=${convexSiteUrl}`,
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
          </SubStep>

          <Callout type="warning">
            <p><strong>MISSION_CONTROL_API_KEY:</strong> Generate this from the customer's Convex dashboard or use a shared key for the pilot.</p>
            <p className="mt-1"><strong>ANTHROPIC_API_KEY:</strong> {customer.anthropicKeyPreference === "customer_provides" ? "Use the customer's key." : "Use your Anthropic API key."}</p>
          </Callout>

          <SubStep number="4c" title="Quick SSH verify (optional)">
            <CommandBlock label="Confirm agents are alive" command={`ssh -i ${keyPath} ubuntu@${ip} "systemctl is-active openclaw-agents && ls ~/.openclaw/workspace/agents/ && echo '--- All good ---'"`} />
          </SubStep>
        </>
      );

    // ═══════════════════════════════════════════════════
    // STEP 5: OAuth + Verify + Smoke Test (merged)
    // ═══════════════════════════════════════════════════
    case "oauth_and_verify":
      return (
        <>
          <SubStep number="5a" title="Add OAuth redirect URI to each provider">
            <p className="text-xs text-muted-foreground mb-2">
              Add this URL as an additional redirect URI in each OAuth app's settings. You only need to add the providers the customer wants:
            </p>
            <CommandBlock label="Callback URL to add" command={`${convexSiteUrl}/api/integrations/oauth/callback`} />
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { name: "GitHub", url: "https://github.com/settings/developers", note: "OAuth Apps → your app → Callback URLs" },
                { name: "Slack", url: "https://api.slack.com/apps", note: "OAuth & Permissions → Redirect URLs" },
                { name: "Google", url: "https://console.cloud.google.com/apis/credentials", note: "OAuth 2.0 Client → Authorized redirect URIs" },
                { name: "Jira", url: "https://developer.atlassian.com/console/myapps/", note: "OAuth 2.0 → Callback URL" },
                { name: "Linear", url: "https://linear.app/settings/api", note: "OAuth Applications → Callback URLs" },
                { name: "Notion", url: "https://www.notion.so/my-integrations", note: "OAuth Domain & URIs → Redirect URI" },
              ].map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-2 py-1.5 rounded-lg border hover:bg-accent/30 transition-colors text-xs">
                  <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">{p.name}</span>
                    <p className="text-[10px] text-muted-foreground">{p.note}</p>
                  </div>
                </a>
              ))}
            </div>
          </SubStep>

          <SubStep number="5b" title="Run verification + smoke test">
            <CommandBlock label="Quick verify (checks Convex, Vercel, SSH, agents)" command={`cd agent-orchestrator/deployment-scripts && ./verify-customer.sh ${s}`} />
            <CommandBlock label="Full smoke test (12 checks)" command={`./smoke-test.sh ${s}`} />
          </SubStep>

          <SubStep number="5c" title="Manual spot-check">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Open <code className="bg-accent px-1 rounded">https://{d}</code> — should see Clerk login page</p>
              <p>2. Check Convex dashboard — <code className="bg-accent px-1 rounded">agents</code> table should have 5 rows (Kaze, Scout, Forge, Ghost, Sentinel)</p>
              <p>3. Check Convex dashboard — <code className="bg-accent px-1 rounded">planLimits</code> table should have 3 rows</p>
              <p>4. SSH to server — <code className="bg-accent px-1 rounded">systemctl is-active openclaw-agents</code> should say "active"</p>
            </div>
          </SubStep>
        </>
      );

    // ═══════════════════════════════════════════════════
    // STEP 6: Send Invite & Go Live
    // ═══════════════════════════════════════════════════
    case "send_invite":
      return (
        <>
          <SubStep number="6a" title="Send the admin invite email">
            <p className="text-xs text-muted-foreground">
              Send an email to <strong className="text-foreground">{customer.adminEmail}</strong> with:
            </p>
            <CommandBlock label="Email template" command={[
              `Subject: Your Valence AI is live!`,
              ``,
              `Hey ${customer.contactName || "there"},`,
              ``,
              `Your Valence AI instance is ready:`,
              ``,
              `  Dashboard: https://${d}`,
              `  Sign up with: ${customer.adminEmail}`,
              ``,
              `When you log in, you'll go through a quick 5-step setup:`,
              `  1. Welcome & company name`,
              `  2. Connect integrations (GitHub, Slack, etc.)`,
              `  3. Meet your AI squad (5 agents)`,
              `  4. Invite team members`,
              `  5. Launch!`,
              ``,
              `Let me know if you hit any issues.`,
              ``,
              `– Arpit`,
            ].join("\n")} />
          </SubStep>

          <SubStep number="6b" title="Post-handoff checklist">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Customer signs up via Clerk → lands on onboarding wizard</p>
              <p>2. Onboarding completes → redirected to dashboard</p>
              <p>3. They create a test task and assign to Kaze → Kaze wakes up and works on it</p>
              <p>4. They connect at least one integration (GitHub recommended)</p>
              <p>5. Heartbeat shows all 5 agents online</p>
            </div>
          </SubStep>

          <Callout type="tip">
            <p><strong>Pilot success criteria:</strong> Agents complete at least 10 real tasks in the first week. Check in with the customer after 24 hours and again after 1 week.</p>
          </Callout>
        </>
      );

    // ═══════════════════════════════════════════════════
    // ON-PREM: Register Tenant + Add Subdomain (no new Vercel project)
    // ═══════════════════════════════════════════════════
    case "create_vercel":
      return (
        <>
          <p className="text-[10px] text-muted-foreground">We use a single Vercel project for all customers. Just add the tenant config and subdomain.</p>

          <SubStep number="3a" title="Add tenant entry to src/tenants.json">
            <CommandBlock label="Add this entry inside the 'tenants' object" command={[
              `"${s}": {`,
              `  "convexUrl": "${convexUrl}",`,
              `  "convexSiteUrl": "${convexSiteUrl}",`,
              `  "clerkPublishableKey": "pk_live_REPLACE_ME"`,
              `}`,
            ].join("\n")} />
          </SubStep>

          <SubStep number="3b" title="Commit + push to trigger Vercel redeploy">
            <CommandBlock label="Commit the tenant config change" command={[
              `git add src/tenants.json`,
              `git commit -m "Add tenant: ${s}"`,
              `git push`,
            ].join("\n")} />
          </SubStep>

          <SubStep number="3c" title="Add subdomain to Vercel + DNS">
            <LinkRow label="Vercel Dashboard → Settings → Domains" url="https://vercel.com/dashboard" description="Add domain to existing project" />
            <p className="text-xs text-muted-foreground mt-1">
              Add <code className="bg-accent px-1 rounded">{d}</code> → CNAME <code className="bg-accent px-1 rounded">{s}</code> → <code className="bg-accent px-1 rounded">cname.vercel-dns.com</code>. Verify at <code className="bg-accent px-1 rounded">https://{d}</code>.
            </p>
          </SubStep>
        </>
      );

    // ═══════════════════════════════════════════════════
    // ON-PREM: Customer server setup
    // ═══════════════════════════════════════════════════
    case "onprem_server_setup":
      return (
        <>
          <SubStep number="4a" title="Generate install command for customer">
            <p className="text-xs text-muted-foreground mb-1">Share this one-liner with the customer's DevOps team:</p>
            <CommandBlock label="Install script" command={[
              `curl -fsSL https://install.valence.ai/agents | bash -s -- \\`,
              `  --convex-url ${convexUrl} \\`,
              `  --api-key vk_live_REPLACE_ME \\`,
              `  --anthropic-key sk-ant-api03-REPLACE_ME`,
            ].join("\n")} />

            <p className="text-xs text-muted-foreground mt-2">Or Docker alternative:</p>
            <CommandBlock label="Docker" command={[
              `docker run -d \\`,
              `  -e MISSION_CONTROL_URL=${convexSiteUrl} \\`,
              `  -e MISSION_CONTROL_API_KEY=vk_live_REPLACE_ME \\`,
              `  -e ANTHROPIC_API_KEY=sk-ant-api03-REPLACE_ME \\`,
              `  --name mc-agents \\`,
              `  --restart unless-stopped \\`,
              `  mission-control-agents:latest`,
            ].join("\n")} />
          </SubStep>

          <SubStep number="4b" title="Share requirements with customer">
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Server requirements:</strong></p>
              <p>- Ubuntu 22.04+ (or Debian 11+)</p>
              <p>- 2 vCPU, 2GB RAM, 10GB disk minimum</p>
              <p>- Outbound HTTPS to: <code className="bg-accent px-0.5 rounded">*.convex.cloud</code>, <code className="bg-accent px-0.5 rounded">api.anthropic.com</code></p>
              <p>- Inbound SSH (port 22) from Railway SSH proxy IP</p>
            </div>
          </SubStep>

          <SubStep number="4c" title="Verify customer server is connected">
            <p className="text-xs text-muted-foreground">
              Once the customer confirms setup, verify from the dashboard: <strong>Settings → SSH Configuration → Test Connection</strong>.
              All 5 agents should appear in the heartbeat within 2-3 minutes.
            </p>
            <InfraInput label="Customer Server IP" placeholder="10.0.1.50 (their internal IP)" value={customer.lightsailIp} onSave={(v) => onUpdateInfra({ lightsailIp: v })} />
          </SubStep>
        </>
      );

    default:
      return <p className="text-xs text-muted-foreground italic">No instructions for this step.</p>;
  }
}

// ─────────────────────────────────────────────────
// Main Detail View
// ─────────────────────────────────────────────────
export function CustomerDetail({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const customer = useQuery(api.customerProvisioning.getBySlug, { slug });
  const updateStep = useMutation(api.customerProvisioning.updateStep);
  const updateInfraIds = useMutation(api.customerProvisioning.updateInfraIds);

  if (customer === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-sm text-muted-foreground">Customer "{slug}" not found.</p>
        <button onClick={onBack} className="text-sm text-primary hover:underline">Back to list</button>
      </div>
    );
  }

  const stepsTotal = customer.steps.length;
  const stepsDone = customer.steps.filter((s) => s.status === "done" || s.status === "skipped").length;
  const progress = stepsTotal > 0 ? Math.round((stepsDone / stepsTotal) * 100) : 0;

  const handleMarkDone = async (stepId: string) => {
    await updateStep({ id: customer._id, stepId, status: "done" });
  };

  const handleMarkFailed = async (stepId: string, reason: string) => {
    await updateStep({ id: customer._id, stepId, status: "failed", failedReason: reason });
  };

  const handleRetry = async (stepId: string) => {
    await updateStep({ id: customer._id, stepId, status: "pending" });
  };

  const handleUpdateInfra = async (updates: Record<string, string>) => {
    await updateInfraIds({ id: customer._id, ...updates });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-accent transition-colors mt-1">
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-foreground">{customer.companyName}</h2>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              customer.plan === "business" ? "bg-blue-500/10 text-blue-500" :
              customer.plan === "enterprise" ? "bg-purple-500/10 text-purple-500" :
              "bg-orange-500/10 text-orange-500"
            }`}>
              {customer.plan.replace("_", " ")}
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
              {customer.deploymentModel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-mono">{customer.slug}</span>
            <span>{customer.domain}</span>
            <span>{customer.adminEmail}</span>
            {customer.contactName && <span>{customer.contactName} ({customer.contactRole})</span>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm font-semibold text-foreground">{progress}%</div>
          <div className="text-xs text-muted-foreground">{stepsDone}/{stepsTotal} steps</div>
          <div className="w-24 h-1.5 rounded-full bg-accent overflow-hidden mt-1">
            <div
              className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-primary"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      {customer.notes && (
        <div className="rounded-lg bg-accent/30 border px-4 py-2">
          <p className="text-xs text-muted-foreground"><strong>Notes:</strong> {customer.notes}</p>
        </div>
      )}

      {/* Main content: steps + infra sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Steps */}
        <div className="rounded-xl border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Provisioning Steps ({customer.deploymentModel === "cloud" ? "Cloud" : "On-Prem"})
          </h3>
          <div className="space-y-0">
            {customer.steps.map((step, i) => (
              <ProvisioningStep
                key={step.id}
                step={step}
                stepNumber={i + 1}
                isLast={i === customer.steps.length - 1}
                onMarkDone={() => handleMarkDone(step.id)}
                onMarkFailed={(reason) => handleMarkFailed(step.id, reason)}
                onRetry={() => handleRetry(step.id)}
              >
                <StepInstructions
                  stepId={step.id}
                  customer={customer}
                  onUpdateInfra={handleUpdateInfra}
                />
              </ProvisioningStep>
            ))}
          </div>
        </div>

        {/* Infra sidebar */}
        <div className="space-y-4">
          <InfraInfoPanel customer={customer} />

          {/* Quick links */}
          <div className="rounded-xl border bg-card p-4 space-y-2">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Quick Links</h3>
            <div className="space-y-1">
              {customer.convexUrl && (
                <a href={`https://dashboard.convex.dev`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-3 h-3" /> Convex Dashboard
                </a>
              )}
              {customer.domain && (
                <a href={`https://${customer.domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink className="w-3 h-3" /> Live Site
                </a>
              )}
              <a href="https://lightsail.aws.amazon.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors">
                <ExternalLink className="w-3 h-3" /> AWS Lightsail
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
