import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutGrid,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Plug,
  Webhook,
  BarChart3,
  Brain,
  Wand2,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

const navItems = [
  { title: "Live Ops", path: "/", icon: Activity },
  { title: "Autopilot", path: "/autopilot", icon: Wand2 },

  { title: "Mission Board", path: "/board", icon: LayoutGrid },
  { title: "Missions", path: "/missions", icon: FolderOpen },
  { title: "Agents", path: "/agents", icon: Users },
  { title: "Memory Bank", path: "/memory", icon: Brain },
  { title: "Integrations", path: "/integrations", icon: Plug },
  { title: "Webhooks", path: "/webhooks", icon: Webhook },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
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
      <div className={cn(
        "flex items-center gap-3 p-4 border-b border-border",
        collapsed ? "justify-center" : ""
      )}>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 overflow-hidden shrink-0">
          <img src="/logo.svg" alt="Valence AI" className="w-6 h-6" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight text-foreground truncate">Valence AI</h1>
            <p className="text-[10px] text-muted-foreground truncate">Zero Human</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-3">
        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-lg bg-accent/30",
          collapsed ? "justify-center" : ""
        )}>
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "bg-card",
              },
            }}
          />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-foreground">Online</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell collapsed={collapsed} />

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
