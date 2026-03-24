import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useNiche } from "../../framework/NicheContext";
import { CalendarGrid } from "../components/CalendarGrid";
import { useUserTasks } from "@/hooks/useUserScoped";

type ViewMode = "month" | "week" | "day";

export interface CalendarContentItem {
  id: string;
  title: string;
  platform: "twitter" | "linkedin" | "instagram" | "blog";
  date: string; // YYYY-MM-DD
  time: string;
  status: "draft" | "scheduled" | "published";
}

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "hsl(203, 89%, 53%)",
  linkedin: "hsl(210, 70%, 45%)",
  instagram: "hsl(330, 70%, 55%)",
  blog: "hsl(142, 71%, 45%)",
};

function inferPlatform(title: string): "twitter" | "linkedin" | "instagram" | "blog" {
  const lower = title.toLowerCase();
  if (lower.includes("twitter") || lower.includes("tweet") || lower.includes("thread")) return "twitter";
  if (lower.includes("linkedin")) return "linkedin";
  if (lower.includes("instagram") || lower.includes("reel") || lower.includes("carousel")) return "instagram";
  return "blog";
}

function mapTaskStatus(status: string): "draft" | "scheduled" | "published" {
  if (status === "done") return "published";
  if (status === "assigned" || status === "in_progress") return "scheduled";
  return "draft";
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function CalendarView() {
  const { config } = useNiche();
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());

  const tasks = useUserTasks();
  const contentTasks = (tasks ?? []).filter((t: { tags?: string[] }) =>
    t.tags?.includes("niche:content")
  );

  const contentItems: CalendarContentItem[] = useMemo(() => {
    return contentTasks.map((task: { _id: string; title: string; status: string; _creationTime: number }) => {
      const date = new Date(task._creationTime);
      return {
        id: task._id,
        title: task.title,
        platform: inferPlatform(task.title),
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
        time: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        status: mapTaskStatus(task.status),
      };
    });
  }, [contentTasks]);

  const monthName = MONTHS[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  const isLoading = tasks === undefined;

  const navigateMonth = (dir: -1 | 1) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + dir);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plan and schedule content across all platforms
          </p>
        </div>
        <Link
          to={`${config.basePath}/compose`}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: config.accentColor }}
        >
          <Plus className="w-4 h-4" />
          Add Content
        </Link>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold text-foreground min-w-[180px] text-center">
            {monthName} {year}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-card overflow-hidden">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              style={viewMode === mode ? { background: config.accentColor } : undefined}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Legend */}
      <div className="flex items-center gap-4">
        {Object.entries(PLATFORM_COLORS).map(([platform, color]) => (
          <span key={platform} className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            {platform}
          </span>
        ))}
      </div>

      {/* Calendar Grid or Empty State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : contentItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-16 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">No content scheduled</p>
          <p className="text-xs text-muted-foreground mb-4">
            Start composing content and it will appear on your calendar.
          </p>
          <Link
            to={`${config.basePath}/compose`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: config.accentColor }}
          >
            <Plus className="w-4 h-4" />
            Start Composing
          </Link>
        </div>
      ) : (
        <CalendarGrid
          currentDate={currentDate}
          contentItems={contentItems}
          platformColors={PLATFORM_COLORS}
        />
      )}
    </div>
  );
}
