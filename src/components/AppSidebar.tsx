import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Activity, LayoutGrid, Users, Terminal, Settings, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Activity Feed", path: "/", icon: Activity },
  { title: "Mission Board", path: "/board", icon: LayoutGrid },
  { title: "Agents", path: "/agents", icon: Users },
  { title: "Command Center", path: "/command", icon: Terminal },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside className={cn(
      "flex flex-col border-r border-border bg-sidebar h-screen sticky top-0 transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">Mission Control</h1>
            <p className="text-[10px] text-muted-foreground">AI Agent Squad</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-2">
        {/* Connection status */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg",
          collapsed ? "justify-center" : ""
        )}>
          <div className="w-2 h-2 rounded-full bg-status-online animate-pulse-glow" />
          {!collapsed && <span className="text-xs text-muted-foreground">Connected</span>}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
