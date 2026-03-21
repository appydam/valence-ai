import { useState } from "react";
import {
  Plus,
  Wand2,
  Rocket,
  Clock,
  Mail,
  Send,
  CalendarClock,
  Loader2,
  CheckCircle2,
  CalendarCheck,
  PenLine,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { SequenceTimeline } from "../components/SequenceTimeline";
import { EmailPreview } from "../components/EmailPreview";
import { MeetingScheduler } from "../components/MeetingScheduler";
import { useEmailSend } from "../hooks/useEmailSend";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

type StepStatus = "drafted" | "approved" | "sent" | "opened" | "replied" | "scheduled";

interface SequenceStep {
  id: string;
  day: number;
  subject: string;
  body: string;
  status: StepStatus;
  scheduledDate?: string;
}

const STATUS_LABELS: Record<StepStatus, string> = {
  drafted: "Drafted",
  approved: "Approved",
  sent: "Sent",
  opened: "Opened",
  replied: "Replied",
  scheduled: "Scheduled",
};

export function SequenceBuilder() {
  const { config } = useNiche();
  const { sendEmail, createDraft, loading: emailLoading, isGmailConnected } = useEmailSend();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [steps, setSteps] = useState<SequenceStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [sequenceName, setSequenceName] = useState("");
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [sendingStepId, setSendingStepId] = useState<string | null>(null);
  const [ghostWritingId, setGhostWritingId] = useState<string | null>(null);

  const currentStep = steps.find((s) => s.id === selectedStep) ?? steps[0] ?? null;

  const handleAddStep = () => {
    const lastStep = steps[steps.length - 1];
    const newStep: SequenceStep = {
      id: String(steps.length + 1),
      day: lastStep ? lastStep.day + 3 : 0,
      subject: "",
      body: "",
      status: "drafted",
    };
    setSteps([...steps, newStep]);
    setSelectedStep(newStep.id);
  };

  const handleSendStep = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    setSendingStepId(stepId);

    const result = await sendEmail({
      to: "{{firstName}} {{lastName}} <{{email}}>",
      subject: step.subject,
      body: step.body,
    });

    if (result.success) {
      setSteps((prev) =>
        prev.map((s) => (s.id === stepId ? { ...s, status: "sent" as StepStatus } : s))
      );
    }

    setSendingStepId(null);
  };

  const handleCreateDraft = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    setSendingStepId(stepId);

    await createDraft({
      to: "{{firstName}} {{lastName}} <{{email}}>",
      subject: step.subject,
      body: step.body,
    });

    setSendingStepId(null);
  };

  const handleScheduleStep = (stepId: string) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === stepId
          ? { ...s, status: "scheduled" as StepStatus, scheduledDate: `Day ${s.day}` }
          : s
      )
    );
  };

  const handleGhostWrite = async (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (!step) return;

    setGhostWritingId(stepId);

    await triggerAgent(
      "Ghost",
      `Write email copy for sequence step (Day ${step.day})`,
      `Write a cold outreach email for the "${sequenceName || "Untitled Sequence"}" sequence.\n\nThis is step #${stepId} (Day ${step.day}).\nCurrent subject: ${step.subject || "(no subject yet)"}\n\nMake it personalized with {{firstName}}, {{company}}, {{role}} merge tags. Keep it concise (under 150 words), conversational, and focused on value. No generic openers.`,
      ["niche:gtm", "email-copy"]
    );

    setGhostWritingId(null);
  };

  const handleInsertMeetingLink = (link: string) => {
    if (!currentStep) return;
    setSteps((prev) =>
      prev.map((s) =>
        s.id === currentStep.id
          ? { ...s, body: s.body + `\n\nBook a time here: ${link}` }
          : s
      )
    );
    setShowMeetingScheduler(false);
  };

  const handleDayChange = (stepId: string, newDay: number) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, day: Math.max(0, newDay) } : s))
    );
  };

  const handleSubjectChange = (stepId: string, subject: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, subject } : s))
    );
  };

  const handleBodyChange = (stepId: string, body: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, body } : s))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sequence Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build multi-touch email sequences with AI-powered copywriting
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isGmailConnected && (
            <span className="text-[10px] text-yellow-500 px-2 py-1 rounded-full bg-yellow-500/10">
              Gmail not connected
            </span>
          )}
          <button
            disabled={steps.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: config.accentColor }}
          >
            <Rocket className="w-4 h-4" />
            Launch Sequence
          </button>
        </div>
      </div>

      {/* Sequence Name */}
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="text-xs font-medium text-muted-foreground block mb-1.5">Sequence Name</label>
        <input
          type="text"
          value={sequenceName}
          onChange={(e) => setSequenceName(e.target.value)}
          placeholder="e.g. Series B DevTools Outreach"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {steps.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <PenLine className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Add your first step</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Build a multi-touch email sequence. Use Ghost AI to generate compelling copy for each step.
          </p>
          <button
            onClick={handleAddStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors mx-auto"
            style={{ background: config.accentColor }}
          >
            <Plus className="w-4 h-4" />
            Add First Step
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left -- Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" style={{ color: config.accentColor }} />
                  Sequence Steps
                </h2>
                <span className="text-xs text-muted-foreground">{steps.length} steps</span>
              </div>

              <SequenceTimeline
                steps={steps.map((s) => ({
                  id: s.id,
                  day: s.day,
                  subject: s.subject || "(untitled)",
                  status: s.status === "scheduled" ? "approved" : s.status,
                }))}
                selectedId={selectedStep ?? steps[0]?.id ?? ""}
                onSelect={setSelectedStep}
                accentColor={config.accentColor}
              />

              {/* Per-step actions */}
              <div className="mt-3 space-y-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      step.id === (selectedStep ?? steps[0]?.id) ? "bg-accent/20" : "hidden"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground shrink-0">Day</span>
                    <input
                      type="number"
                      value={step.day}
                      onChange={(e) => handleDayChange(step.id, parseInt(e.target.value) || 0)}
                      className="w-14 px-2 py-1 rounded border border-border bg-background text-xs text-foreground text-center focus:outline-none"
                      min={0}
                    />
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      step.status === "sent" ? "bg-green-500/10 text-green-500" :
                      step.status === "scheduled" ? "bg-blue-500/10 text-blue-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {STATUS_LABELS[step.status]}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                      {step.status !== "sent" && step.status !== "scheduled" && (
                        <>
                          <button
                            onClick={() => handleSendStep(step.id)}
                            disabled={emailLoading || sendingStepId === step.id}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-white transition-colors disabled:opacity-50"
                            style={{ background: config.accentColor }}
                            title="Send now via Gmail"
                          >
                            {sendingStepId === step.id ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Send className="w-2.5 h-2.5" />
                            )}
                            Send
                          </button>
                          <button
                            onClick={() => handleScheduleStep(step.id)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                            title={`Schedule for Day ${step.day}`}
                          >
                            <CalendarClock className="w-2.5 h-2.5" />
                            Schedule
                          </button>
                        </>
                      )}
                      {step.status === "sent" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleAddStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors w-full justify-center"
                >
                  <Plus className="w-3 h-3" />
                  Add Step
                </button>
              </div>
            </div>
          </div>

          {/* Right -- Email Editor / Preview */}
          <div className="lg:col-span-3 space-y-4">
            {currentStep ? (
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4" style={{ color: config.accentColor }} />
                    Email Editor — Day {currentStep.day}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowMeetingScheduler(!showMeetingScheduler)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <CalendarCheck className="w-3 h-3" />
                      Add Meeting Link
                    </button>
                    <button
                      onClick={() => handleGhostWrite(currentStep.id)}
                      disabled={agentLoading || ghostWritingId === currentStep.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                    >
                      {ghostWritingId === currentStep.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Wand2 className="w-3 h-3" />
                      )}
                      AI Write with Ghost
                    </button>
                  </div>
                </div>

                {/* Subject editor */}
                <div className="mb-3">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Subject</label>
                  <input
                    type="text"
                    value={currentStep.subject}
                    onChange={(e) => handleSubjectChange(currentStep.id, e.target.value)}
                    placeholder="Enter email subject line..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Body editor */}
                <div className="mb-4">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Body</label>
                  <textarea
                    value={currentStep.body}
                    onChange={(e) => handleBodyChange(currentStep.id, e.target.value)}
                    placeholder="Write your email content here... Use {{firstName}}, {{company}}, {{role}} for merge tags."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[200px] resize-y"
                    rows={10}
                  />
                </div>

                {/* Preview */}
                {(currentStep.subject || currentStep.body) && (
                  <div className="mb-4">
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Preview</label>
                    <EmailPreview
                      subject={currentStep.subject || "(no subject)"}
                      from="Arpit Dhamija <arpit@example.com>"
                      to="{{firstName}} {{lastName}} <{{email}}>"
                      body={currentStep.body || "(no content)"}
                      accentColor={config.accentColor}
                    />
                  </div>
                )}

                {/* Bottom action bar */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                  <button
                    onClick={() => handleSendStep(currentStep.id)}
                    disabled={emailLoading || currentStep.status === "sent" || !currentStep.subject}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition-colors"
                    style={{ background: config.accentColor }}
                  >
                    {sendingStepId === currentStep.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send via Gmail
                  </button>
                  <button
                    onClick={() => handleCreateDraft(currentStep.id)}
                    disabled={emailLoading || !currentStep.subject}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Save as Draft
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <Mail className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Select a step to edit</p>
              </div>
            )}

            {/* Meeting Scheduler */}
            {showMeetingScheduler && (
              <MeetingScheduler onInsertLink={handleInsertMeetingLink} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
