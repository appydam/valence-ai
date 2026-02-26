import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { PhoneOff, Mic, MicOff } from "lucide-react";
import type { VoiceState, VoiceTranscriptEntry } from "@/hooks/useVoiceSession";

interface VoiceOverlayProps {
  voiceState: VoiceState;
  isSpeaking: boolean;
  isListening: boolean;
  userTranscript: string;
  agentTranscript: string;
  transcriptHistory: VoiceTranscriptEntry[];
  elapsedSeconds: number;
  speakerLabel?: string;
  onEnd: () => void;
  /** Extra action button (e.g. "Use as Goal") */
  actionButton?: { label: string; onClick: () => void };
  /** Whether this is fullscreen (fixed) or inline (absolute) */
  fullscreen?: boolean;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function VoiceOverlay({
  voiceState,
  isSpeaking,
  isListening,
  userTranscript,
  agentTranscript,
  transcriptHistory,
  elapsedSeconds,
  speakerLabel = "Kaze",
  onEnd,
  actionButton,
  fullscreen = false,
}: VoiceOverlayProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptHistory, userTranscript, agentTranscript]);

  const isConnecting = voiceState === "connecting";
  const isActive = voiceState === "active";
  const isError = voiceState === "error";

  return (
    <div
      className={cn(
        "bg-gradient-to-b from-[#0a0a0f] via-[#0f0f1a] to-[#0a0a0f] z-50 flex flex-col",
        fullscreen ? "fixed inset-0" : "absolute inset-0 rounded-xl"
      )}
    >
      {/* Top bar — timer + status */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnecting && "bg-yellow-400 animate-pulse",
              isActive && "bg-emerald-400",
              isError && "bg-red-400"
            )}
          />
          <span className="text-xs text-white/40 font-mono tracking-wider uppercase">
            {isConnecting ? "Connecting" : isError ? "Disconnected" : "Live"}
          </span>
        </div>
        {isActive && (
          <span className="text-xs text-white/40 font-mono tabular-nums">
            {formatTime(elapsedSeconds)}
          </span>
        )}
      </div>

      {/* Center — avatar + waveform */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        {/* Avatar ring with pulse rings */}
        <div className="relative">
          {/* Outer pulse rings */}
          {isActive && isSpeaking && (
            <>
              <div className="absolute inset-0 -m-4 rounded-full border border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />
              <div className="absolute inset-0 -m-8 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: "3s" }} />
            </>
          )}
          {isActive && isListening && !isSpeaking && (
            <div className="absolute inset-0 -m-4 rounded-full border border-emerald-500/20 animate-ping" style={{ animationDuration: "2.5s" }} />
          )}

          {/* Main avatar circle */}
          <div
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 relative",
              isConnecting && "bg-yellow-500/10 border-2 border-yellow-500/30",
              isActive && isSpeaking && "bg-primary/15 border-2 border-primary/40 scale-105",
              isActive && isListening && !isSpeaking && "bg-emerald-500/10 border-2 border-emerald-500/30",
              isError && "bg-red-500/10 border-2 border-red-500/30"
            )}
          >
            {/* Kaze avatar — stylized "K" */}
            <span className={cn(
              "text-4xl font-bold transition-colors duration-500",
              isConnecting && "text-yellow-400/60",
              isActive && isSpeaking && "text-primary",
              isActive && isListening && !isSpeaking && "text-emerald-400",
              isError && "text-red-400"
            )}>
              K
            </span>
          </div>
        </div>

        {/* Speaker name */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white/90">{speakerLabel}</h2>
          <p className="text-sm text-white/30 mt-0.5">
            {isConnecting && "Establishing connection..."}
            {isActive && isSpeaking && "Speaking"}
            {isActive && isListening && !isSpeaking && "Listening"}
            {isError && "Connection lost"}
          </p>
        </div>

        {/* Waveform visualization — simple animated bars */}
        {isActive && (
          <div className="flex items-end gap-[3px] h-8">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-[3px] rounded-full transition-all",
                  isSpeaking ? "bg-primary/60" : "bg-white/10"
                )}
                style={{
                  height: isSpeaking
                    ? `${8 + Math.sin((Date.now() / 200) + i * 0.5) * 12 + Math.random() * 8}px`
                    : `${4 + Math.sin(i * 0.8) * 3}px`,
                  transition: "height 0.15s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript area */}
      <div className="px-6 pb-4">
        {/* Live transcript bubble */}
        <div className="min-h-[3rem] flex flex-col items-center justify-center mb-4">
          {userTranscript && (
            <p className="text-sm text-white/50 italic text-center animate-in fade-in duration-300">
              {userTranscript}
            </p>
          )}
          {agentTranscript && (
            <p className="text-sm text-primary/80 text-center animate-in fade-in duration-300">
              {agentTranscript}
            </p>
          )}
          {!userTranscript && !agentTranscript && isActive && !isSpeaking && (
            <p className="text-xs text-white/20">Speak naturally — Kaze is listening</p>
          )}
        </div>

        {/* Transcript history — scrollable glass panel */}
        {transcriptHistory.length > 0 && (
          <div
            ref={scrollRef}
            className="max-h-36 overflow-auto rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 space-y-2 mb-4 scroll-smooth"
          >
            {transcriptHistory.map((t, i) => (
              <div key={i} className={cn("flex gap-2 text-xs", t.speaker === "user" ? "justify-end" : "justify-start")}>
                {t.speaker !== "user" && (
                  <span className="text-primary/50 font-medium shrink-0">{speakerLabel}</span>
                )}
                <span className={cn(
                  "max-w-[80%]",
                  t.speaker === "user" ? "text-white/40" : "text-white/60"
                )}>
                  {t.text}
                </span>
                {t.speaker === "user" && (
                  <span className="text-white/30 font-medium shrink-0">You</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-6 pb-8 flex items-center justify-center gap-4">
        {/* Mute toggle (visual only for now) */}
        <button
          className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/60 hover:bg-white/[0.1] transition-all"
          title={isListening ? "Microphone active" : "Microphone muted"}
        >
          {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* End call — prominent red button */}
        <button
          onClick={onEnd}
          className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
        >
          <PhoneOff className="w-6 h-6 text-white" />
        </button>

        {/* Action button if provided */}
        {actionButton ? (
          <button
            onClick={actionButton.onClick}
            className="h-12 px-5 rounded-full bg-primary/20 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/30 transition-all"
          >
            {actionButton.label}
          </button>
        ) : (
          // Spacer to center the end call button
          <div className="w-12" />
        )}
      </div>
    </div>
  );
}
