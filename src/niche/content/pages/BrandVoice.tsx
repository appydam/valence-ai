import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Mic,
  Loader2,
  Save,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { useUserTasks } from "@/hooks/useUserScoped";

interface VoiceProfile {
  tone: string;
  formality: number;
  emojiUsage: string;
  sentenceLength: string;
  vocabulary: string;
  keyPhrases: string[];
}

const TONE_OPTIONS = ["Professional", "Casual", "Friendly", "Authoritative"];
const EMOJI_OPTIONS = ["None", "Minimal", "Moderate", "Heavy"];
const SENTENCE_OPTIONS = ["Short", "Medium", "Long", "Mixed"];
const VOCABULARY_OPTIONS = ["Simple", "Technical", "Industry jargon", "Conversational"];

const STORAGE_KEY = "content-studio-brand-voice";

function parseVoiceProfile(deliverable: string): VoiceProfile | null {
  try {
    const parsed = JSON.parse(deliverable);
    if (parsed.tone) {
      return {
        tone: parsed.tone ?? "Professional",
        formality: parsed.formality ?? 3,
        emojiUsage: parsed.emojiUsage ?? parsed.emoji_usage ?? "Minimal",
        sentenceLength: parsed.sentenceLength ?? parsed.sentence_length ?? "Mixed",
        vocabulary: parsed.vocabulary ?? "Conversational",
        keyPhrases: parsed.keyPhrases ?? parsed.key_phrases ?? [],
      };
    }
  } catch {
    // Try to extract from plain text
    const profile: VoiceProfile = {
      tone: "Professional",
      formality: 3,
      emojiUsage: "Minimal",
      sentenceLength: "Mixed",
      vocabulary: "Conversational",
      keyPhrases: [],
    };
    const text = deliverable.toLowerCase();
    if (text.includes("authoritative")) profile.tone = "Authoritative";
    else if (text.includes("casual")) profile.tone = "Casual";
    else if (text.includes("friendly")) profile.tone = "Friendly";

    // Extract key phrases between quotes
    const phraseMatches = deliverable.match(/"([^"]{3,30})"/g);
    if (phraseMatches) {
      profile.keyPhrases = phraseMatches.map((m) => m.replace(/"/g, "")).slice(0, 10);
    }

    if (profile.keyPhrases.length > 0) return profile;
  }
  return null;
}

export function BrandVoice() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [samples, setSamples] = useState<string[]>(["", "", "", "", ""]);
  const [analyzing, setAnalyzing] = useState(false);
  const [profile, setProfile] = useState<VoiceProfile | null>(null);
  const [applyToNext, setApplyToNext] = useState(false);
  const [saved, setSaved] = useState(false);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  // Load saved profile from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile(parsed.profile ?? null);
        setApplyToNext(parsed.applyToNext ?? false);
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Query completed brand voice tasks
  const tasks = useUserTasks();
  const brandVoiceTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:content") &&
      t.tags?.includes("brand-voice") &&
      t.status === "done"
  );

  // Auto-populate from task result if we triggered one
  useEffect(() => {
    if (taskId && brandVoiceTasks.length > 0) {
      const matchingTask = brandVoiceTasks.find((t: { _id: string }) => t._id === taskId);
      if (matchingTask?.deliverable) {
        const parsed = parseVoiceProfile(matchingTask.deliverable);
        if (parsed) {
          setProfile(parsed);
          setAnalyzing(false);
        }
      }
    }
  }, [brandVoiceTasks, taskId]);

  const filledSamples = samples.filter((s) => s.trim().length > 0);

  const handleAnalyze = async () => {
    if (filledSamples.length < 2) return;

    setAnalyzing(true);
    setProfile(null);

    const description = `Analyze the following content samples to extract a brand voice profile.

${filledSamples.map((s, i) => `--- Sample ${i + 1} ---\n${s.slice(0, 500)}`).join("\n\n")}

Return a JSON object with:
- "tone" (Professional / Casual / Friendly / Authoritative)
- "formality" (1-5)
- "emojiUsage" (None / Minimal / Moderate / Heavy)
- "sentenceLength" (Short / Medium / Long / Mixed)
- "vocabulary" (Simple / Technical / Industry jargon / Conversational)
- "keyPhrases" (array of 5-10 recurring phrases)`;

    const result = await triggerAgent(
      "Scout",
      "Analyze brand voice from content samples",
      description,
      ["niche:content", "brand-voice"],
      { priority: "high" }
    );

    if (result.success && result.taskId) {
      setTaskId(result.taskId);
    }
  };

  const handleSave = () => {
    if (!profile) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile, applyToNext })
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      // Storage full or blocked
    }
  };

  const handleClearProfile = () => {
    setProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Brand Voice</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Train your brand voice by analyzing your best content
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left -- Upload Section */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4" style={{ color: config.accentColor }} />
              <h2 className="text-sm font-semibold text-foreground">
                Content Samples
              </h2>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {filledSamples.length}/5 filled
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Paste 2 or more examples of your content to analyze your writing style
            </p>

            {samples.map((sample, idx) => (
              <div key={idx}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Sample {idx + 1}
                </label>
                <textarea
                  value={sample}
                  onChange={(e) => {
                    const updated = [...samples];
                    updated[idx] = e.target.value;
                    setSamples(updated);
                  }}
                  placeholder={`Paste example content ${idx + 1}...`}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>
            ))}

            <button
              onClick={handleAnalyze}
              disabled={analyzing || agentLoading || filledSamples.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
              style={{ background: config.accentColor }}
            >
              {analyzing || agentLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Voice
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right -- Voice Profile */}
        <div className="space-y-4">
          {profile ? (
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Voice Profile
                </h2>
                <button
                  onClick={handleClearProfile}
                  className="text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tone */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Tone
                </label>
                <div className="flex flex-wrap gap-2">
                  {TONE_OPTIONS.map((t) => (
                    <span
                      key={t}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        profile.tone === t
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground"
                      }`}
                      style={
                        profile.tone === t
                          ? { background: config.accentColor }
                          : undefined
                      }
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Formality Scale */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Formality
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border ${
                        level <= profile.formality
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground"
                      }`}
                      style={
                        level <= profile.formality
                          ? { background: config.accentColor }
                          : undefined
                      }
                    >
                      {level}
                    </div>
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-2">
                    {profile.formality <= 2
                      ? "Casual"
                      : profile.formality === 3
                      ? "Balanced"
                      : "Formal"}
                  </span>
                </div>
              </div>

              {/* Emoji Usage */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Emoji Usage
                </label>
                <div className="flex flex-wrap gap-2">
                  {EMOJI_OPTIONS.map((opt) => (
                    <span
                      key={opt}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        profile.emojiUsage === opt
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground"
                      }`}
                      style={
                        profile.emojiUsage === opt
                          ? { background: config.accentColor }
                          : undefined
                      }
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentence Length */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Sentence Length
                </label>
                <div className="flex flex-wrap gap-2">
                  {SENTENCE_OPTIONS.map((opt) => (
                    <span
                      key={opt}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        profile.sentenceLength === opt
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground"
                      }`}
                      style={
                        profile.sentenceLength === opt
                          ? { background: config.accentColor }
                          : undefined
                      }
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vocabulary */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Vocabulary
                </label>
                <div className="flex flex-wrap gap-2">
                  {VOCABULARY_OPTIONS.map((opt) => (
                    <span
                      key={opt}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                        profile.vocabulary === opt
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground"
                      }`}
                      style={
                        profile.vocabulary === opt
                          ? { background: config.accentColor }
                          : undefined
                      }
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Phrases */}
              {profile.keyPhrases.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Key Phrases
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {profile.keyPhrases.map((phrase) => (
                      <span
                        key={phrase}
                        className="px-2.5 py-1 rounded-full text-xs font-medium border border-border/50 bg-accent/20 text-foreground/80"
                      >
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 border-t border-border/50">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: config.accentColor }}
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save as Default"}
                </button>
                <button
                  onClick={() => setApplyToNext(!applyToNext)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                >
                  {applyToNext ? (
                    <ToggleRight className="w-4 h-4" style={{ color: config.accentColor }} />
                  ) : (
                    <ToggleLeft className="w-4 h-4" />
                  )}
                  Apply to Next Generation
                </button>
              </div>
            </div>
          ) : analyzing || agentLoading ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Scout is analyzing your content samples...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Your voice profile will appear here when complete.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Mic className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                No voice profile yet
              </p>
              <p className="text-xs text-muted-foreground">
                Paste 2+ content samples and click "Analyze Voice" to generate your brand voice profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
