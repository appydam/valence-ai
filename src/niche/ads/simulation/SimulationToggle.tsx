import { Sparkles, Radio } from "lucide-react";
import { useSimulation } from "./SimulationContext";

export function SimulationToggle() {
  const { isSimulating, setSimulating } = useSimulation();

  return (
    <div
      className={`flex items-center justify-between px-4 py-2 border-b transition-all duration-300 ${
        isSimulating
          ? "bg-gradient-to-r from-purple-500/15 via-blue-500/10 to-purple-500/15 border-purple-500/30"
          : "bg-muted/30 border-border"
      }`}
    >
      <div className="flex items-center gap-2">
        {isSimulating ? (
          <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
        ) : (
          <Sparkles className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">
          {isSimulating ? "Simulation Active" : "Simulate Mode"}
        </span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {isSimulating
            ? "— All data is demo. Toggle off to return to live."
            : "— Experience the full product with realistic demo data"}
        </span>
      </div>

      {/* Custom toggle */}
      <button
        onClick={() => setSimulating(!isSimulating)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/50 ${
          isSimulating ? "bg-purple-500" : "bg-muted-foreground/30"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            isSimulating ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
