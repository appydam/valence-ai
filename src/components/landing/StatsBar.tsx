import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const STATS = [
  { label: "Autonomous Agents", value: 5, suffix: "", prefix: "" },
  { label: "Live Integrations", value: 94, suffix: "", prefix: "" },
  { label: "API Actions", value: 2400, suffix: "+", prefix: "" },
  { label: "Platform Cost", value: 0, suffix: "/mo", prefix: "$", highlight: true },
];

function AnimatedNumber({ target, started }: { target: number; started: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!started) return;
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const duration = 1200;
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) ** 2;
      setCurrent(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }, [started, target]);

  return <>{current}</>;
}

export function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div
      ref={ref}
      className="w-full border-y border-border/40 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, hsl(217 91% 60% / 0.03) 50%, transparent 100%)",
      }}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 pointer-events-none animate-hud-shimmer"
        style={{
          background:
            "linear-gradient(90deg, transparent 20%, hsl(217 91% 60% / 0.06) 50%, transparent 80%)",
          backgroundSize: "200% 100%",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-6 px-4 relative"
          >
            {/* Divider */}
            {i > 0 && (
              <div className="absolute left-0 top-1/4 h-1/2 w-px bg-border/40" />
            )}

            <div
              className="text-3xl font-bold font-mono tabular-nums"
              style={{
                color: stat.highlight ? "hsl(142, 71%, 45%)" : "hsl(var(--foreground))",
              }}
            >
              <span className="text-muted-foreground/60 text-lg">{stat.prefix}</span>
              <AnimatedNumber target={stat.value} started={isInView} />
              <span className="text-muted-foreground/60 text-lg">{stat.suffix}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1 tracking-wide text-center">
              {stat.label}
            </div>

            {/* Data blink dot */}
            <div
              className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/30 animate-data-blink"
              style={{ animationDelay: `${i * 0.25}s` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
