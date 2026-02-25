import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";


interface PilotModalProps {
  open: boolean;
  onClose: () => void;
}

export function PilotModal({ open, onClose }: PilotModalProps) {
  const [step, setStep] = useState<"why" | "form" | "done">("why");
  const [form, setForm] = useState({ name: "", email: "", company: "", role: "", useCase: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitInterest = useMutation(api.pilotInterest.submitInterest);
  const sendEmail = useAction(api.pilotInterest.sendNotificationEmail);

  // Reset on open
  useEffect(() => {
    if (open) { setStep("why"); setForm({ name: "", email: "", company: "", role: "", useCase: "" }); setError(""); }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.company) { setError("Name, email and company are required."); return; }
    setSubmitting(true);
    setError("");
    try {
      // Store in Convex DB
      const recordId = await submitInterest({
        name: form.name,
        email: form.email,
        company: form.company,
        role: form.role || undefined,
        useCase: form.useCase || undefined,
      });

      // Fire-and-forget to Google Forms (free, zero-setup email notification via Google Sheets)
      const gformData = new FormData();
      gformData.append("entry.1233762851", form.name);
      gformData.append("entry.1073073031", form.email);
      gformData.append("entry.537521153", form.company);
      gformData.append("entry.844825173", form.role || "");
      gformData.append("entry.1316109638", form.useCase || "");
      fetch(
        "https://docs.google.com/forms/d/e/1FAIpQLSflrP3yFJ_GxGe_jS1g4L7aEIybsbFMxCK1bkvBFqnmtW-qAg/formResponse",
        { method: "POST", body: gformData, mode: "no-cors" }
      ).catch(() => {});

      // Fire-and-forget Resend email (if API key is set)
      sendEmail({
        name: form.name,
        email: form.email,
        company: form.company,
        role: form.role || undefined,
        useCase: form.useCase || undefined,
        recordId,
      }).catch(() => {});

      setStep("done");
    } catch {
      setError("Something went wrong. Please email us directly at arpitdhamija.ai@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-lg rounded-2xl overflow-hidden relative"
              style={{
                background: "hsl(240 25% 7%)",
                border: "1px solid hsl(var(--primary) / 0.25)",
                boxShadow: "0 0 60px hsl(var(--primary) / 0.1), 0 24px 80px rgba(0,0,0,0.6)",
              }}
            >
              {/* Top glow */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-lg z-10"
              >
                ✕
              </button>

              <AnimatePresence mode="wait">
                {/* ── Step 1: WHY ── */}
                {step === "why" && (
                  <motion.div
                    key="why"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.2 }}
                    className="p-8"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <span className="text-xs font-mono tracking-widest px-2 py-1 rounded" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}>
                        SELECTIVE PILOT PROGRAM
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 leading-tight">
                      Why we're not open to everyone <span className="text-muted-foreground/70">- yet.</span>
                    </h2>

                    <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                      Valence AI isn't a SaaS app you spin up with a credit card. Each deployment is a dedicated, isolated environment — five AI agents running on their own infrastructure, with your integrations, your data, your workflows.
                    </p>

                    <div className="space-y-3 mb-6">
                      {[
                        { icon: "🖥️", title: "Dedicated server per person per team", body: "Every pilot gets a private AWS instance — no shared compute, no noisy neighbours. Your agents run isolated." },
                        { icon: "🔌", title: "Custom integration setup", body: "configuring your OAuth connections, webhook endpoints, and API keys. This takes real engineering time." },
                        { icon: "🧠", title: "Agent onboarding", body: "Each agent's SOUL file is tailored to your business context. Out-of-the-box agents don't know your stack — we make them." },
                        { icon: "🤝", title: "White-glove launch", body: "We sit with you for the first mission to make sure everything fires correctly. This is a relationship, not a signup flow." },
                      ].map((item) => (
                        <div key={item.title} className="flex gap-3 p-3 rounded-xl" style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                          <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
                          <div>
                            <div className="text-sm font-semibold text-foreground">{item.title}</div>
                            <div className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{item.body}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-muted-foreground/50 mb-3 font-mono">
                      We're onboarding a small cohort of pilot companies. If it's a fit, you'll hear from Arpit directly within 48 hours.
                    </p>
                    <p className="text-xs text-muted-foreground/40 mb-5 font-mono">
                      Questions? Email{" "}
                      <a href="mailto:arpitdhamija.ai@gmail.com" className="text-primary/60 hover:text-primary/80 transition-colors">
                        arpitdhamija.ai@gmail.com
                      </a>
                    </p>

                    <button
                      onClick={() => setStep("form")}
                      className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all relative overflow-hidden"
                      style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 24px hsl(var(--primary) / 0.3)" }}
                    >
                      <span className="relative z-10">Apply for a Pilot Spot →</span>
                      <div className="absolute inset-0 animate-hud-shimmer pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)", backgroundSize: "200% 100%" }} />
                    </button>
                  </motion.div>
                )}

                {/* ── Step 2: FORM ── */}
                {step === "form" && (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.2 }}
                    className="p-8"
                  >
                    <button onClick={() => setStep("why")} className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors mb-5 font-mono flex items-center gap-1">
                      ← Back
                    </button>

                    <h2 className="text-xl font-bold mb-1">Tell us about your team</h2>
                    <p className="text-sm text-muted-foreground/60 mb-6">Arpit will review your application and reach out personally.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1.5">Your Name *</label>
                          <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Jane Smith"
                            className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors"
                            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                            onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.5)"}
                            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1.5">Work Email *</label>
                          <input
                            type="email"
                            value={form.email}
                            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                            placeholder="jane@company.com"
                            className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors"
                            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                            onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.5)"}
                            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1.5">Company *</label>
                          <input
                            type="text"
                            value={form.company}
                            onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                            placeholder="Acme Inc."
                            className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors"
                            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                            onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.5)"}
                            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1.5">Your Role</label>
                          <input
                            type="text"
                            value={form.role}
                            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                            placeholder="CEO, Head of Ops…"
                            className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors"
                            style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                            onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.5)"}
                            onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1.5">What would you use Valence for?</label>
                        <textarea
                          value={form.useCase}
                          onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
                          placeholder="e.g. Automate our sales pipeline, weekly reporting, onboarding new hires…"
                          rows={3}
                          className="w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors resize-none"
                          style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }}
                          onFocus={e => e.target.style.borderColor = "hsl(var(--primary) / 0.5)"}
                          onBlur={e => e.target.style.borderColor = "hsl(var(--border))"}
                        />
                      </div>

                      {error && <p className="text-xs text-red-400/80 font-mono">{error}</p>}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50"
                        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 20px hsl(var(--primary) / 0.25)" }}
                      >
                        {submitting ? "Submitting…" : "Submit Application →"}
                      </button>

                      <p className="text-center text-[10px] text-muted-foreground/60 font-mono">
                        No spam. Arpit reads every submission personally.
                      </p>
                    </form>
                  </motion.div>
                )}

                {/* ── Step 3: DONE ── */}
                {step === "done" && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                      style={{ background: "hsl(142 71% 45% / 0.12)", border: "1px solid hsl(142 71% 45% / 0.3)" }}
                    >
                      <span className="text-2xl">✓</span>
                    </motion.div>

                    <h2 className="text-2xl font-bold mb-2">Application received.</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                      Thanks for your interest. Arpit will personally review your application and reach out to <span className="text-foreground font-mono">{form.email}</span> within 48 hours.
                    </p>

                    <div className="p-4 rounded-xl text-left mb-6" style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
                      <p className="text-xs font-mono text-muted-foreground/50 mb-2 tracking-widest uppercase">In the meantime</p>
                      <p className="text-sm text-muted-foreground/70 leading-relaxed">
                        Feel free to explore the platform demo above, or reach out directly at{" "}
                        <a href="mailto:arpitdhamija.ai@gmail.com" className="text-primary/70 hover:text-primary transition-colors">
                          arpitdhamija.ai@gmail.com
                        </a>
                        {" "}if you have questions.
                      </p>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                      style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
