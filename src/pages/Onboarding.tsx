import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2, ArrowRight, ArrowLeft, Check, Plug, Users, Bot,
  Rocket, Sparkles, RefreshCw,
} from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const STEPS = [
  { title: "Welcome", subtitle: "Set up your workspace" },
  { title: "Integrations", subtitle: "Connect your tools" },
  { title: "Meet Your Squad", subtitle: "Your AI agents" },
  { title: "Invite Team", subtitle: "Bring your team" },
  { title: "Launch", subtitle: "You're ready!" },
];

const TOP_INTEGRATIONS = [
  { slug: "github", name: "GitHub", emoji: "🐙", description: "Code repos & PRs" },
  { slug: "slack", name: "Slack", emoji: "💬", description: "Team messaging" },
  { slug: "linear", name: "Linear", emoji: "📐", description: "Issue tracking" },
  { slug: "notion", name: "Notion", emoji: "📝", description: "Knowledge base" },
  { slug: "jira", name: "Jira", emoji: "📋", description: "Project management" },
  { slug: "google-sheets", name: "Google Sheets", emoji: "📊", description: "Spreadsheets" },
];

const AGENTS = [
  { name: "Kaze", emoji: "🌀", role: "Chief of Staff", description: "Orchestrates the squad, delegates tasks, and ensures alignment", color: "#3B82F6" },
  { name: "Scout", emoji: "🔭", role: "Research & Intel", description: "Web research, data gathering, and competitive analysis", color: "#10B981" },
  { name: "Forge", emoji: "🔨", role: "Builder", description: "Code generation, development, and technical implementation", color: "#F59E0B" },
  { name: "Ghost", emoji: "👻", role: "Content & Comms", description: "Writing, content creation, email, and communications", color: "#8B5CF6" },
  { name: "Sentinel", emoji: "🛡️", role: "QA & Review", description: "Quality assurance, code review, and testing", color: "#EF4444" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-8">
      {STEPS.map((step, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isComplete = stepNum < currentStep;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              isComplete ? "bg-green-500 text-white" :
              isActive ? "bg-primary text-primary-foreground" :
              "bg-secondary text-muted-foreground"
            }`}>
              {isComplete ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 ${stepNum < currentStep ? "bg-green-500" : "bg-secondary"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* Step 1: Welcome */
function WelcomeStep({ companyName, setCompanyName }: { companyName: string; setCompanyName: (v: string) => void }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to Mission Control</h2>
      <p className="text-sm text-muted-foreground mb-8">
        Let's set up your AI-powered workspace in a few quick steps.
      </p>
      <div className="text-left">
        <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">
          Company Name
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corp"
          className="w-full bg-secondary rounded-lg px-4 py-3 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary"
          autoFocus
        />
      </div>
    </div>
  );
}

/* Step 2: Integrations */
function IntegrationsStep({ connected, onToggle }: { connected: string[]; onToggle: (slug: string) => void }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <Plug className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-1">Connect Your Tools</h2>
        <p className="text-sm text-muted-foreground">
          One-click connect. Your agents will use these to complete tasks.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {TOP_INTEGRATIONS.map((int) => {
          const isConnected = connected.includes(int.slug);
          return (
            <button
              key={int.slug}
              onClick={() => onToggle(int.slug)}
              className={`rounded-xl border p-4 text-left transition-all ${
                isConnected
                  ? "border-green-500 bg-green-500/5"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{int.emoji}</span>
                {isConnected && <Check className="w-4 h-4 text-green-500" />}
              </div>
              <h3 className="text-sm font-semibold text-foreground">{int.name}</h3>
              <p className="text-xs text-muted-foreground">{int.description}</p>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-4">
        You can connect more integrations later from the Integrations page.
      </p>
    </div>
  );
}

/* Step 3: Meet Your Squad */
function AgentsStep() {
  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <Bot className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-1">Meet Your AI Squad</h2>
        <p className="text-sm text-muted-foreground">
          5 specialized agents ready to work for you.
        </p>
      </div>
      <div className="space-y-3">
        {AGENTS.map((agent) => (
          <div key={agent.name} className="rounded-xl border bg-card p-4 flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ backgroundColor: agent.color + "20" }}
            >
              {agent.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{agent.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: agent.color + "15", color: agent.color }}>
                  {agent.role}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{agent.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Step 4: Invite Team */
function InviteStep({ emails, setEmails, invitesSent }: { emails: string; setEmails: (v: string) => void; invitesSent: number }) {
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <Users className="w-8 h-8 text-primary mx-auto mb-3" />
        <h2 className="text-xl font-bold text-foreground mb-1">Invite Your Team</h2>
        <p className="text-sm text-muted-foreground">
          Add colleagues who will use Mission Control with you.
        </p>
      </div>
      <div>
        <label className="text-xs text-muted-foreground font-medium mb-1 block uppercase tracking-wider">
          Email Addresses
        </label>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder={"alice@company.com\nbob@company.com\ncharlie@company.com"}
          className="w-full h-32 bg-secondary rounded-lg px-4 py-3 text-sm text-foreground border-0 outline-none focus:ring-2 focus:ring-primary resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          One email per line. They'll be invited as Members.
        </p>
      </div>
      {invitesSent > 0 && (
        <div className="mt-3 rounded-lg border border-green-500/20 bg-green-500/5 p-3 flex items-center gap-2">
          <Check className="w-4 h-4 text-green-500" />
          <p className="text-xs text-green-500">{invitesSent} invite{invitesSent !== 1 ? "s" : ""} sent</p>
        </div>
      )}
    </div>
  );
}

/* Step 5: Launch */
function LaunchStep({ companyName, connected, invitesSent }: { companyName: string; connected: string[]; invitesSent: number }) {
  return (
    <div className="text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
        <Rocket className="w-8 h-8 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">You're All Set!</h2>
      <p className="text-sm text-muted-foreground mb-8">
        {companyName ? `${companyName}'s` : "Your"} Mission Control workspace is ready.
      </p>
      <div className="rounded-xl border bg-card p-4 text-left space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{companyName || "Workspace"}</p>
            <p className="text-xs text-muted-foreground">Company configured</p>
          </div>
          <Check className="w-4 h-4 text-green-500 ml-auto" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Plug className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{connected.length} integration{connected.length !== 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground">Connected</p>
          </div>
          <Check className="w-4 h-4 text-green-500 ml-auto" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">5 agents</p>
            <p className="text-xs text-muted-foreground">Ready to work</p>
          </div>
          <Check className="w-4 h-4 text-green-500 ml-auto" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{invitesSent} teammate{invitesSent !== 1 ? "s" : ""} invited</p>
            <p className="text-xs text-muted-foreground">{invitesSent > 0 ? "Invitations sent" : "You can invite later"}</p>
          </div>
          <Check className="w-4 h-4 text-green-500 ml-auto" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main Onboarding Page ─── */
const OnboardingPage = () => {
  const navigate = useNavigate();
  const currentUser = useQuery(api.users.getCurrentUser);
  const onboardingState = useQuery(api.onboarding.getCurrent);
  const initOnboarding = useMutation(api.onboarding.initialize);
  const updateStep = useMutation(api.onboarding.updateStep);
  const completeOnboarding = useMutation(api.onboarding.complete);
  const upsertBrand = useMutation(api.brandConfig.upsert);
  const inviteUser = useMutation(api.users.inviteUser);

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>([]);
  const [inviteEmails, setInviteEmails] = useState("");
  const [invitesSent, setInvitesSent] = useState(0);
  const [finishing, setFinishing] = useState(false);

  // Initialize onboarding state on mount
  useEffect(() => {
    if (currentUser && !onboardingState) {
      initOnboarding({ userId: currentUser.clerkId });
    }
    if (onboardingState) {
      setStep(onboardingState.currentStep);
      setCompanyName(onboardingState.companyName ?? "");
      setConnectedIntegrations(onboardingState.integrationsConnected ?? []);
      setInvitesSent(onboardingState.teamInvitesSent ?? 0);
    }
  }, [currentUser, onboardingState]);

  // Already completed — redirect
  useEffect(() => {
    if (onboardingState?.completed) {
      navigate("/", { replace: true });
    }
  }, [onboardingState?.completed]);

  const userId = currentUser?.clerkId ?? "";

  const handleToggleIntegration = (slug: string) => {
    setConnectedIntegrations((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleNext = async () => {
    const nextStep = step + 1;

    // Save progress at each step
    if (step === 1 && companyName.trim()) {
      await upsertBrand({ companyName: companyName.trim() });
      await updateStep({ userId, currentStep: nextStep, companyName: companyName.trim() });
    } else if (step === 2) {
      await updateStep({ userId, currentStep: nextStep, integrationsConnected: connectedIntegrations });
    } else if (step === 3) {
      await updateStep({ userId, currentStep: nextStep, agentsConfigured: true });
    } else if (step === 4) {
      // Send invites
      const emails = inviteEmails
        .split("\n")
        .map((e) => e.trim())
        .filter((e) => e.includes("@"));
      let sent = 0;
      for (const email of emails) {
        try {
          await inviteUser({ email, role: "member", invitedBy: userId });
          sent++;
        } catch {
          // Skip duplicates/errors silently
        }
      }
      setInvitesSent(sent);
      await updateStep({ userId, currentStep: nextStep, teamInvitesSent: sent });
    }

    if (nextStep <= 5) {
      setStep(nextStep);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await completeOnboarding({ userId });
      navigate("/", { replace: true });
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
    setFinishing(false);
  };

  const canProceed = () => {
    if (step === 1) return companyName.trim().length > 0;
    return true; // All other steps are optional
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="w-6 h-6" />
            <span className="text-sm font-semibold text-foreground">Mission Control</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Step {step} of {STEPS.length}: {STEPS[step - 1].title}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          <StepIndicator currentStep={step} />

          {step === 1 && <WelcomeStep companyName={companyName} setCompanyName={setCompanyName} />}
          {step === 2 && <IntegrationsStep connected={connectedIntegrations} onToggle={handleToggleIntegration} />}
          {step === 3 && <AgentsStep />}
          {step === 4 && <InviteStep emails={inviteEmails} setEmails={setInviteEmails} invitesSent={invitesSent} />}
          {step === 5 && <LaunchStep companyName={companyName} connected={connectedIntegrations} invitesSent={invitesSent} />}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="border-t bg-card/50 backdrop-blur-sm px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {step < 5 && step > 1 && (
              <button
                onClick={() => { setStep(step + 1); }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/80 transition-colors disabled:opacity-50"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={finishing}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {finishing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                {finishing ? "Launching..." : "Go to Dashboard"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
