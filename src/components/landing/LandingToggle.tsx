import { motion } from "framer-motion";
import type { LandingTab } from "@/hooks/useLandingTab";

const TABS: { id: LandingTab; label: string; shortLabel: string }[] = [
  { id: "ai-department", label: "AI Department", shortLabel: "Department" },
  { id: "ai-workers", label: "AI Workers", shortLabel: "Workers" },
  { id: "ai-transformation", label: "AI Business Transformation", shortLabel: "Transform" },
];

interface LandingToggleProps {
  activeTab: LandingTab;
  onTabChange: (tab: LandingTab) => void;
}

export function LandingToggle({ activeTab, onTabChange }: LandingToggleProps) {
  return (
    <div
      className="fixed top-14 left-0 right-0 z-40 transition-all duration-300"
      style={{
        background: "hsl(240 25% 4% / 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid hsl(var(--border) / 0.15)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-center">
        <div
          className="relative flex items-center rounded-full p-1"
          style={{
            background: "hsl(240 25% 8% / 0.9)",
            border: "1px solid hsl(var(--border) / 0.3)",
          }}
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 whitespace-nowrap"
                style={{
                  color: isActive
                    ? "hsl(var(--foreground))"
                    : "hsl(var(--muted-foreground) / 0.5)",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="landing-tab-indicator"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(217 91% 60% / 0.15), hsl(258 90% 66% / 0.1))",
                      border: "1px solid hsl(217 91% 60% / 0.25)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10 hidden sm:inline">
                  {tab.label}
                </span>
                <span className="relative z-10 sm:hidden">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
