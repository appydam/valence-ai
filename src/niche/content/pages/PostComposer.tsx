import { useState } from "react";
import { Wand2, Send, Clock, Hash, Sparkles, Image, Loader2 } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";
import { PlatformPreview } from "../components/PlatformPreview";
import { EngagementPredictor } from "../components/EngagementPredictor";
import { ApprovalFlow, type ApprovalStatus } from "../components/ApprovalFlow";
import { ImageGenerator } from "../components/ImageGenerator";
import { usePublish } from "../hooks/usePublish";

type Platform = "twitter" | "linkedin" | "instagram";

const PLATFORM_LIMITS: Record<Platform, number> = {
  twitter: 280,
  linkedin: 3000,
  instagram: 2200,
};

const PLATFORM_TABS: { id: Platform; label: string; color: string }[] = [
  { id: "twitter", label: "Twitter / X", color: "hsl(203, 89%, 53%)" },
  { id: "linkedin", label: "LinkedIn", color: "hsl(210, 70%, 45%)" },
  { id: "instagram", label: "Instagram", color: "hsl(330, 70%, 55%)" },
];

const SUGGESTED_HASHTAGS: Record<Platform, string[]> = {
  twitter: ["#AI", "#ContentMarketing", "#Growth", "#SaaS", "#Startup", "#MarketingTips", "#SEO", "#Thread"],
  linkedin: ["#ContentStrategy", "#Marketing", "#Leadership", "#Growth", "#B2B", "#PersonalBrand", "#AI"],
  instagram: ["#contentcreator", "#marketingtips", "#digitalmarketing", "#growthhacking", "#socialmedia", "#brandbuilding"],
};

const STATUS_LABELS: Record<string, { label: string; color: string; bgClass: string }> = {
  draft: { label: "Draft", color: "text-gray-400", bgClass: "bg-gray-500/10 border-gray-500/30" },
  in_review: { label: "In Review", color: "text-yellow-500", bgClass: "bg-yellow-500/10 border-yellow-500/30" },
  approved: { label: "Approved", color: "text-green-500", bgClass: "bg-green-500/10 border-green-500/30" },
  scheduled: { label: "Scheduled", color: "text-blue-500", bgClass: "bg-blue-500/10 border-blue-500/30" },
  published: { label: "Published", color: "text-emerald-500", bgClass: "bg-emerald-500/10 border-emerald-500/30" },
};

export function PostComposer() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const { publishToTwitter, publishToLinkedIn, publishToInstagram, schedulePost, loading: publishLoading } = usePublish();

  const [platform, setPlatform] = useState<Platform>("twitter");
  const [postText, setPostText] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>("draft");
  const [postStatus, setPostStatus] = useState<string>("draft");
  const [showImageGen, setShowImageGen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const charLimit = PLATFORM_LIMITS[platform];
  const charCount = postText.length;
  const isOverLimit = charCount > charLimit;

  const handleAIWrite = async () => {
    setGenerating(true);

    // Trigger Ghost agent for AI writing
    const result = await triggerAgent(
      "Ghost",
      `Write ${platform} post with AI`,
      `Write an engaging ${platform} post. Platform character limit: ${charLimit}. Keep it within limits and make it engaging. Topic: content marketing / AI / growth.`,
      ["niche:content", "ai-write"],
      { priority: "high" }
    );

    // Fallback sample content while agent works
    setTimeout(() => {
      const samples: Record<Platform, string> = {
        twitter: "5 AI trends reshaping content marketing in 2026:\n\n1. Autonomous content pipelines\n2. Real-time SEO optimization\n3. Personalized newsletters at scale\n4. AI-powered A/B testing for copy\n5. Cross-platform content repurposing\n\nWhich one are you most excited about?",
        linkedin: "I spent 6 months building an AI-powered content engine.\n\nHere's what I learned:\n\nThe biggest mistake most teams make is treating AI as a replacement for human creativity. It's not.\n\nAI is an amplifier. It takes your best ideas and helps you:\n- Reach 10x more people\n- Repurpose into 5 formats in minutes\n- Optimize headlines based on real data\n- Schedule at peak engagement times\n\nThe teams winning at content aren't replacing writers. They're giving writers superpowers.\n\nWhat's your experience been with AI in content?",
        instagram: "Stop posting without a strategy.\n\nHere's our 5-step content framework that grew us from 0 to 10K followers in 90 days:\n\n1. Research trending topics in your niche\n2. Create a content pillar for each day\n3. Repurpose every piece into 3 formats\n4. Schedule at peak engagement times\n5. Analyze and iterate weekly\n\nSave this for later!",
      };
      setPostText(samples[platform]);
      setGenerating(false);
    }, 1500);
  };

  const toggleHashtag = (tag: string) => {
    setSelectedHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addHashtagsToPost = () => {
    if (selectedHashtags.length > 0) {
      setPostText((prev) => prev + "\n\n" + selectedHashtags.join(" "));
      setSelectedHashtags([]);
    }
  };

  const handlePublishNow = async () => {
    if (!postText.trim() || isOverLimit) return;
    setPublishing(true);

    let result;
    if (platform === "twitter") {
      result = await publishToTwitter(postText);
    } else if (platform === "linkedin") {
      result = await publishToLinkedIn(postText);
    } else {
      result = await publishToInstagram(postText, attachedImage ?? undefined);
    }

    if (result.success) {
      setPostStatus("published");
      setApprovalStatus("published");
    }
    setPublishing(false);
  };

  const handleSchedule = async () => {
    if (!postText.trim() || !scheduleDate || !scheduleTime) return;
    setPublishing(true);

    const scheduledAt = `${scheduleDate}T${scheduleTime}:00`;
    const result = await schedulePost(platform, postText, scheduledAt);

    if (result.success) {
      setPostStatus("scheduled");
    }
    setPublishing(false);
  };

  const handleSelectImage = (url: string) => {
    setAttachedImage(url);
    setShowImageGen(false);
  };

  const statusInfo = STATUS_LABELS[postStatus] ?? STATUS_LABELS.draft;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Compose Post</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and schedule posts across platforms
          </p>
        </div>
        {/* Post Status */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${statusInfo.bgClass} ${statusInfo.color}`}
        >
          {statusInfo.label}
        </div>
      </div>

      {/* Platform Tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {PLATFORM_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlatform(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              platform === tab.id
                ? "border-current"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            style={platform === tab.id ? { color: tab.color } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left -- Compose Panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            {/* Text Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Post Content
                </label>
                <span
                  className={`text-xs font-medium ${
                    isOverLimit ? "text-red-400" : charCount > charLimit * 0.9 ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                >
                  {charCount}/{charLimit}
                </span>
              </div>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder={`Write your ${platform === "twitter" ? "tweet" : platform === "linkedin" ? "LinkedIn post" : "Instagram caption"}...`}
                rows={8}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
            </div>

            {/* Attached Image */}
            {attachedImage && (
              <div className="relative inline-block">
                <img
                  src={attachedImage}
                  alt="Attached"
                  className="w-24 h-24 rounded-lg object-cover border border-border"
                />
                <button
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                >
                  x
                </button>
              </div>
            )}

            {/* AI Write + Image Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleAIWrite}
                disabled={generating || agentLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                style={{ background: config.accentColor }}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Writing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Write with AI
                  </>
                )}
              </button>
              <button
                onClick={() => setShowImageGen(!showImageGen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
              >
                <Image className="w-4 h-4" />
                {showImageGen ? "Hide Image Gen" : "Add Image"}
              </button>
            </div>

            {/* Image Generator */}
            {showImageGen && (
              <ImageGenerator onSelectImage={handleSelectImage} />
            )}

            {/* Hashtag Suggestions */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                <label className="text-xs font-medium text-muted-foreground">
                  Suggested Hashtags
                </label>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_HASHTAGS[platform].map((tag) => {
                  const isSelected = selectedHashtags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleHashtag(tag)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? "border-transparent text-white"
                          : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                      }`}
                      style={isSelected ? { background: config.accentColor } : undefined}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedHashtags.length > 0 && (
                <button
                  onClick={addHashtagsToPost}
                  className="mt-2 text-xs font-medium hover:underline"
                  style={{ color: config.accentColor }}
                >
                  Add {selectedHashtags.length} hashtags to post
                </button>
              )}
            </div>

            {/* Schedule */}
            <div className="p-3 rounded-lg bg-accent/20 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Schedule</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePublishNow}
                disabled={publishing || publishLoading || !postText.trim() || isOverLimit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-60"
                style={{ background: config.accentColor }}
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Publish Now
              </button>
              <button
                onClick={handleSchedule}
                disabled={publishing || publishLoading || !postText.trim() || !scheduleDate || !scheduleTime}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-60"
              >
                <Clock className="w-4 h-4" />
                Schedule
              </button>
            </div>
          </div>

          {/* Approval Flow */}
          <ApprovalFlow
            contentId={`post-${platform}`}
            status={approvalStatus}
            onStatusChange={setApprovalStatus}
          />
        </div>

        {/* Right -- Preview + Engagement Predictor */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: config.accentColor }} />
            Live Preview
          </h2>
          <PlatformPreview platform={platform} text={postText} />

          {/* Engagement Predictor */}
          <EngagementPredictor
            text={postText}
            platform={platform}
            scheduledHour={
              scheduleTime ? parseInt(scheduleTime.split(":")[0], 10) : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}
