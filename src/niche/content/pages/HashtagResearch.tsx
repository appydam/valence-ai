import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Hash,
  Search,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Save,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";
import { useAgentTrigger } from "../../framework/useAgentTrigger";

interface HashtagResult {
  hashtag: string;
  volume: "High" | "Medium" | "Low";
  trend: "up" | "up-right" | "flat" | "down-right" | "down";
  competition: "High" | "Medium" | "Low";
  relevance: number;
}

interface SavedSet {
  name: string;
  hashtags: string[];
}

const TREND_ICONS: Record<string, typeof TrendingUp> = {
  up: TrendingUp,
  "up-right": ArrowUpRight,
  flat: Minus,
  "down-right": ArrowDownRight,
  down: TrendingDown,
};

const TREND_COLORS: Record<string, string> = {
  up: "text-green-500",
  "up-right": "text-green-400",
  flat: "text-yellow-500",
  "down-right": "text-orange-400",
  down: "text-red-400",
};

const VOLUME_COLORS: Record<string, string> = {
  High: "text-green-500 bg-green-500/10",
  Medium: "text-yellow-500 bg-yellow-500/10",
  Low: "text-red-400 bg-red-400/10",
};

const SAVED_SETS_KEY = "content-studio-hashtag-sets";

function parseHashtagsFromDeliverable(deliverable: string): HashtagResult[] {
  const results: HashtagResult[] = [];
  try {
    const parsed = JSON.parse(deliverable);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item.hashtag) {
          results.push({
            hashtag: item.hashtag.startsWith("#") ? item.hashtag : `#${item.hashtag}`,
            volume: item.volume ?? "Medium",
            trend: item.trend ?? "up",
            competition: item.competition ?? "Medium",
            relevance: item.relevance ?? 70,
          });
        }
      }
    }
  } catch {
    // Parse plain text: look for lines with hashtags
    const lines = deliverable.split("\n");
    for (const line of lines) {
      const match = line.match(/#\w+/);
      if (match) {
        results.push({
          hashtag: match[0],
          volume: "Medium",
          trend: "up",
          competition: "Medium",
          relevance: 70,
        });
      }
    }
  }
  return results;
}

export function HashtagResearch() {
  const { config } = useNiche();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [savedSets, setSavedSets] = useState<SavedSet[]>([]);
  const [newSetName, setNewSetName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Load saved sets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_SETS_KEY);
      if (stored) setSavedSets(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Query completed hashtag research tasks
  const tasks = useQuery(api.tasks.list, {});
  const hashtagTasks = (tasks ?? []).filter(
    (t: { tags?: string[]; status: string }) =>
      t.tags?.includes("niche:content") &&
      t.tags?.includes("hashtag-research") &&
      t.status === "done"
  );

  // Get results from the latest completed task
  const results: HashtagResult[] = hashtagTasks.length > 0
    ? parseHashtagsFromDeliverable(hashtagTasks[hashtagTasks.length - 1]?.deliverable ?? "")
    : [];

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setSelected(new Set());

    await triggerAgent(
      "Scout",
      `Research hashtags for: ${query}`,
      `Research trending and relevant hashtags for the topic: "${query}"\n\nFor each hashtag provide as a JSON array:\n- hashtag (with # prefix)\n- volume (High/Medium/Low)\n- trend direction (up/up-right/flat/down-right/down)\n- competition level (High/Medium/Low)\n- relevance score (0-100)\n\nReturn 15-20 hashtags as a JSON array.`,
      ["niche:content", "hashtag-research"],
      { priority: "high" }
    );

    setSearching(false);
  };

  const toggleSelect = (hashtag: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(hashtag)) next.delete(hashtag);
      else next.add(hashtag);
      return next;
    });
  };

  const handleCopySelected = () => {
    const text = Array.from(selected).join(" ");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleSaveSet = () => {
    if (!newSetName.trim() || selected.size === 0) return;
    const updated = [
      ...savedSets,
      { name: newSetName.trim(), hashtags: Array.from(selected) },
    ];
    setSavedSets(updated);
    try {
      localStorage.setItem(SAVED_SETS_KEY, JSON.stringify(updated));
    } catch {
      // Storage full
    }
    setNewSetName("");
    setShowSaveInput(false);
  };

  const handleLoadSet = (set: SavedSet) => {
    setSelected(new Set(set.hashtags));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hashtag Research</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find trending and relevant hashtags for your content
        </p>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter topic or keyword..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || agentLoading || !query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60 shrink-0"
            style={{ background: config.accentColor }}
          >
            {searching || agentLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Hash className="w-4 h-4" />
                Research
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Results Table */}
        <div className="lg:col-span-3">
          {results.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Actions bar */}
              {selected.size > 0 && (
                <div className="flex items-center gap-3 px-5 py-2.5 border-b border-border bg-accent/10">
                  <span className="text-xs font-medium text-foreground">
                    {selected.size} selected
                  </span>
                  <button
                    onClick={handleCopySelected}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copiedAll ? (
                      <Check className="w-3 h-3 text-green-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    Copy Selected
                  </button>
                  <button
                    onClick={() => setShowSaveInput(true)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Save Set
                  </button>
                </div>
              )}

              {showSaveInput && (
                <div className="flex items-center gap-2 px-5 py-2 border-b border-border bg-accent/5">
                  <input
                    type="text"
                    value={newSetName}
                    onChange={(e) => setNewSetName(e.target.value)}
                    placeholder="Set name..."
                    className="px-2 py-1 rounded border border-border bg-background text-xs text-foreground focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveSet}
                    className="px-2 py-1 rounded text-xs font-medium text-white"
                    style={{ background: config.accentColor }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setShowSaveInput(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="w-8 px-3 py-3" />
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">
                      Hashtag
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">
                      Volume
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">
                      Trend
                    </th>
                    <th className="text-center text-xs font-medium text-muted-foreground px-3 py-3">
                      Competition
                    </th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">
                      Relevance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((item) => {
                    const TrendIcon = TREND_ICONS[item.trend] ?? Minus;
                    const isSelected = selected.has(item.hashtag);
                    return (
                      <tr
                        key={item.hashtag}
                        className={`border-b border-border/30 hover:bg-accent/20 transition-colors cursor-pointer ${
                          isSelected ? "bg-accent/10" : ""
                        }`}
                        onClick={() => toggleSelect(item.hashtag)}
                      >
                        <td className="px-3 py-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(item.hashtag)}
                            className="rounded border-border"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-sm font-medium text-foreground">
                            {item.hashtag}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${VOLUME_COLORS[item.volume]}`}
                          >
                            {item.volume}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <TrendIcon
                            className={`w-4 h-4 mx-auto ${TREND_COLORS[item.trend]}`}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-xs text-muted-foreground">
                            {item.competition}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span
                            className="text-sm font-medium"
                            style={{
                              color:
                                item.relevance >= 80
                                  ? config.accentColor
                                  : item.relevance >= 60
                                  ? "hsl(45, 90%, 55%)"
                                  : "hsl(0, 0%, 50%)",
                            }}
                          >
                            {item.relevance}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {results.length === 0 && !searching && !agentLoading && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Hash className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground mb-1">
                Enter a topic and click Research
              </p>
              <p className="text-xs text-muted-foreground">
                Scout will research trending hashtags with volume, competition, and relevance data.
              </p>
            </div>
          )}

          {(searching || agentLoading) && results.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Scout is researching hashtags for "{query}"...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Results will appear automatically when complete.
              </p>
            </div>
          )}
        </div>

        {/* Saved Sets */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Saved Hashtag Sets</h3>
            {savedSets.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No saved sets yet. Research hashtags, select your favorites, and save them as a set.
              </p>
            ) : (
              <div className="space-y-2">
                {savedSets.map((set, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLoadSet(set)}
                    className="w-full text-left p-2.5 rounded-lg border border-border/50 hover:border-border hover:bg-accent/10 transition-all"
                  >
                    <span className="text-xs font-medium text-foreground block">
                      {set.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block truncate">
                      {set.hashtags.join(" ")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
