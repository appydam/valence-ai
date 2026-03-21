import { useState, type ReactNode } from "react";
import { NicheProvider } from "./NicheContext";
import { NicheLayout } from "./NicheLayout";
import { NicheOnboardingWizard } from "./NicheOnboardingWizard";
import { getNicheConfig } from "./registry";
import { resolveNiche } from "./nicheResolver";
import type { NicheId } from "./types";

interface NicheShellProps {
  nicheId: NicheId;
  children: ReactNode;
}

const ONBOARDING_KEY_PREFIX = "niche_onboarded_";

export function NicheShell({ nicheId, children }: NicheShellProps) {
  const config = getNicheConfig(nicheId);
  const [onboarded, setOnboarded] = useState(() => {
    try {
      return localStorage.getItem(`${ONBOARDING_KEY_PREFIX}${nicheId}`) === "true";
    } catch {
      return false;
    }
  });

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Unknown niche: {nicheId}</p>
      </div>
    );
  }

  const isStandalone = resolveNiche() !== null;

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem(`${ONBOARDING_KEY_PREFIX}${nicheId}`, "true");
    } catch {
      // localStorage unavailable
    }
    setOnboarded(true);
  };

  return (
    <NicheProvider config={config} isStandalone={isStandalone}>
      <NicheLayout>
        {onboarded ? (
          children
        ) : (
          <NicheOnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </NicheLayout>
    </NicheProvider>
  );
}
