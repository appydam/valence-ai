import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNiche } from "./NicheContext";
import { PoweredByBadge } from "./PoweredByBadge";
import { useSimulation } from "../ads/simulation/SimulationContext";
import type { NicheSidebarItem } from "./types";

// Phased badges — appear at stream milestones (auto-typing ~4s + stream delays)
// Keywords appear after Scout research (~16s), Creatives after Ghost (~28s),
// Campaigns + Budgets after launch (~39s), Performance + Recommendations after monitoring (~48s)
const SIM_BADGE_PHASES: { at: number; badges: Record<string, string> }[] = [
  { at: 0, badges: {} },
  { at: 16000, badges: { "/keywords": "8" } },
  { at: 28500, badges: { "/keywords": "8", "/creatives": "5 new" } },
  { at: 39500, badges: { "/keywords": "8", "/creatives": "5 new", "/campaigns": "4", "/budgets": "$200/d" } },
  { at: 48000, badges: { "/keywords": "8", "/creatives": "5 new", "/campaigns": "4", "/budgets": "$200/d", "/insights": "4.1x", "/recommendations": "5" } },
];

export function NicheSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { config, isStandalone } = useNiche();
  const { isSimulating } = useSimulation();

  // Phased badge state
  const [simBadgeIndex, setSimBadgeIndex] = useState(0);
  useEffect(() => {
    if (!isSimulating) { setSimBadgeIndex(0); return; }
    const timers = SIM_BADGE_PHASES.map((phase, i) =>
      setTimeout(() => setSimBadgeIndex(i), phase.at)
    );
    return () => timers.forEach(clearTimeout);
  }, [isSimulating]);

  const simBadges = isSimulating ? SIM_BADGE_PHASES[simBadgeIndex]?.badges ?? {} : {};

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  // Check if a path (or any of its children) is active
  const isItemActive = (item: NicheSidebarItem): boolean => {
    const fullPath = `${config.basePath}${item.path}`;
    if (item.path === "") {
      return location.pathname === config.basePath || location.pathname === `${config.basePath}/`;
    }
    if (location.pathname.startsWith(fullPath)) return true;
    if (item.children) {
      return item.children.some((child) => {
        const childPath = `${config.basePath}${child.path}`;
        return location.pathname.startsWith(childPath);
      });
    }
    return false;
  };

  // Auto-expand parent if a child is active
  const isChildActive = (item: NicheSidebarItem): boolean => {
    if (!item.children) return false;
    return item.children.some((child) => {
      const childPath = `${config.basePath}${child.path}`;
      return location.pathname.startsWith(childPath);
    });
  };

  const renderItem = (item: NicheSidebarItem) => {
    const fullPath = `${config.basePath}${item.path}`;
    const isActive = isItemActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.path) || isChildActive(item);
    const Icon = item.icon;

    return (
      <div key={fullPath}>
        <div className="flex items-center">
          <Link
            to={fullPath}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 flex-1 min-w-0",
              isActive
                ? "font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
            style={
              isActive
                ? {
                    background: `${config.accentColor}15`,
                    color: config.accentColor,
                  }
                : undefined
            }
            title={collapsed ? item.label : undefined}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
            {!collapsed && (
              <span className="truncate flex-1 text-[13px]">{item.label}</span>
            )}
            {!collapsed && (item.badge || (config.id === "ads" && simBadges[item.path])) && (
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full animate-[fadeIn_0.3s_ease-out]"
                style={{
                  background: `${config.accentColor}20`,
                  color: config.accentColor,
                }}
              >
                {item.badge || simBadges[item.path]}
              </span>
            )}
          </Link>
          {/* Expand/collapse chevron for items with children */}
          {hasChildren && !collapsed && (
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleExpanded(item.path);
              }}
              className="p-1.5 rounded-md text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent/50 transition-all mr-1"
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isExpanded ? "rotate-0" : "-rotate-90"
                )}
              />
            </button>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 pl-3 border-l border-border/40 mt-0.5 mb-1 space-y-0.5">
            {item.children!.map((child) => {
              const childPath = `${config.basePath}${child.path}`;
              const childActive = location.pathname.startsWith(childPath);
              const ChildIcon = child.icon;

              return (
                <Link
                  key={childPath}
                  to={childPath}
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] transition-all duration-200",
                    childActive
                      ? "font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  style={
                    childActive
                      ? { color: config.accentColor }
                      : undefined
                  }
                >
                  <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Group items by section
  let lastSection: string | undefined;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Niche Header */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 border-b border-border",
          collapsed ? "justify-center" : ""
        )}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0 text-base"
          style={{ background: `${config.accentColor}20` }}
        >
          {config.emoji}
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-foreground truncate">
              {config.name}
            </h1>
            <p className="text-[10px] text-muted-foreground truncate">
              {config.tagline}
            </p>
          </div>
        )}
      </div>

      {/* Back to main app (only when embedded, not standalone) */}
      {!isStandalone && (
        <div className="px-3 pt-3">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all",
              collapsed ? "justify-center" : ""
            )}
            title={collapsed ? "Back to Valence AI" : undefined}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Back to Valence AI</span>}
          </Link>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {config.sidebarItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <div key={`${config.basePath}${item.path}`}>
              {showSection && !collapsed && (
                <div className="pt-4 pb-1.5 px-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                    {item.section}
                  </span>
                </div>
              )}
              {showSection && collapsed && <div className="pt-3" />}
              {renderItem(item)}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-3">
        {/* Powered by badge */}
        {!collapsed && <PoweredByBadge />}
        {collapsed && (
          <a
            href="https://usevalence.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center"
            title="Powered by Valence AI"
          >
            <img src="/logo.svg" alt="Valence AI" className="w-5 h-5 opacity-50 hover:opacity-100 transition-opacity" />
          </a>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
}
