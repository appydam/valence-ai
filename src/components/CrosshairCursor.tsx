import { useEffect, useRef } from "react";

// Liquid metal mercury drop cursor
// - Morphs shape based on velocity (stretches in direction of travel)
// - Leaves a fading trail of smaller drops behind it
// - Squishes on click with surface tension ripple
// - Metallic silver gradient, no glow

const TRAIL_LENGTH = 8;

interface TrailDot {
  x: number;
  y: number;
  age: number; // 0 = newest, TRAIL_LENGTH = oldest
}

export function CrosshairCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pos = useRef({ x: -300, y: -300 });
  const smooth = useRef({ x: -300, y: -300 });
  const vel = useRef({ x: 0, y: 0 });
  const trail = useRef<TrailDot[]>([]);
  const clicking = useRef(false);
  const clickAnim = useRef(0); // 0..1, drives squish
  const raf = useRef<number>(0);
  const frame = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    // Force hide native cursor immediately — belt-and-suspenders alongside CSS
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const onDown = () => { clicking.current = true; };
    const onUp = () => { clicking.current = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    const loop = () => {
      frame.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lerp smooth position
      const lerpAmt = 0.22;
      const prevX = smooth.current.x;
      const prevY = smooth.current.y;
      smooth.current.x += (pos.current.x - smooth.current.x) * lerpAmt;
      smooth.current.y += (pos.current.y - smooth.current.y) * lerpAmt;
      vel.current.x = smooth.current.x - prevX;
      vel.current.y = smooth.current.y - prevY;

      const speed = Math.sqrt(vel.current.x ** 2 + vel.current.y ** 2);

      // Push new trail point every other frame
      if (frame.current % 2 === 0) {
        trail.current.unshift({ x: smooth.current.x, y: smooth.current.y, age: 0 });
        if (trail.current.length > TRAIL_LENGTH) trail.current.pop();
        trail.current.forEach((d, i) => { d.age = i; });
      }

      // Click animation
      if (clicking.current) {
        clickAnim.current = Math.min(1, clickAnim.current + 0.12);
      } else {
        clickAnim.current = Math.max(0, clickAnim.current - 0.07);
      }

      // --- Draw trail drops ---
      for (let i = trail.current.length - 1; i >= 1; i--) {
        const d = trail.current[i];
        const t = 1 - d.age / TRAIL_LENGTH; // 1=new, 0=old
        const r = 3.5 * t * t;
        if (r < 0.5) continue;

        const alpha = t * t * 0.55;

        // Metallic gradient for trail
        const grd = ctx.createRadialGradient(d.x - r * 0.3, d.y - r * 0.3, 0, d.x, d.y, r);
        grd.addColorStop(0, `rgba(255,255,255,${alpha})`);
        grd.addColorStop(0.4, `rgba(200,210,220,${alpha * 0.8})`);
        grd.addColorStop(1, `rgba(120,135,150,${alpha * 0.2})`);

        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }

      // --- Draw main drop ---
      const cx = smooth.current.x;
      const cy = smooth.current.y;

      // Shape: stretches along velocity direction when moving fast
      const baseR = 9;
      const stretchFactor = Math.min(speed * 0.28, 7);
      const angle = speed > 0.5 ? Math.atan2(vel.current.y, vel.current.x) : 0;

      // Squish on click: flatten perpendicular, expand along axis
      const clickSquish = clickAnim.current;
      const scaleAlong = 1 + stretchFactor / baseR - clickSquish * 0.35;
      const scalePerp = 1 / scaleAlong + clickSquish * 0.4;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(scaleAlong, scalePerp);

      // Outer metallic body
      const bodyR = baseR;
      const bodyGrd = ctx.createRadialGradient(-bodyR * 0.3, -bodyR * 0.35, 0, 0, 0, bodyR * 1.1);
      bodyGrd.addColorStop(0,    "rgba(255, 255, 255, 0.98)");
      bodyGrd.addColorStop(0.2,  "rgba(230, 238, 245, 0.95)");
      bodyGrd.addColorStop(0.55, "rgba(170, 185, 200, 0.90)");
      bodyGrd.addColorStop(0.8,  "rgba(100, 118, 138, 0.85)");
      bodyGrd.addColorStop(1,    "rgba(50,  65,  80,  0.70)");

      ctx.beginPath();
      ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
      ctx.fillStyle = bodyGrd;
      ctx.fill();

      // Inner specular highlight (top-left bright spot)
      const hlGrd = ctx.createRadialGradient(-bodyR * 0.28, -bodyR * 0.32, 0, -bodyR * 0.1, -bodyR * 0.1, bodyR * 0.55);
      hlGrd.addColorStop(0,   "rgba(255,255,255,0.95)");
      hlGrd.addColorStop(0.5, "rgba(255,255,255,0.3)");
      hlGrd.addColorStop(1,   "rgba(255,255,255,0)");

      ctx.beginPath();
      ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
      ctx.fillStyle = hlGrd;
      ctx.fill();

      // Bottom-right shadow to sell the 3D sphere
      const shadowGrd = ctx.createRadialGradient(bodyR * 0.3, bodyR * 0.35, 0, bodyR * 0.1, bodyR * 0.1, bodyR);
      shadowGrd.addColorStop(0,   "rgba(20,25,35,0.45)");
      shadowGrd.addColorStop(0.6, "rgba(20,25,35,0.15)");
      shadowGrd.addColorStop(1,   "rgba(20,25,35,0)");

      ctx.beginPath();
      ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
      ctx.fillStyle = shadowGrd;
      ctx.fill();

      // Thin dark rim
      ctx.beginPath();
      ctx.arc(0, 0, bodyR, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(40,50,65,0.55)";
      ctx.lineWidth = 0.8 / Math.max(scaleAlong, scalePerp); // compensate for scale
      ctx.stroke();

      ctx.restore();

      // Click ripple: expanding thin ring
      if (clickAnim.current > 0.01) {
        const rippleR = baseR + 6 * clickAnim.current;
        const rippleAlpha = clickAnim.current * 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200,215,230,${rippleAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
}
