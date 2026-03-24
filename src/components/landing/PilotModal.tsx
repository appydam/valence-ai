import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Send, CheckCircle2, Building2 } from "lucide-react";

interface PilotModalProps {
  open: boolean;
  onClose: () => void;
}

const PLANS = [
  { label: "Business — $2,499/mo", value: "business" },
  { label: "Enterprise — $4,999/mo", value: "enterprise" },
  { label: "Enterprise+ — Custom", value: "enterprise-plus" },
  { label: "Not sure yet", value: "unsure" },
];

export function PilotModal({ open, onClose }: PilotModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [plan, setPlan] = useState("business");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setTimeout(() => {
        setSubmitted(false);
        setSending(false);
      }, 300);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSending(true);

    // Send via mailto as fallback (opens email client with pre-filled data)
    const subject = encodeURIComponent(`Valence AI ${PLANS.find(p => p.value === plan)?.label || "Business"} Plan Inquiry — ${company || name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nCompany: ${company || "N/A"}\nPlan Interest: ${PLANS.find(p => p.value === plan)?.label || "Business"}\n\nMessage:\n${message || "I'd like to learn more about Valence AI for my team."}`
    );
    window.open(`mailto:arpitdhamija.ai@gmail.com?subject=${subject}&body=${body}`, "_self");

    // Show success state
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 500);
  };

  const inputStyle = {
    background: "hsl(240 33% 4%)",
    border: "1px solid hsl(var(--border) / 0.5)",
  };

  const formContent = (compact = false) => (
    <form onSubmit={handleSubmit} className={compact ? "space-y-3" : "space-y-4"}>
      <div className={compact ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-3"}>
        <input
          type="text"
          placeholder="Your name *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className={`w-full ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"} rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50`}
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Work email *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={`w-full ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"} rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50`}
          style={inputStyle}
        />
      </div>

      <input
        type="text"
        placeholder="Company name"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        className={`w-full ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"} rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50`}
        style={inputStyle}
      />

      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        className={`w-full ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"} rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 appearance-none cursor-pointer`}
        style={inputStyle}
      >
        {PLANS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      <textarea
        placeholder="Tell us about your use case (optional)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={compact ? 2 : 3}
        className={`w-full ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"} rounded-lg text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none`}
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={sending || !name.trim() || !email.trim()}
        className={`w-full flex items-center justify-center gap-2 ${compact ? "py-2.5 text-xs" : "py-3 text-sm"} rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
      >
        {sending ? (
          <>Sending...</>
        ) : (
          <>
            <Send className="w-3.5 h-3.5" />
            Get in Touch
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );

  const successContent = (compact = false) => (
    <div className={`flex flex-col items-center justify-center ${compact ? "py-6" : "py-10"} text-center`}>
      <CheckCircle2 className={`${compact ? "w-10 h-10" : "w-12 h-12"} text-green-400 mb-4`} />
      <h3 className={`${compact ? "text-base" : "text-lg"} font-bold mb-2`}>We'll be in touch!</h3>
      <p className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground max-w-xs leading-relaxed`}>
        Arpit will personally review your request and reach out within 24 hours.
      </p>
      <button
        onClick={onClose}
        className={`mt-6 px-6 ${compact ? "py-2 text-xs" : "py-2.5 text-sm"} rounded-xl font-medium transition-colors hover:bg-white/5`}
        style={{ border: "1px solid hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
      >
        Close
      </button>
    </div>
  );

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
                {submitted ? successContent() : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-mono tracking-widest px-2 py-0.5 rounded"
                        style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary) / 0.8)" }}>
                        BUSINESS & ENTERPRISE
                      </span>
                    </div>

                    <h2 className="text-2xl font-bold mb-2">Deploy Your AI Workforce</h2>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      Get a dedicated AI workforce with private infrastructure, 100+ integrations, and five specialized agents. Arpit will personally set up your deployment.
                    </p>

                    <div className="flex items-center gap-4 mb-6 p-3 rounded-xl"
                      style={{ background: "hsl(240 33% 4%)", border: "1px solid hsl(var(--border) / 0.3)" }}>
                      <Building2 className="w-5 h-5 text-primary/60 shrink-0" />
                      <div className="text-xs text-muted-foreground/70 leading-relaxed">
                        <span className="text-foreground/80 font-medium">Dedicated infrastructure</span> — your agents run on isolated servers. No shared resources, no data mixing.
                      </div>
                    </div>

                    {formContent()}
                  </>
                )}
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
              {submitted ? successContent(true) : (
                <>
                  <h2 className="text-lg font-bold mb-1">Deploy Your AI Workforce</h2>
                  <p className="text-xs text-muted-foreground mb-4">Private infrastructure. Five specialized agents. 100+ integrations.</p>
                  {formContent(true)}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
