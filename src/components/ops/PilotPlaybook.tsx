import {
  Clock, ClipboardList, MessageSquare, Users, CheckCircle2,
  Phone, FileText, Rocket,
} from "lucide-react";

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="w-4 h-4 rounded border-2 border-muted-foreground/30 shrink-0 mt-0.5" />
      <span className="text-sm text-foreground">{children}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-5 space-y-3">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h3>
      {children}
    </div>
  );
}

export function PilotPlaybook() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Pilot Playbook
        </h2>
        <p className="text-xs text-muted-foreground">Quick reference for onboarding pilot customers</p>
      </div>

      {/* Pre-Call Prep */}
      <Section title="Before the Call" icon={Phone}>
        <div className="space-y-0">
          <CheckItem>Research company (LinkedIn, website, tech stack, team size)</CheckItem>
          <CheckItem>Review pilot interest submission (if they filled the form)</CheckItem>
          <CheckItem>Prepare demo environment — ensure your own instance is clean</CheckItem>
          <CheckItem>Know the likely plan tier based on company size</CheckItem>
          <CheckItem>Have pricing page ready to screen-share</CheckItem>
        </div>
      </Section>

      {/* Info to Collect */}
      <Section title="Info to Collect from Client" icon={ClipboardList}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Required</p>
            <CheckItem>Company name (legal entity)</CheckItem>
            <CheckItem>Primary domain preference (e.g., acme.valence.ai)</CheckItem>
            <CheckItem>Admin email (who gets first login)</CheckItem>
            <CheckItem>Primary contact name + role</CheckItem>
            <CheckItem>Preferred plan tier</CheckItem>
          </div>
          <div className="space-y-0">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">Helpful</p>
            <CheckItem>Day-1 integrations (GitHub, Slack, Jira, etc.)</CheckItem>
            <CheckItem>Anthropic API key preference (we provide vs they provide)</CheckItem>
            <CheckItem>Deployment preference (cloud vs on-prem)</CheckItem>
            <CheckItem>Compliance requirements (SOC2, HIPAA, data residency)</CheckItem>
            <CheckItem>Number of expected users</CheckItem>
          </div>
        </div>
      </Section>

      {/* Same-Day Timeline */}
      <Section title="Same-Day Setup Timeline" icon={Clock}>
        <div className="space-y-2">
          {[
            { time: "0:00", task: "Demo call + collect info", duration: "30 min", icon: MessageSquare },
            { time: "0:30", task: "Create Convex project + Vercel app", duration: "15 min", icon: Rocket },
            { time: "0:45", task: "Run provisioning script (auto)", duration: "10 min", icon: Rocket },
            { time: "0:55", task: "Lightsail server bootstrap", duration: "8 min", icon: Rocket },
            { time: "1:03", task: "Sync SOUL files + set env vars", duration: "5 min", icon: Rocket },
            { time: "1:08", task: "Add OAuth callbacks", duration: "5 min", icon: Rocket },
            { time: "1:13", task: "Verify + smoke test", duration: "5 min", icon: CheckCircle2 },
            { time: "1:18", task: "Send admin invite email", duration: "2 min", icon: Users },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg border">
              <span className="text-xs font-mono text-primary font-semibold w-10 shrink-0">{step.time}</span>
              <step.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground flex-1">{step.task}</span>
              <span className="text-[10px] text-muted-foreground shrink-0">{step.duration}</span>
            </div>
          ))}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mt-2">
            <p className="text-sm font-semibold text-primary">Total: ~80 minutes from call to live</p>
          </div>
        </div>
      </Section>

      {/* Post-Setup */}
      <Section title="Post-Setup Verification" icon={CheckCircle2}>
        <div className="space-y-0">
          <CheckItem>Customer signs up via Clerk and lands on onboarding</CheckItem>
          <CheckItem>Onboarding wizard completes (company name, integrations, squad, invite)</CheckItem>
          <CheckItem>Create a test task and assign to Kaze — verify Kaze wakes up</CheckItem>
          <CheckItem>Connect at least one OAuth integration (GitHub recommended)</CheckItem>
          <CheckItem>Heartbeat shows all 5 agents online</CheckItem>
          <CheckItem>SSH proxy can reach agent server</CheckItem>
          <CheckItem>Dashboard loads all pages without errors</CheckItem>
        </div>
      </Section>

      {/* Pilot Talking Points */}
      <Section title="Pilot Talking Points" icon={MessageSquare}>
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong className="text-foreground">Pilot duration:</strong> 2 weeks, 50% off first month</p>
          <p><strong className="text-foreground">Setup time:</strong> Same-day — you'll have access within 2 hours of our call</p>
          <p><strong className="text-foreground">What's included:</strong> 5 AI agents, ~100 integrations, full observability, dedicated support during pilot</p>
          <p><strong className="text-foreground">Success criteria:</strong> Agents complete at least 10 real tasks in the first week</p>
          <p><strong className="text-foreground">After pilot:</strong> Month-to-month billing, cancel anytime, no contracts during pilot</p>
        </div>
      </Section>
    </div>
  );
}
