import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, ExternalLink, ArrowRight, X } from "lucide-react";

interface PilotModalProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  { icon: "1", title: "Clone the repo", body: "git clone https://github.com/appydam/valence-ai" },
  { icon: "2", title: "Set up Convex + Clerk", body: "Create a free Convex project and a free Clerk app. Both have generous free tiers." },
  { icon: "3", title: "Configure your server", body: "Provision any Linux VPS (AWS Lightsail, DigitalOcean, Hetzner). Install Node.js and OpenClaw." },
  { icon: "4", title: "Add your API keys", body: "Set ANTHROPIC_API_KEY and your integration OAuth secrets in Convex env vars." },
  { icon: "5", title: "Launch your agents", body: "Create agents from the UI, sync their SOUL files, and start assigning tasks." },
];

export function PilotModal({ open, onClose }: PilotModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 hidden sm:flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl overflow-y-auto relative"
              style={{
                background: "hsl(240 25% 7%)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                boxShadow: "0 0 60px hsl(var(--primary) / 0.1), 0 24px 80px rgba(0,0,0,0.6)",
                maxHeight: "calc(100vh - 2rem)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
              <button onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10">
                <X className="w-4 h-4" />
              </button>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono tracking-widest px-2 py-0.5 rounded"
                    style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}>
                    OPEN SOURCE · MIT
                  </span>
                </div>

                <h2 className="text-2xl font-bold mb-2">Get started in minutes</h2>
                <p className="text-sm text-muted-foreground mb-7 leading-relaxed">
                  Valence AI is fully self-hosted. Clone, configure, and deploy your agent squad on any Linux server.
                </p>

                <div className="space-y-3 mb-8">
                  {STEPS.map((step) => (
                    <div key={step.title}
                      className="flex gap-3 p-3 rounded-xl"
                      style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold"
                        style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold mb-0.5">{step.title}</div>
                        <div className="text-xs text-muted-foreground/70 leading-relaxed">{step.body}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://github.com/appydam/valence-ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  >
                    <Github className="w-4 h-4" />
                    View on GitHub
                    <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                  </a>
                  <button
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                    style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Mobile bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 sm:hidden overflow-y-auto"
            style={{
              background: "hsl(240 25% 7%)",
              borderTop: "1px solid hsl(var(--primary) / 0.25)",
              borderRadius: "20px 20px 0 0",
              maxHeight: "82dvh",
            }}
          >
            <div className="flex justify-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
            <button onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors z-10">
              <X className="w-4 h-4" />
            </button>

            <div className="px-4 pt-3 pb-6">
              <h2 className="text-lg font-bold mb-1">Get started</h2>
              <p className="text-xs text-muted-foreground mb-4">Self-host Valence AI on your own server.</p>

              <div className="space-y-2 mb-5">
                {STEPS.map((step) => (
                  <div key={step.title}
                    className="flex gap-2.5 p-2.5 rounded-lg"
                    style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold"
                      style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                      {step.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{step.title}</div>
                      <div className="text-[11px] text-muted-foreground/60 leading-snug">{step.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://github.com/appydam/valence-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 mb-2"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                <Github className="w-4 h-4" />
                View on GitHub
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
