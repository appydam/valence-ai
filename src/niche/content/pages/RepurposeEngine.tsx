import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Recycle,
  Copy,
  Check,
  Send,
  Edit3,
  Loader2,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { usePublish } from "../hooks/usePublish";
import { AgentActivityPanel } from "../../framework/AgentActivityPanel";
import { useUserTasks } from "@/hooks/useUserScoped";

type OutputTab = "twitter" | "linkedin" | "newsletter" | "instagram";

interface RepurposedContent {
  twitter: string[];
  linkedin: string;
  newsletter: string;
  instagram: string;
}

function parseRepurposedContent(deliverable: string): RepurposedContent | null {
  try {
    const parsed = JSON.parse(deliverable);
    if (parsed.twitter && parsed.linkedin) {
      return {
        twitter: Array.isArray(parsed.twitter) ? parsed.twitter : [parsed.twitter],
        linkedin: parsed.linkedin ?? "",
        newsletter: parsed.newsletter ?? "",
        instagram: parsed.instagram ?? "",
      };
    }
  } catch {
    // Try to parse sections from plain text
    const sections: RepurposedContent = { twitter: [], linkedin: "", newsletter: "", instagram: "" };
    const text = deliverable;

    const twitterMatch = text.match(/(?:twitter|tweet)[:\s]*\n([\s\S]*?)(?=(?:linkedin|newsletter|instagram)[:\s]*\n|$)/i);
    const linkedinMatch = text.match(/linkedin[:\s]*\n([\s\S]*?)(?=(?:twitter|newsletter|instagram)[:\s]*\n|$)/i);
    const newsletterMatch = text.match(/newsletter[:\s]*\n([\s\S]*?)(?=(?:twitter|linkedin|instagram)[:\s]*\n|$)/i);
    const instagramMatch = text.match(/instagram[:\s]*\n([\s\S]*?)(?=(?:twitter|linkedin|newsletter)[:\s]*\n|$)/i);

    if (twitterMatch) {
      sections.twitter = twitterMatch[1].split("\n---\n").map((s: string) => s.trim()).filter(Boolean);
    }
    if (linkedinMatch) sections.linkedin = linkedinMatch[1].trim();
    if (newsletterMatch) sections.newsletter = newsletterMatch[1].trim();
    if (instagramMatch) sections.instagram = instagramMatch[1].trim();

    if (sections.twitter.length > 0 || sections.linkedin || sections.newsletter || sections.instagram) {
      return sections;
    }
  }
  return null;
}

export function RepurposeEngine() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { publishToTwitter, publishToLinkedIn, loading: publishLoading } = usePublish();
  const [inputMode, setInputMode] = useState<"text" | "url">("text");
  const [sourceContent, setSourceContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [activeTab, setActiveTab] = useState<OutputTab>("twitter");
  const [output, setOutput] = useState<RepurposedContent | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editBuffer, setEditBuffer] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [taskId, setTaskId] = useState<string | undefined>(undefined);

  // Query repurpose task results
  const tasks = useUserTasks();
  const repurposeTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:content") &&
      t.tags?.includes("repurpose") &&
      t.status === "done"
  );

  // Auto-populate output from latest completed task (if we triggered one)
  useEffect(() => {
    if (taskId && repurposeTasks.length > 0) {
      const matchingTask = repurposeTasks.find((t: { _id: string }) => t._id === taskId);
      if (matchingTask?.deliverable) {
        const parsed = parseRepurposedContent(matchingTask.deliverable);
        if (parsed) {
          setOutput(parsed);
          setProcessing(false);
        }
      }
    }
  }, [repurposeTasks, taskId]);

  const handleRepurpose = async () => {
    const content = inputMode === "text" ? sourceContent : sourceUrl;
    if (!content.trim()) return;

    setProcessing(true);
    setOutput(null);

    const description =
      inputMode === "url"
        ? `Repurpose the content from this URL into multiple platform formats: ${sourceUrl}\n\nGenerate a JSON object with these keys:\n- "twitter": array of 5 tweet variants (each <280 chars)\n- "linkedin": 1 LinkedIn post (~1500 chars, professional tone)\n- "newsletter": 1 Newsletter excerpt (~500 chars)\n- "instagram": 1 Instagram caption with hashtags`
        : `Repurpose the following content into multiple platform formats:\n\n---\n${sourceContent.slice(0, 2000)}\n---\n\nGenerate a JSON object with these keys:\n- "twitter": array of 5 tweet variants (each <280 chars)\n- "linkedin": 1 LinkedIn post (~1500 chars, professional tone)\n- "newsletter": 1 Newsletter excerpt (~500 chars)\n- "instagram": 1 Instagram caption with hashtags`;

    const result = await triggerAgent(
      "Ghost",
      "Repurpose content across platforms",
      description,
      ["niche:content", "repurpose"],
      { priority: "high" }
    );

    if (result.success && result.taskId) {
      setTaskId(result.taskId);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(key);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handlePublish = async (platform: OutputTab, text: string) => {
    if (platform === "twitter") {
      await publishToTwitter(text);
    } else if (platform === "linkedin") {
      await publishToLinkedIn(text);
    }
  };

  const tabs: { id: OutputTab; label: string }[] = [
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" },
    { id: "newsletter", label: "Newsletter" },
    { id: "instagram", label: "Instagram" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Repurpose Engine</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Turn one piece of content into posts for every platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left -- Input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Input mode toggle */}
            <div className="flex items-center gap-1 border-b border-border pb-3">
              <button
                onClick={() => setInputMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  inputMode === "text"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={inputMode === "text" ? { background: config.accentColor } : undefined}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste Content
              </button>
              <button
                onClick={() => setInputMode("url")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  inputMode === "url"
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                style={inputMode === "url" ? { background: config.accentColor } : undefined}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                URL
              </button>
            </div>

            {inputMode === "text" ? (
              <textarea
                value={sourceContent}
                onChange={(e) => setSourceContent(e.target.value)}
                placeholder="Paste your blog post, article, or long-form content here..."
                rows={10}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            ) : (
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://yourblog.com/post-title"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            )}

            <button
              onClick={handleRepurpose}
              disabled={processing || agentLoading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
              style={{ background: config.accentColor }}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Repurposing...
                </>
              ) : (
                <>
                  <Recycle className="w-4 h-4" />
                  Repurpose
                </>
              )}
            </button>
          </div>

          {/* Processing indicator */}
          {processing && !output && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Ghost is repurposing your content across platforms...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Results will appear automatically when complete.
              </p>
            </div>
          )}

          {/* Output */}
          {output && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Tabs */}
              <div className="flex items-center border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                      activeTab === tab.id
                        ? "border-current"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    style={
                      activeTab === tab.id ? { color: config.accentColor } : undefined
                    }
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 space-y-4">
                {activeTab === "twitter" &&
                  output.twitter.map((tweet, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-border/50 bg-accent/10 space-y-2"
                    >
                      {editingIndex === idx ? (
                        <textarea
                          value={editBuffer}
                          onChange={(e) => setEditBuffer(e.target.value)}
                          rows={3}
                          className="w-full px-2 py-1 rounded border border-border bg-background text-sm text-foreground focus:outline-none resize-none"
                          autoFocus
                        />
                      ) : (
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {tweet}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {tweet.length}/280
                        </span>
                        <div className="ml-auto flex items-center gap-1.5">
                          {editingIndex === idx ? (
                            <button
                              onClick={() => {
                                const updated = [...output.twitter];
                                updated[idx] = editBuffer;
                                setOutput({ ...output, twitter: updated });
                                setEditingIndex(null);
                              }}
                              className="p-1 rounded text-xs text-green-500 hover:bg-green-500/10"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingIndex(idx);
                                setEditBuffer(tweet);
                              }}
                              className="p-1 rounded text-xs text-muted-foreground hover:text-foreground"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleCopy(tweet, `tw-${idx}`)}
                            className="p-1 rounded text-xs text-muted-foreground hover:text-foreground"
                          >
                            {copiedIndex === `tw-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handlePublish("twitter", tweet)}
                            disabled={publishLoading}
                            className="p-1 rounded text-xs hover:bg-accent/30"
                            style={{ color: config.accentColor }}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {activeTab === "linkedin" && (
                  <div className="space-y-2">
                    {output.linkedin ? (
                      <>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {output.linkedin}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleCopy(output.linkedin, "li")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedIndex === "li" ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            Copy
                          </button>
                          <button
                            onClick={() => handlePublish("linkedin", output.linkedin)}
                            disabled={publishLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ background: config.accentColor }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Publish
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No LinkedIn content generated.</p>
                    )}
                  </div>
                )}

                {activeTab === "newsletter" && (
                  <div className="space-y-2">
                    {output.newsletter ? (
                      <>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {output.newsletter}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleCopy(output.newsletter, "nl")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedIndex === "nl" ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            Copy
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No newsletter content generated.</p>
                    )}
                  </div>
                )}

                {activeTab === "instagram" && (
                  <div className="space-y-2">
                    {output.instagram ? (
                      <>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {output.instagram}
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => handleCopy(output.instagram, "ig")}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedIndex === "ig" ? (
                              <Check className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            Copy
                          </button>
                          <button
                            onClick={() => handlePublish("instagram", output.instagram)}
                            disabled={publishLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                            style={{ background: config.accentColor }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            Publish
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">No Instagram content generated.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty state when no output and not processing */}
          {!output && !processing && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Recycle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">Paste your content and click Repurpose</p>
              <p className="text-xs text-muted-foreground">
                Ghost will transform it into platform-optimized posts for Twitter, LinkedIn, Instagram, and newsletters.
              </p>
            </div>
          )}
        </div>

        {/* Right -- Agent Activity */}
        <div className="space-y-4">
          <AgentActivityPanel taskId={taskId} agentName="Ghost" />
        </div>
      </div>
    </div>
  );
}
