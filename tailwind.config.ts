import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          hover: "hsl(var(--surface-hover))",
          active: "hsl(var(--surface-active))",
        },
        agent: {
          kaze: "hsl(var(--agent-kaze))",
          scout: "hsl(var(--agent-scout))",
          forge: "hsl(var(--agent-forge))",
          ghost: "hsl(var(--agent-ghost))",
        },
        status: {
          online: "hsl(var(--status-online))",
          working: "hsl(var(--status-working))",
          idle: "hsl(var(--status-idle))",
          offline: "hsl(var(--status-offline))",
        },
        priority: {
          urgent: "hsl(var(--priority-urgent))",
          high: "hsl(var(--priority-high))",
          medium: "hsl(var(--priority-medium))",
          low: "hsl(var(--priority-low))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "ticker": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "particle-rise": {
          "0%": { transform: "translateY(0px)", opacity: "0.7" },
          "100%": { transform: "translateY(-140px)", opacity: "0" },
        },
        "cloak-sway": {
          "0%, 100%": { transform: "skewX(-1.5deg)" },
          "50%": { transform: "skewX(1.5deg)" },
        },
        "ground-pulse": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.6" },
        },
        "ring-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "spark-fall": {
          "0%": { transform: "translateY(0px) translateX(0px)", opacity: "1" },
          "100%": { transform: "translateY(60px) translateX(var(--spark-x, 10px))", opacity: "0" },
        },
        "wisp-float": {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)", opacity: "0.4" },
          "50%": { transform: "translateY(-20px) translateX(8px)", opacity: "0.8" },
        },
        "walk-bob": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "zone-pulse": {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.35" },
        },
        "float-gentle": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "scanline-scroll": {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 6px" },
        },
        "neon-flicker": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
          "53%": { opacity: "1" },
          "55%": { opacity: "0.9" },
        },
        "energy-expand": {
          "0%": { transform: "scale(1)", opacity: "0.15" },
          "100%": { transform: "scale(1.4)", opacity: "0" },
        },
        "signal-ring": {
          "0%": { transform: "scale(0.3)", opacity: "0.6" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
        "hud-shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "data-blink": {
          "0%, 49%": { opacity: "0.3" },
          "50%, 100%": { opacity: "0.8" },
        },
        "scan-sweep": {
          "0%": { top: "100%", opacity: "0" },
          "10%": { opacity: "0.15" },
          "90%": { opacity: "0.15" },
          "100%": { top: "0%", opacity: "0" },
        },
        "floor-pulse": {
          "0%, 100%": { backgroundSize: "200% 200%" },
          "50%": { backgroundSize: "300% 300%" },
        },
        "city-float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "window-flicker": {
          "0%, 49%": { opacity: "0.2" },
          "50%, 100%": { opacity: "0.9" },
        },
        "billboard-glow": {
          "0%, 100%": { opacity: "0.7", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.3)" },
        },
        "vehicle-slide": {
          "0%": { transform: "translateX(-120px)" },
          "100%": { transform: "translateX(calc(100vw + 120px))" },
        },
        "data-packet-rise": {
          "0%": { transform: "translateY(0px)", opacity: "0.8" },
          "100%": { transform: "translateY(-80px)", opacity: "0" },
        },
        "building-appear": {
          "0%": { transform: "scaleY(0)", opacity: "0" },
          "100%": { transform: "scaleY(1)", opacity: "1" },
        },
        "mist-drift": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "vine-sway": {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "bubble-rise": {
          "0%": { transform: "translateY(0px)", opacity: "0.6" },
          "100%": { transform: "translateY(-80px)", opacity: "0" },
        },
        "lava-flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "rain-fall": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "10%": { opacity: "0.15" },
          "90%": { opacity: "0.15" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "spore-bloom": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "bioluminescence": {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "0.8" },
        },
        "ink-expand": {
          "0%": { transform: "scale(0)", opacity: "0.1" },
          "50%": { transform: "scale(1)", opacity: "0.06" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        "lightning-flash": {
          "0%, 95%, 100%": { opacity: "0" },
          "96%, 98%": { opacity: "0.04" },
          "97%": { opacity: "0" },
        },
        "sand-rake": {
          "0%": { strokeDashoffset: "100" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "ticker": "ticker 25s linear infinite",
        "particle-rise": "particle-rise 3s ease-in infinite",
        "cloak-sway": "cloak-sway 5s ease-in-out infinite",
        "ground-pulse": "ground-pulse 2.5s ease-in-out infinite",
        "ring-rotate": "ring-rotate 8s linear infinite",
        "spark-fall": "spark-fall 1.5s ease-in infinite",
        "wisp-float": "wisp-float 4s ease-in-out infinite",
        "walk-bob": "walk-bob 0.5s ease-in-out infinite",
        "zone-pulse": "zone-pulse 3s ease-in-out infinite",
        "float-gentle": "float-gentle 3s ease-in-out infinite",
        "scanline-scroll": "scanline-scroll 8s linear infinite",
        "neon-flicker": "neon-flicker 4s ease-in-out infinite",
        "energy-expand": "energy-expand 3s ease-out infinite",
        "signal-ring": "signal-ring 2s ease-out infinite",
        "hud-shimmer": "hud-shimmer 3s linear infinite",
        "data-blink": "data-blink 1s steps(1) infinite",
        "scan-sweep": "scan-sweep 3s linear infinite",
        "floor-pulse": "floor-pulse 4s ease-in-out infinite",
        "city-float": "city-float 4s ease-in-out infinite",
        "window-flicker": "window-flicker 2s steps(1) infinite",
        "billboard-glow": "billboard-glow 3s ease-in-out infinite",
        "vehicle-slide": "vehicle-slide 6s linear infinite",
        "data-packet-rise": "data-packet-rise 3s ease-out infinite",
        "building-appear": "building-appear 0.6s ease-out both",
        "mist-drift": "mist-drift 12s ease-in-out infinite",
        "vine-sway": "vine-sway 4s ease-in-out infinite",
        "bubble-rise": "bubble-rise 6s ease-in infinite",
        "lava-flow": "lava-flow 8s linear infinite",
        "rain-fall": "rain-fall 0.5s linear infinite",
        "spore-bloom": "spore-bloom 0.6s ease-out",
        "bioluminescence": "bioluminescence 4s ease-in-out infinite",
        "ink-expand": "ink-expand 3s ease-out infinite",
        "lightning-flash": "lightning-flash 5s linear infinite",
        "sand-rake": "sand-rake 4s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
