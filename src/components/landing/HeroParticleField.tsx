import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface HeroParticleFieldProps {
  opacity?: number;
}

const AGENT_COLORS = [
  "hsl(217, 91%, 60%)",  // kaze - blue
  "hsl(160, 84%, 39%)",  // scout - teal
  "hsl(38, 92%, 50%)",   // forge - orange
  "hsl(258, 90%, 66%)",  // ghost - purple
  "hsl(330, 81%, 60%)",  // sentinel - pink
];

export function HeroParticleField({ opacity = 1 }: HeroParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastArc = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const isMobile = window.innerWidth < 768;
    const count = isMobile ? 50 : 120;

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      color: AGENT_COLORS[Math.floor(Math.random() * AGENT_COLORS.length)],
      size: 0.5 + Math.random() * 1.5,
      alpha: 0.08 + Math.random() * 0.25,
    }));

    // Arc animation state
    const arcs: {
      x1: number; y1: number; x2: number; y2: number;
      color: string; t: number; speed: number;
    }[] = [];

    function spawnArc() {
      if (!canvas) return;
      const i = Math.floor(Math.random() * particles.length);
      const j = Math.floor(Math.random() * particles.length);
      if (i === j) return;
      arcs.push({
        x1: particles[i].x,
        y1: particles[i].y,
        x2: particles[j].x,
        y2: particles[j].y,
        color: particles[i].color,
        t: 0,
        speed: 0.004 + Math.random() * 0.004,
      });
    }

    function tick(now: number) {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn arcs periodically
      if (now - lastArc > 2500) {
        spawnArc();
        lastArc = now;
      }

      // Draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(")", `, ${p.alpha})`).replace("hsl(", "hsla(");
        ctx.fill();
      }

      // Draw arcs
      for (let i = arcs.length - 1; i >= 0; i--) {
        const a = arcs[i];
        a.t += a.speed;
        if (a.t > 1) {
          arcs.splice(i, 1);
          continue;
        }

        // Control point above midpoint
        const mx = (a.x1 + a.x2) / 2;
        const my = (a.y1 + a.y2) / 2 - 80;

        // Draw fading trail path
        const colorBase = a.color.replace("hsl(", "").replace(")", "");
        ctx.beginPath();
        ctx.moveTo(a.x1, a.y1);
        ctx.quadraticCurveTo(mx, my, a.x2, a.y2);
        ctx.strokeStyle = `hsla(${colorBase}, ${(1 - a.t) * 0.15})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Traveling dot along bezier
        const bx = (1 - a.t) ** 2 * a.x1 + 2 * (1 - a.t) * a.t * mx + a.t ** 2 * a.x2;
        const by = (1 - a.t) ** 2 * a.y1 + 2 * (1 - a.t) * a.t * my + a.t ** 2 * a.y2;
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${colorBase}, ${0.7 * (1 - a.t * 0.5)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(tick);
    }

    animId = requestAnimationFrame(tick);

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animId);
      } else {
        animId = requestAnimationFrame(tick);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [prefersReduced]);

  if (prefersReduced) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, hsl(217 91% 60% / 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, hsl(258 90% 66% / 0.06) 0%, transparent 50%)",
          opacity,
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity }}
    />
  );
}
