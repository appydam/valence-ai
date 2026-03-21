import { Calendar, Heart, Share2, MessageCircle } from "lucide-react";

interface ContentCardProps {
  platform: string;
  title: string;
  date: string;
  status: "draft" | "scheduled" | "published";
  likes?: number;
  shares?: number;
  comments?: number;
}

const PLATFORM_INFO: Record<string, { icon: string; color: string; label: string }> = {
  twitter: { icon: "\ud835\udd4f", color: "hsl(203, 89%, 53%)", label: "Twitter / X" },
  linkedin: { icon: "in", color: "hsl(210, 70%, 45%)", label: "LinkedIn" },
  instagram: { icon: "\ud83d\udcf8", color: "hsl(330, 70%, 55%)", label: "Instagram" },
  blog: { icon: "\ud83d\udcdd", color: "hsl(142, 71%, 45%)", label: "Blog" },
};

export function ContentCard({
  platform,
  title,
  date,
  status,
  likes,
  shares,
  comments,
}: ContentCardProps) {
  const info = PLATFORM_INFO[platform] ?? { icon: "?", color: "hsl(0,0%,50%)", label: platform };

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
      {/* Platform Icon */}
      <span
        className="flex items-center justify-center w-9 h-9 rounded-lg text-xs font-bold text-white shrink-0"
        style={{ background: info.color }}
      >
        {info.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{info.label}</span>
          <span className="text-muted-foreground/30">|</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {date}
          </span>
        </div>
      </div>

      {/* Engagement Stats (only for published) */}
      {status === "published" && (
        <div className="flex items-center gap-4">
          {likes !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="w-3 h-3" />
              {likes}
            </span>
          )}
          {shares !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Share2 className="w-3 h-3" />
              {shares}
            </span>
          )}
          {comments !== undefined && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="w-3 h-3" />
              {comments}
            </span>
          )}
        </div>
      )}

      {/* Status Badge */}
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
          status === "published"
            ? "bg-green-500/10 text-green-500"
            : status === "scheduled"
            ? "bg-blue-500/10 text-blue-500"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {status}
      </span>
    </div>
  );
}
