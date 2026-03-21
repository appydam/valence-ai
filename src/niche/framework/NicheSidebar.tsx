import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNiche } from "./NicheContext";
import { PoweredByBadge } from "./PoweredByBadge";

export function NicheSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { config, isStandalone } = useNiche();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
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
          className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0 text-lg"
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {config.sidebarItems.map((item) => {
          const fullPath = `${config.basePath}${item.path}`;
          const isActive =
            item.path === ""
              ? location.pathname === config.basePath || location.pathname === `${config.basePath}/`
              : location.pathname.startsWith(fullPath);
          const Icon = item.icon;

          return (
            <Link
              key={fullPath}
              to={fullPath}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
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
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {!collapsed && item.badge && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `${config.accentColor}20`,
                    color: config.accentColor,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
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
