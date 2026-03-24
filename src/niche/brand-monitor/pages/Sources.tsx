import {
  Youtube,
  BarChart3,
  Search,
  BookOpen,
  MessageSquare,
  FileText,
  Mail,
  Twitter,
  Globe,
  CheckCircle2,
  Plus,
  Settings,
  Clock,
} from "lucide-react";
import { useNiche } from "../../framework/NicheContext";

type SourceStatus = "connected" | "available" | "free" | "coming_soon";

interface SourceCard {
  name: string;
  description: string;
  icon: typeof Youtube;
  status: SourceStatus;
  lastSync?: string;
  mentionCount?: number;
}

const STATUS_CONFIG: Record<SourceStatus, { label: string; color: string; bg: string }> = {
  connected: { label: "Connected", color: "text-green-400", bg: "bg-green-500/10" },
  available: { label: "Available", color: "text-blue-400", bg: "bg-blue-500/10" },
  free: { label: "Free", color: "text-purple-400", bg: "bg-purple-500/10" },
  coming_soon: { label: "Coming Soon", color: "text-muted-foreground", bg: "bg-muted" },
};

const SOURCES: SourceCard[] = [
  {
    name: "YouTube",
    description: "Monitor video mentions, comments, and channel references",
    icon: Youtube,
    status: "connected",
    lastSync: "5 min ago",
    mentionCount: 24,
  },
  {
    name: "Google Analytics",
    description: "Track brand search traffic and referral sources",
    icon: BarChart3,
    status: "connected",
    lastSync: "10 min ago",
    mentionCount: 156,
  },
  {
    name: "Google Search Console",
    description: "Monitor search impressions and brand keyword rankings",
    icon: Search,
    status: "available",
  },
  {
    name: "HackerNews",
    description: "Track discussions and Show HN posts mentioning your brand",
    icon: BookOpen,
    status: "free",
    lastSync: "15 min ago",
    mentionCount: 8,
  },
  {
    name: "Slack",
    description: "Monitor internal channels for brand-related discussions",
    icon: MessageSquare,
    status: "connected",
    lastSync: "2 min ago",
    mentionCount: 42,
  },
  {
    name: "Notion",
    description: "Scan workspace pages for brand references and notes",
    icon: FileText,
    status: "connected",
    lastSync: "1h ago",
    mentionCount: 12,
  },
  {
    name: "Gmail",
    description: "Monitor inbound emails for brand mentions and feedback",
    icon: Mail,
    status: "connected",
    lastSync: "30 min ago",
    mentionCount: 18,
  },
  {
    name: "Reddit",
    description: "Track subreddit posts and comments about your brand",
    icon: Globe,
    status: "coming_soon",
  },
  {
    name: "Twitter / X",
    description: "Monitor tweets, replies, and hashtags mentioning your brand",
    icon: Twitter,
    status: "coming_soon",
  },
];

export function Sources() {
  const { config } = useNiche();

  const connectedCount = SOURCES.filter((s) => s.status === "connected" || s.status === "free").length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sources</h1>
        <p className="text-sm text-muted-foreground">
          {connectedCount} sources active · Monitoring across {SOURCES.length} platforms
        </p>
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SOURCES.map((source) => {
          const Icon = source.icon;
          const statusCfg = STATUS_CONFIG[source.status];
          const isActive = source.status === "connected" || source.status === "free";

          return (
            <div
              key={source.name}
              className={`rounded-xl border bg-card p-5 transition-all ${
                isActive
                  ? "border-border/40 hover:border-border/60"
                  : source.status === "coming_soon"
                  ? "border-border/20 opacity-50"
                  : "border-border/30 hover:border-border/50"
              }`}
            >
              {/* Top row: icon + status */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: isActive ? `${config.accentColor}15` : "hsl(0,0%,12%)",
                  }}
                >
                  <Icon
                    className="w-5 h-5"
                    style={{ color: isActive ? config.accentColor : undefined }}
                  />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>

              {/* Name + description */}
              <h3 className="text-sm font-semibold text-foreground mb-1">{source.name}</h3>
              <p className="text-[11px] text-muted-foreground/60 leading-relaxed mb-3 line-clamp-2">
                {source.description}
              </p>

              {/* Stats or action */}
              {isActive ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground/50">
                    {source.lastSync && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {source.lastSync}
                      </span>
                    )}
                    {source.mentionCount !== undefined && (
                      <span>{source.mentionCount} mentions</span>
                    )}
                  </div>
                  <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                    <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              ) : source.status === "available" ? (
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                  style={{ background: config.accentColor }}
                >
                  <Plus className="w-3 h-3" />
                  Connect
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                  <Clock className="w-3 h-3" />
                  Expected Q2 2026
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
