import { useLocation } from "react-router-dom";
import { Clock } from "@/components/Clock";
import { Activity, LayoutGrid, Users, Terminal, FileText, Settings, Wrench, FolderOpen, Plug, Webhook, BarChart3 } from "lucide-react";

const routeConfig: Record<string, { title: string; icon: any }> = {
  "/": { title: "Activity Feed", icon: Activity },
  "/board": { title: "Mission Board", icon: LayoutGrid },
  "/missions": { title: "Missions", icon: FolderOpen },
  "/documents": { title: "Documents", icon: FileText },
  "/agents": { title: "Agents", icon: Users },
  "/tools": { title: "Tools", icon: Wrench },
  "/integrations": { title: "Integrations", icon: Plug },
  "/webhooks": { title: "Webhooks", icon: Webhook },
  "/analytics": { title: "Analytics", icon: BarChart3 },
  "/command": { title: "Command Center", icon: Terminal },
  "/settings": { title: "Settings", icon: Settings },
};

export function Navbar() {
  const location = useLocation();
  const config = routeConfig[location.pathname] || { title: "Mission Control", icon: Activity };
  const Icon = config.icon;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between h-16 px-6 bg-card/80 backdrop-blur-md border-b border-border">
      {/* Left: Current Page */}
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{config.title}</span>
      </div>

      {/* Center: Clock */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Clock />
      </div>

      {/* Right: System Status */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-status-online animate-pulse-glow" />
        <span className="text-xs text-muted-foreground">Online</span>
      </div>
    </nav>
  );
}
