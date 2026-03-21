import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Command,
  Megaphone,
  Target,
  PenTool,
  LayoutDashboard,
  Settings,
  Plug,
  Loader2,
  Zap,
  FlaskConical,
  Activity,
  GitBranch,
  Signal,
  Mail,
  Kanban,
  FileText,
  Recycle,
  Palette,
  Mic,
  type LucideIcon,
} from "lucide-react";
import { useNiche } from "./NicheContext";
import { useAgentTrigger } from "./useAgentTrigger";

interface CommandItem {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  shortcut?: string;
  category: "Ads" | "GTM" | "Content" | "Global";
  action: () => void;
}

interface CommandBarProps {
  externalOpen?: boolean;
  onExternalClose?: () => void;
}

export function CommandBar({ externalOpen, onExternalClose }: CommandBarProps = {}) {
  const { config } = useNiche();
  const navigate = useNavigate();
  const { triggerAgent, loading: agentLoading } = useAgentTrigger();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Sync with external open trigger (from navbar button)
  useEffect(() => {
    if (externalOpen) {
      setOpen(true);
    }
  }, [externalOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
    onExternalClose?.();
  }, [onExternalClose]);

  // Register Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        handleClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleTriggerKaze = useCallback(
    async (text: string) => {
      await triggerAgent(
        "Kaze",
        text.slice(0, 100),
        text,
        [`niche:${config.id}`, "command-bar"],
        { priority: "high" }
      );
      handleClose();
    },
    [triggerAgent, config.id]
  );

  // Define all commands
  const commands: CommandItem[] = useMemo(
    () => [
      // Ads commands
      {
        id: "ads-create-campaign",
        icon: Megaphone,
        label: "Create campaign",
        description: "Build a new ad campaign",
        category: "Ads",
        action: () => {
          navigate("/niche/ads/campaigns");
          handleClose();
        },
      },
      {
        id: "ads-generate-creative",
        icon: Palette,
        label: "Generate ad creative",
        description: "AI-generate ad copy and visuals",
        category: "Ads",
        action: () => {
          navigate("/niche/ads/creatives");
          handleClose();
        },
      },
      {
        id: "ads-check-fatigue",
        icon: Activity,
        label: "Check ad fatigue",
        description: "Monitor creative performance decay",
        category: "Ads",
        action: () => {
          navigate("/niche/ads/fatigue");
          handleClose();
        },
      },
      {
        id: "ads-attribution",
        icon: GitBranch,
        label: "View attribution",
        description: "See channel attribution data",
        category: "Ads",
        action: () => {
          navigate("/niche/ads/attribution");
          handleClose();
        },
      },
      {
        id: "ads-ab-test",
        icon: FlaskConical,
        label: "Run A/B test",
        description: "Create a new split test",
        category: "Ads",
        action: () => {
          navigate("/niche/ads/ab-tests");
          handleClose();
        },
      },

      // GTM commands
      {
        id: "gtm-source-leads",
        icon: Target,
        label: "Source leads",
        description: "Find qualified leads with AI",
        category: "GTM",
        action: () => {
          navigate("/niche/gtm/leads");
          handleClose();
        },
      },
      {
        id: "gtm-send-sequence",
        icon: Mail,
        label: "Send sequence",
        description: "Create and send email sequences",
        category: "GTM",
        action: () => {
          navigate("/niche/gtm/sequences");
          handleClose();
        },
      },
      {
        id: "gtm-check-pipeline",
        icon: Kanban,
        label: "Check pipeline",
        description: "View your sales pipeline",
        category: "GTM",
        action: () => {
          navigate("/niche/gtm/pipeline");
          handleClose();
        },
      },
      {
        id: "gtm-scan-signals",
        icon: Signal,
        label: "Scan for signals",
        description: "Find buying intent signals",
        category: "GTM",
        action: () => {
          navigate("/niche/gtm/signals");
          handleClose();
        },
      },

      // Content commands
      {
        id: "content-write-post",
        icon: PenTool,
        label: "Write a post",
        description: "Compose a social media post",
        category: "Content",
        action: () => {
          navigate("/niche/content/compose");
          handleClose();
        },
      },
      {
        id: "content-write-blog",
        icon: FileText,
        label: "Write a blog",
        description: "Create a long-form blog post",
        category: "Content",
        action: () => {
          navigate("/niche/content/blog");
          handleClose();
        },
      },
      {
        id: "content-repurpose",
        icon: Recycle,
        label: "Repurpose content",
        description: "Transform content across formats",
        category: "Content",
        action: () => {
          navigate("/niche/content/repurpose");
          handleClose();
        },
      },
      {
        id: "content-seo",
        icon: Search,
        label: "Check SEO",
        description: "Analyze SEO performance",
        category: "Content",
        action: () => {
          navigate("/niche/content/seo");
          handleClose();
        },
      },
      {
        id: "content-brand-voice",
        icon: Mic,
        label: "Brand voice",
        description: "Configure your brand voice",
        category: "Content",
        action: () => {
          navigate("/niche/content/brand-voice");
          handleClose();
        },
      },

      // Global commands
      {
        id: "global-dashboard",
        icon: LayoutDashboard,
        label: "Go to dashboard",
        description: "Main dashboard overview",
        shortcut: "G D",
        category: "Global",
        action: () => {
          navigate("/");
          handleClose();
        },
      },
      {
        id: "global-integrations",
        icon: Plug,
        label: "Go to integrations",
        description: "Manage connected services",
        shortcut: "G I",
        category: "Global",
        action: () => {
          navigate("/integrations");
          handleClose();
        },
      },
      {
        id: "global-settings",
        icon: Settings,
        label: "Go to settings",
        description: "App settings and preferences",
        shortcut: "G S",
        category: "Global",
        action: () => {
          navigate("/settings");
          handleClose();
        },
      },
    ],
    [navigate]
  );

  // Fuzzy filter
  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lower) ||
        cmd.description.toLowerCase().includes(lower) ||
        cmd.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    for (const cmd of filtered) {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    }
    return groups;
  }, [filtered]);

  // Flat list for keyboard navigation
  const flatList = useMemo(() => filtered, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          flatList[selectedIndex].action();
        } else if (query.trim()) {
          // Free-text: trigger Kaze
          handleTriggerKaze(query.trim());
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, selectedIndex, flatList, query, handleTriggerKaze]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const selected = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => handleClose()}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl border bg-card shadow-2xl overflow-hidden"
        style={{ borderColor: `${config.accentColor}40` }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Command className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or ask AI anything..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {agentLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border bg-accent/30">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2">
          {Object.entries(grouped).length > 0 ? (
            Object.entries(grouped).map(([category, cmds]) => (
              <div key={category}>
                <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </p>
                {cmds.map((cmd) => {
                  flatIndex++;
                  const idx = flatIndex;
                  const isSelected = idx === selectedIndex;
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      data-index={idx}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                        isSelected ? "bg-accent/40" : "hover:bg-accent/20"
                      }`}
                    >
                      <Icon
                        className="w-4 h-4 shrink-0"
                        style={isSelected ? { color: config.accentColor } : undefined}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{cmd.label}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {cmd.description}
                        </p>
                      </div>
                      {cmd.shortcut && (
                        <kbd className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
                          {cmd.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          ) : query.trim() ? (
            <div className="px-4 py-6 text-center">
              <Zap className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                No matching commands
              </p>
              <button
                onClick={() => handleTriggerKaze(query.trim())}
                disabled={agentLoading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
                style={{ background: config.accentColor }}
              >
                {agentLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                Ask AI: "{query.slice(0, 50)}{query.length > 50 ? "..." : ""}"
              </button>
            </div>
          ) : null}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-accent/30 font-mono">
                &uarr;&darr;
              </kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded border border-border bg-accent/30 font-mono">
                &crarr;
              </kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-border bg-accent/30 font-mono">
              &lcub;K
            </kbd>
            Toggle
          </span>
        </div>
      </div>
    </div>
  );
}
