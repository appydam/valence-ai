import { Heart, MessageCircle, Repeat2, Share, BookmarkIcon, ThumbsUp, Send } from "lucide-react";

interface PlatformPreviewProps {
  platform: "twitter" | "linkedin" | "instagram";
  text: string;
}

export function PlatformPreview({ platform, text }: PlatformPreviewProps) {
  const displayText = text || "Your post preview will appear here...";
  const isEmpty = !text;

  if (platform === "twitter") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/50 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Your Name</span>
                <span className="text-xs text-muted-foreground">@yourhandle</span>
                <span className="text-xs text-muted-foreground">· Just now</span>
              </div>
              <p className={`text-sm mt-1 whitespace-pre-wrap break-words ${isEmpty ? "text-muted-foreground/50 italic" : "text-foreground"}`}>
                {displayText}
              </p>
              <div className="flex items-center justify-between mt-3 max-w-[300px]">
                <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-xs">12</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-green-500 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-xs">8</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-red-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs">45</span>
                </button>
                <button className="flex items-center gap-1 text-muted-foreground hover:text-blue-500 transition-colors">
                  <BookmarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (platform === "linkedin") {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-accent/50 shrink-0" />
            <div>
              <p className="text-sm font-bold text-foreground">Your Name</p>
              <p className="text-xs text-muted-foreground">Your Headline | 1st</p>
              <p className="text-[10px] text-muted-foreground">Just now</p>
            </div>
          </div>
          <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${isEmpty ? "text-muted-foreground/50 italic" : "text-foreground"}`}>
            {displayText.length > 200 ? displayText.slice(0, 200) + "..." : displayText}
          </p>
          {text.length > 200 && (
            <button className="text-xs text-muted-foreground mt-1 hover:underline">
              ...see more
            </button>
          )}
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/50 text-xs text-muted-foreground">
            <span>24 likes</span>
            <span>3 comments</span>
          </div>
          <div className="flex items-center justify-around mt-2 pt-2 border-t border-border/50">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Like
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <MessageCircle className="w-4 h-4" />
              Comment
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Repeat2 className="w-4 h-4" />
              Repost
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Instagram
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
        <div className="w-8 h-8 rounded-full bg-accent/50 shrink-0" />
        <span className="text-sm font-semibold text-foreground">yourhandle</span>
      </div>
      {/* Image placeholder */}
      <div className="aspect-square bg-accent/20 flex items-center justify-center">
        <span className="text-4xl opacity-30">📸</span>
      </div>
      {/* Actions */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Heart className="w-5 h-5 text-muted-foreground" />
            <MessageCircle className="w-5 h-5 text-muted-foreground" />
            <Share className="w-5 h-5 text-muted-foreground" />
          </div>
          <BookmarkIcon className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground mt-2">128 likes</p>
        <div className="mt-1">
          <p className={`text-xs leading-relaxed ${isEmpty ? "text-muted-foreground/50 italic" : "text-foreground"}`}>
            <span className="font-semibold">yourhandle</span>{" "}
            {displayText.length > 120 ? displayText.slice(0, 120) + "..." : displayText}
          </p>
          {text.length > 120 && (
            <button className="text-xs text-muted-foreground mt-0.5">more</button>
          )}
        </div>
      </div>
    </div>
  );
}
