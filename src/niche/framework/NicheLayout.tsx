import { useState, type ReactNode, lazy, Suspense } from "react";
import { useNiche } from "./NicheContext";
import { NicheSidebar } from "./NicheSidebar";
import { CommandBar } from "./CommandBar";
import { SimulationProvider } from "../ads/simulation/SimulationContext";

const SimulationToggle = lazy(() =>
  import("../ads/simulation/SimulationToggle").then((m) => ({ default: m.SimulationToggle }))
);

export function NicheLayout({ children }: { children: ReactNode }) {
  const { config } = useNiche();
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const isAds = config.id === "ads";

  const content = (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      <NicheSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Simulation toggle — ads niche only */}
        {isAds && (
          <Suspense fallback={null}>
            <SimulationToggle />
          </Suspense>
        )}
        {/* Main content — constrained height, scrolls internally */}
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Full Command Bar modal */}
        <CommandBar externalOpen={commandBarOpen} onExternalClose={() => setCommandBarOpen(false)} />
      </div>
    </div>
  );

  // Wrap ads niche in SimulationProvider so toggle + routes share context
  return isAds ? <SimulationProvider>{content}</SimulationProvider> : content;
}
