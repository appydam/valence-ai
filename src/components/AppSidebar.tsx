import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutGrid,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Plug,
  Webhook,
  BarChart3,
  Brain,
  Wand2,
  CreditCard,
  HelpCircle,
  Rocket,
  Newspaper,
  FileCode,
  Boxes,
} from "lucide-react";
import { NICHE_LIST } from "@/niche/framework/registry";
import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

const navItems = [
  { title: "Live Ops", path: "/", icon: Activity },
  { title: "Autopilot", path: "/autopilot", icon: Wand2 },
  { title: "Daily Brief", path: "/brief", icon: Newspaper },
  { title: "Mission Board", path: "/board", icon: LayoutGrid },
  { title: "Missions", path: "/missions", icon: FolderOpen },
  { title: "Agents", path: "/agents", icon: Users },
  { title: "Memory Bank", path: "/memory", icon: Brain },
  { title: "File Manager", path: "/files", icon: FileCode },
  { title: "Integrations", path: "/integrations", icon: Plug },
  { title: "Webhooks", path: "/webhooks", icon: Webhook },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Billing", path: "/billing", icon: CreditCard },
  { title: "Settings", path: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [nicheOpen, setNicheOpen] = useState(true);
  const location = useLocation();
  const currentUser = useQuery(api.users.getCurrentUser);
  const isAdmin = currentUser?.role === "admin";

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
        <div className="flex items-center justify-center w-10 h-10 rounded-lg overflow-hidden shrink-0">
          <img src="/logo.svg" alt="Valence AI" className="w-12 h-12" />
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

        {/* Niche Products Section */}
        <div className="my-2 border-t border-border/50" />
        {collapsed ? (
          /* Collapsed: just show icons */
          NICHE_LIST.map((niche) => {
            const isActive = location.pathname.startsWith(niche.basePath);
            return (
              <Link
                key={niche.id}
                to={niche.basePath}
                className={cn(
                  "flex items-center justify-center px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                  isActive
                    ? "font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
                style={isActive ? { background: `${niche.accentColor}15`, color: niche.accentColor } : undefined}
                title={niche.name}
              >
                <span className="text-base">{niche.emoji}</span>
              </Link>
            );
          })
        ) : (
          /* Expanded: collapsible section */
          <>
            <button
              onClick={() => setNicheOpen(!nicheOpen)}
              className="flex items-center gap-2 px-3 py-2 w-full text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span className="flex-1">Niche Products</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", nicheOpen ? "" : "-rotate-90")} />
            </button>
            {nicheOpen && NICHE_LIST.map((niche) => {
              const isActive = location.pathname.startsWith(niche.basePath);
              return (
                <Link
                  key={niche.id}
                  to={niche.basePath}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    isActive
                      ? "font-medium shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  )}
                  style={isActive ? { background: `${niche.accentColor}15`, color: niche.accentColor } : undefined}
                >
                  <span className="text-base w-5 text-center shrink-0">{niche.emoji}</span>
                  <span className="truncate">{niche.name}</span>
                </Link>
              );
            })}
          </>
        )}
        <div className="my-2 border-t border-border/50" />

        {isAdmin && (
          <>
            <Link
              to="/ops"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                location.pathname === "/ops"
                  ? "bg-primary/10 text-primary font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              title={collapsed ? "Onboarding" : undefined}
            >
              <Rocket className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">Onboarding</span>}
            </Link>
          </>
        )}
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

        {/* Help Link */}
        <Link
          to="/docs"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
            location.pathname === "/docs"
              ? "bg-primary/10 text-primary font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? "Help & Docs" : undefined}
        >
          <HelpCircle className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="truncate">Help & Docs</span>}
        </Link>

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
