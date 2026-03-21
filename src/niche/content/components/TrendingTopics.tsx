import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { TrendingUp, TrendingDown, Minus, Loader2, Search } from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

interface TrendingTopic {
  id: string;
  topic: string;
  volume: string;
  direction: "up" | "down" | "flat";
  relevance: number;
}

function parseTopicsFromDeliverables(tasks: any[]): TrendingTopic[] {
  const topics: TrendingTopic[] = [];
  for (const task of tasks) {
    if (!task.deliverable) continue;
    try {
      const parsed = JSON.parse(task.deliverable);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (item.topic) {
            topics.push({
              id: `${task._id}-${item.topic}`,
              topic: item.topic,
              volume: item.volume ?? "N/A",
              direction: item.direction ?? "up",
              relevance: item.relevance ?? 70,
            });
          }
        }
      }
    } catch {
      // Deliverable is plain text — extract lines as topics
      const lines = task.deliverable.split("\n").filter((l: string) => l.trim().length > 5);
      lines.slice(0, 5).forEach((line: string, idx: number) => {
        const cleaned = line.replace(/^[-*\d.]+\s*/, "").trim();
        if (cleaned.length > 3 && cleaned.length < 100) {
          topics.push({
            id: `${task._id}-${idx}`,
            topic: cleaned,
            volume: "N/A",
            direction: "up",
            relevance: 80 - idx * 5,
          });
        }
      });
    }
  }
  return topics.slice(0, 5);
}

export function TrendingTopics() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [triggered, setTriggered] = useState(false);

  const tasks = useQuery(api.tasks.list, {});
  const trendingTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:content") &&
      t.tags?.includes("trending") &&
      t.status === "done"
  );

  const topics = parseTopicsFromDeliverables(trendingTasks);

  const handleResearch = async () => {
    setTriggered(true);
    await triggerAgent(
      "Scout",
      "Research trending topics for content",
      "Research the top 5 trending topics relevant to content marketing, AI, and digital growth. For each topic provide: topic name, estimated search volume, trend direction (up/down/flat), and relevance score (0-100). Return as a JSON array.",
      ["niche:content", "trending"],
      { priority: "high" }
    );
  };

  if (topics.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Trending in your niche (via Scout research)
        </p>
        <div className="text-center py-4">
          <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground mb-3">
            No trending topics yet. Trigger Scout to research current trends.
          </p>
          <button
            onClick={handleResearch}
            disabled={agentLoading || triggered}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all disabled:opacity-60"
            style={{ background: config.accentColor }}
          >
            {agentLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <TrendingUp className="w-3 h-3" />
            )}
            {triggered ? "Researching..." : "Research Trends"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <p className="text-xs text-muted-foreground">
        Trending in your niche (via Scout research)
      </p>
      <div className="space-y-2">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer"
          >
            {/* Direction Icon */}
            <div className="shrink-0">
              {topic.direction === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : topic.direction === "down" ? (
                <TrendingDown className="w-4 h-4 text-red-400" />
              ) : (
                <Minus className="w-4 h-4 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{topic.topic}</p>
              <p className="text-xs text-muted-foreground">{topic.volume} searches</p>
            </div>

            {/* Relevance Score */}
            <div className="text-right shrink-0">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: `${config.accentColor}15`,
                  color: config.accentColor,
                }}
              >
                {topic.relevance}%
              </span>
              <p className="text-[10px] text-muted-foreground mt-0.5">relevance</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
