import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useNiche } from "./NicheContext";
import { Rocket, Plug, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

interface NicheOnboardingWizardProps {
  onComplete: () => void;
}

export function NicheOnboardingWizard({ onComplete }: NicheOnboardingWizardProps) {
  const { config } = useNiche();
  const [step, setStep] = useState(0);
  const connections = useQuery(api.connections.listAll);

  const connectedSlugs = new Set(
    (connections ?? [])
      .filter((c: { status: string }) => c.status === "active")
      .map((c: { blueprintSlug: string }) => c.blueprintSlug)
  );

  const steps = [
    {
      title: `Welcome to ${config.name}`,
      description: config.tagline,
      content: (
        <div className="text-center space-y-4">
          <div
            className="inline-flex items-center justify-center w-20 h-20 rounded-2xl text-4xl"
            style={{ background: `${config.accentColor}15` }}
          >
            {config.emoji}
          </div>
          <h2 className="text-xl font-bold text-foreground">{config.name}</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {config.tagline}. Connect your tools, and let AI agents handle the rest.
          </p>
        </div>
      ),
    },
    {
      title: "Connect Your Integrations",
      description: "Link the tools you use",
      content: (
        <div className="space-y-3 max-w-md mx-auto">
          <p className="text-sm text-muted-foreground text-center mb-4">
            Connect these integrations to unlock the full power of {config.name}
          </p>
          {[...config.requiredIntegrations, ...config.optionalIntegrations].map((slug) => {
            const isRequired = config.requiredIntegrations.includes(slug);
            const isConnected = connectedSlugs.has(slug);
            return (
              <div
                key={slug}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card"
              >
                <div className="flex items-center gap-3">
                  <Plug className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium capitalize">
                    {slug.replace(/-/g, " ")}
                  </span>
                  {isRequired && (
                    <span className="text-[10px] font-medium text-yellow-500">Required</span>
                  )}
                </div>
                {isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Link
                    to="/integrations"
                    className="text-xs font-medium px-3 py-1.5 rounded-md text-white transition-colors"
                    style={{ background: config.accentColor }}
                  >
                    Connect
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "You're All Set!",
      description: "Start using " + config.name,
      content: (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10">
            <Sparkles className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Ready to Go!</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Your {config.name} is set up. Start by exploring the dashboard or launch your first AI-powered workflow.
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="max-w-lg w-full space-y-8">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width: i === step ? 32 : 16,
                background: i <= step ? config.accentColor : "hsl(0,0%,20%)",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="py-8">{currentStep.content}</div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          )}

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: config.accentColor }}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ background: config.accentColor }}
            >
              <Rocket className="w-4 h-4" />
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
