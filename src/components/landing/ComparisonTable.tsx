import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  "Multi-agent coordination",
  "Native integrations (100+)",
  "Real API access",
  "Task dependencies + chains",
  "Episodic memory & learning",
  "Agent quality review loops",
  "Add any API via AI",
  "Voice command interface",
  "Event-driven automation",
  "Mission Autopilot",
  "Full UI + dashboard",
];

type CellValue = "yes" | "no" | "partial";

const PRODUCTS: {
  name: string;
  short: string;
  highlight?: boolean;
  subtitle?: string;
  values: CellValue[];
}[] = [
  {
    name: "Valence AI",
    short: "us",
    highlight: true,
    values: ["yes","yes","yes","yes","yes","yes","yes","yes","yes","yes","yes"],
  },
  {
    // Perplexity Computer — launched Feb 25 2026
    // Strong: 19-model orchestrator, 400+ integrations, real API calls, parallel
    // task execution, user-level memory, sandboxed, voice on mobile, autopilot-style
    // Gaps vs Valence: no persistent agent episodic memory, no custom API-via-AI
    // scraper, no webhook/event triggers, no dedicated specialist agent personas,
    // no full ops dashboard/session replay
    name: "Perplexity Computer",
    short: "PPLX",
    subtitle: "launched Feb '26",
    values: ["yes","yes","yes","yes","partial","partial","no","yes","no","yes","partial"],
  },
  {
    name: "ChatGPT",
    short: "GPT",
    values: ["no","no","partial","no","no","no","no","partial","no","partial","partial"],
  },
  {
    name: "Zapier",
    short: "ZAP",
    values: ["partial","yes","yes","yes","no","no","no","no","yes","no","yes"],
  },
  {
    name: "n8n",
    short: "N8N",
    values: ["partial","yes","yes","yes","partial","no","no","no","yes","no","yes"],
  },
  {
    name: "Paragon",
    short: "PAR",
    values: ["no","yes","yes","partial","no","no","no","no","no","no","partial"],
  },
];

function Cell({ value }: { value: CellValue }) {
  if (value === "yes") {
    return (
      <div className="flex justify-center">
        <div className="w-5 h-5 rounded-full bg-green-500/15 flex items-center justify-center">
          <span className="text-green-400 text-xs">✓</span>
        </div>
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex justify-center">
        <span className="text-yellow-500/60 text-sm leading-none">~</span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-red-400/30 text-sm leading-none">✕</span>
    </div>
  );
}

export function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <table className="w-full min-w-[600px] text-sm border-collapse">
        <thead>
          <tr>
            <th className="text-left py-3 pr-4 text-muted-foreground/60 font-normal text-xs w-44">
              Feature
            </th>
            {PRODUCTS.map((p, i) => (
              <motion.th
                key={p.name}
                initial={{ opacity: 0, y: -16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="py-3 px-2 text-center"
              >
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className="inline-block px-2 py-1 rounded-lg text-xs font-semibold"
                    style={
                      p.highlight
                        ? {
                            background: "hsl(var(--primary) / 0.12)",
                            border: "1px solid hsl(var(--primary) / 0.4)",
                            color: "hsl(var(--primary))",
                          }
                        : {
                            color: "hsl(var(--muted-foreground))",
                          }
                    }
                  >
                    {p.name}
                  </div>
                  {p.subtitle && (
                    <span className="text-[9px] text-muted-foreground/40 font-normal tracking-wide whitespace-nowrap">
                      {p.subtitle}
                    </span>
                  )}
                </div>
              </motion.th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURES.map((feature, fi) => (
            <motion.tr
              key={feature}
              initial={{ opacity: 0, x: -16 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{
                delay: 0.3 + fi * 0.05,
                duration: 0.4,
                type: "spring",
                stiffness: 150,
                damping: 20,
              }}
              className="border-t border-border/30 group"
            >
              <td className="py-3 pr-4 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {feature}
              </td>
              {PRODUCTS.map((p, pi) => (
                <td
                  key={p.name}
                  className="py-3 px-2"
                  style={
                    p.highlight
                      ? {
                          background: "hsl(var(--primary) / 0.03)",
                        }
                      : {}
                  }
                >
                  <Cell value={p.values[fi]} />
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground/50">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
            <span className="text-green-400 text-[8px]">✓</span>
          </div>
          Full support
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-yellow-500/50">~</span>
          Partial
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400/30 text-xs">✕</span>
          Not available
        </div>
      </div>
    </div>
  );
}
