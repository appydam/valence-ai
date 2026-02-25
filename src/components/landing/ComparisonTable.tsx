import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const FEATURES = [
  "Multi-agent coordination",
  "30+ live integrations",
  "Real API access",
  "Task dependencies + chains",
  "Episodic memory & learning",
  "Quality review loops",
  "Add any API via AI",
  "Full UI + dashboard",
  "$0 platform cost",
  "Production reliability",
];

type CellValue = "yes" | "no" | "partial";

const PRODUCTS: {
  name: string;
  short: string;
  highlight?: boolean;
  values: CellValue[];
}[] = [
  {
    name: "Mission Control",
    short: "MC",
    highlight: true,
    values: ["yes","yes","yes","yes","yes","yes","yes","yes","yes","yes"],
  },
  {
    name: "ChatGPT",
    short: "GPT",
    values: ["no","no","partial","no","no","no","no","partial","partial","partial"],
  },
  {
    name: "Zapier",
    short: "ZAP",
    values: ["no","yes","yes","partial","no","no","no","yes","no","yes"],
  },
  {
    name: "AutoGPT",
    short: "AGT",
    values: ["partial","no","partial","no","partial","no","no","no","yes","no"],
  },
  {
    name: "Paragon",
    short: "PAR",
    values: ["no","yes","yes","no","no","no","no","partial","no","yes"],
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
