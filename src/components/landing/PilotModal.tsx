import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface PilotModalProps {
  open: boolean;
  onClose: () => void;
}

// ─── Shared step content ──────────────────────────────────────────────────────

function WhyStep({ onNext, mobile }: { onNext: () => void; mobile?: boolean }) {
  const p = mobile ? "px-4 pt-3 pb-5" : "p-8";
  return (
    <motion.div
      key="why"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.2 }}
      className={p}
    >
      <div className={`flex items-center gap-2 ${mobile ? "mb-2" : "mb-4"}`}>
        <span className="text-xs font-mono tracking-widest px-2 py-0.5 rounded" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}>
          SELECTIVE PILOT PROGRAM
        </span>
      </div>

      <h2 className={`font-bold leading-tight ${mobile ? "text-lg mb-2" : "text-2xl mb-3"}`}>
        Why we're not open to everyone <span className="text-muted-foreground/70">- yet.</span>
      </h2>

      {!mobile && (
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          Valence AI isn't a SaaS app you spin up with a credit card. Each deployment is a dedicated, isolated environment — five AI agents running on their own infrastructure, with your integrations, your data, your workflows.
        </p>
      )}

      <div className={mobile ? "space-y-1.5 mb-4" : "space-y-2.5 mb-6"}>
        {[
          { icon: "🖥️", title: "Dedicated server per team", body: "Private AWS instance — no shared compute." },
          { icon: "🔌", title: "Custom integration setup", body: "OAuth, webhooks, and API keys configured for you." },
          { icon: "🧠", title: "Agent onboarding", body: "SOUL files tailored to your business context." },
          { icon: "🤝", title: "White-glove launch", body: "We run the first mission with you to ensure everything fires." },
        ].map((item) => (
          <div key={item.title} className={`flex gap-2.5 rounded-lg ${mobile ? "p-2" : "p-3 rounded-xl"}`} style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
            <span className={`flex-shrink-0 ${mobile ? "text-base mt-0" : "text-lg mt-0.5"}`}>{item.icon}</span>
            <div>
              <div className={`font-semibold text-foreground ${mobile ? "text-xs" : "text-sm"}`}>{item.title}</div>
              {!mobile && <div className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{item.body}</div>}
              {mobile && <div className="text-[11px] text-muted-foreground/60 leading-snug">{item.body}</div>}
            </div>
          </div>
        ))}
      </div>

      <p className={`text-muted-foreground/50 font-mono ${mobile ? "text-[10px] mb-3" : "text-xs mb-2"}`}>
        Small cohort of pilots. Hear from Arpit within 48h.{" "}
        {mobile && (
          <a href="mailto:arpitdhamija.ai@gmail.com" className="text-primary/60 hover:text-primary/80 transition-colors">
            arpitdhamija.ai@gmail.com
          </a>
        )}
      </p>

      {!mobile && (
        <p className="text-xs text-muted-foreground/40 mb-5 font-mono">
          Questions? Email{" "}
          <a href="mailto:arpitdhamija.ai@gmail.com" className="text-primary/60 hover:text-primary/80 transition-colors">
            arpitdhamija.ai@gmail.com
          </a>
        </p>
      )}

      <button
        onClick={onNext}
        className={`w-full rounded-xl text-sm font-bold tracking-wide transition-all relative overflow-hidden ${mobile ? "py-2.5 mt-1" : "py-3 mt-3"}`}
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 24px hsl(var(--primary) / 0.3)" }}
      >
        <span className="relative z-10">Apply for a Pilot Spot →</span>
        <div className="absolute inset-0 animate-hud-shimmer pointer-events-none" style={{ background: "linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.1) 50%, transparent 80%)", backgroundSize: "200% 100%" }} />
      </button>
    </motion.div>
  );
}

type FormData = { name: string; email: string; company: string; role: string; useCase: string };

function FormStep({
  form, setForm, error, submitting, onBack, onSubmit, mobile,
}: {
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  error: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  mobile?: boolean;
}) {
  const p = mobile ? "px-4 pt-3 pb-5" : "p-8";
  const inputStyle = { border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" };
  const inputCls = mobile
    ? "w-full px-3 py-2 rounded-lg text-sm bg-transparent outline-none transition-colors"
    : "w-full px-3 py-2.5 rounded-lg text-sm bg-transparent outline-none transition-colors";
  const focusStyle = "hsl(var(--primary) / 0.5)";
  const blurStyle = "hsl(var(--border))";

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className={p}
    >
      <button onClick={onBack} className={`text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors font-mono flex items-center gap-1 ${mobile ? "mb-2" : "mb-4"}`}>
        ← Back
      </button>

      <h2 className={`font-bold mb-0.5 ${mobile ? "text-lg" : "text-xl"}`}>Tell us about your team</h2>
      <p className={`text-muted-foreground/60 ${mobile ? "text-xs mb-3" : "text-sm mb-5"}`}>Arpit will review your application and reach out personally.</p>

      <form onSubmit={onSubmit} className={mobile ? "space-y-2" : "space-y-3"}>
        {/* Name + Email — side-by-side on mobile too (saves vertical space) */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1">Your Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Jane Smith"
              className={inputCls}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = focusStyle}
              onBlur={e => e.target.style.borderColor = blurStyle}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1">Work Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jane@company.com"
              className={inputCls}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = focusStyle}
              onBlur={e => e.target.style.borderColor = blurStyle}
            />
          </div>
        </div>

        {/* Company + Role — side-by-side on mobile too */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1">Company *</label>
            <input
              type="text"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Acme Inc."
              className={inputCls}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = focusStyle}
              onBlur={e => e.target.style.borderColor = blurStyle}
            />
          </div>
          <div>
            <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1">Your Role</label>
            <input
              type="text"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              placeholder="CEO, Head of Ops…"
              className={inputCls}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = focusStyle}
              onBlur={e => e.target.style.borderColor = blurStyle}
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-mono tracking-widest text-muted-foreground/50 uppercase block mb-1">What would you use Valence for?</label>
          <textarea
            value={form.useCase}
            onChange={e => setForm(f => ({ ...f, useCase: e.target.value }))}
            placeholder="e.g. Automate our sales pipeline, weekly reporting…"
            rows={mobile ? 2 : 3}
            className={`${inputCls} resize-none`}
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = focusStyle}
            onBlur={e => e.target.style.borderColor = blurStyle}
          />
        </div>

        {error && <p className="text-xs text-red-400/80 font-mono">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className={`w-full rounded-xl text-sm font-bold tracking-wide transition-all disabled:opacity-50 ${mobile ? "py-2.5" : "py-3"}`}
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 0 20px hsl(var(--primary) / 0.25)" }}
        >
          {submitting ? "Submitting…" : "Submit Application →"}
        </button>

        <p className="text-center text-[10px] text-muted-foreground/60 font-mono">
          No spam. Arpit reads every submission personally.
        </p>
      </form>
    </motion.div>
  );
}

function DoneStep({ email, onClose, mobile }: { email: string; onClose: () => void; mobile?: boolean }) {
  const p = mobile ? "px-4 pt-3 pb-5" : "p-8";
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`${p} text-center`}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
        className={`rounded-full flex items-center justify-center mx-auto ${mobile ? "w-12 h-12 mb-3" : "w-16 h-16 mb-4"}`}
        style={{ background: "hsl(142 71% 45% / 0.12)", border: "1px solid hsl(142 71% 45% / 0.3)" }}
      >
        <span className={mobile ? "text-xl" : "text-2xl"}>✓</span>
      </motion.div>

      <h2 className={`font-bold ${mobile ? "text-xl mb-1" : "text-2xl mb-2"}`}>Application received.</h2>
      <p className={`text-muted-foreground leading-relaxed ${mobile ? "text-xs mb-3" : "text-sm mb-5"}`}>
        Arpit will personally review and reach out to{" "}
        <span className="text-foreground font-mono">{email}</span> within 48 hours.
      </p>

      <div className={`rounded-xl text-left ${mobile ? "p-3 mb-3" : "p-4 mb-5"}`} style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.5)" }}>
        <p className="text-xs font-mono text-muted-foreground/50 mb-1.5 tracking-widest uppercase">In the meantime</p>
        <p className={`text-muted-foreground/70 leading-relaxed ${mobile ? "text-xs" : "text-sm"}`}>
          Reach out directly at{" "}
          <a href="mailto:arpitdhamija.ai@gmail.com" className="text-primary/70 hover:text-primary transition-colors">
            arpitdhamija.ai@gmail.com
          </a>
          {" "}with any questions.
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
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

export function PilotModal({ open, onClose }: PilotModalProps) {
  const [step, setStep] = useState<"why" | "form" | "done">("why");
  const [form, setForm] = useState<FormData>({ name: "", email: "", company: "", role: "", useCase: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitInterest = useMutation(api.pilotInterest.submitInterest);
  const sendEmail = useAction(api.pilotInterest.sendNotificationEmail);

  useEffect(() => {
    if (open) { setStep("why"); setForm({ name: "", email: "", company: "", role: "", useCase: "" }); setError(""); }
  }, [open]);

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
      const recordId = await submitInterest({
        name: form.name,
        email: form.email,
        company: form.company,
        role: form.role || undefined,
        useCase: form.useCase || undefined,
      });

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

  const stepProps = { form, setForm, error, submitting, onBack: () => setStep("why"), onSubmit: handleSubmit };

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

          {/* Desktop — centered card */}
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
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
              <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-lg z-10">✕</button>
              <AnimatePresence mode="wait">
                {step === "why" && <WhyStep onNext={() => setStep("form")} />}
                {step === "form" && <FormStep {...stepProps} />}
                {step === "done" && <DoneStep email={form.email} onClose={onClose} />}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Mobile — bottom sheet */}
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
              boxShadow: "0 -20px 60px rgba(0,0,0,0.6), 0 0 40px hsl(var(--primary) / 0.08)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-0">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)" }} />
            <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors text-lg z-10">✕</button>
            <AnimatePresence mode="wait">
              {step === "why" && <WhyStep onNext={() => setStep("form")} mobile />}
              {step === "form" && <FormStep {...stepProps} mobile />}
              {step === "done" && <DoneStep email={form.email} onClose={onClose} mobile />}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
