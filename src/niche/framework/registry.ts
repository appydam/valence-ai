import {
  Megaphone,
  Target,
  PenTool,
  LayoutDashboard,
  History,
  BarChart3,
  UserSearch,
  Mail,
  Kanban,
  Calendar,
  FileText,
  Search,
  Recycle,
  Signal,
  RotateCcw,
  Layers,
  Users,
  Palette,
  FlaskConical,
  Activity,
  Zap,
  FolderOpen,
  DollarSign,
  PieChart,
  GitBranch,
  Sparkles,
  Eye,
  MessageSquare,
  Bell,
  Globe,
  TrendingUp,
} from "lucide-react";
import type { NicheConfig } from "./types";

export const NICHE_REGISTRY: Record<string, NicheConfig> = {
  ads: {
    id: "ads",
    name: "AI Ad Manager",
    tagline: "Your AI-powered ad ops team",
    domain: "ads.usevalence.ai",
    basePath: "/niche/ads",
    icon: Megaphone,
    emoji: "🎯",
    accentColor: "hsl(262, 83%, 58%)",
    accentHsl: "262 83% 58%",
    requiredIntegrations: ["google-ads", "facebook-ads"],
    optionalIntegrations: ["instagram", "tiktok", "google-analytics", "posthog"],
    sidebarItems: [
      // AI-first
      { label: "Home", path: "", icon: LayoutDashboard },
      { label: "Insights", path: "/insights", icon: BarChart3 },
      { label: "History", path: "/history", icon: History },
      // Campaign Management
      { label: "Campaigns", path: "/campaigns", icon: Layers },
      { label: "Ad Groups", path: "/ad-groups", icon: FolderOpen },
      { label: "Ad Creator", path: "/ad-creator", icon: PenTool },
      { label: "Keywords", path: "/keywords", icon: Search },
      { label: "Audiences", path: "/audiences", icon: Users },
      // Creative & Testing
      { label: "Creative Studio", path: "/creatives", icon: Palette },
      { label: "A/B Tests", path: "/ab-tests", icon: FlaskConical },
      { label: "Ad Fatigue", path: "/fatigue", icon: Activity },
      // Optimization
      { label: "Budgets", path: "/budgets", icon: DollarSign },
      { label: "Automation", path: "/automation", icon: Zap },
      { label: "Attribution", path: "/attribution", icon: GitBranch },
      // Analytics
      { label: "Demographics", path: "/demographics", icon: PieChart },
      { label: "Conversions", path: "/conversions", icon: Target },
      { label: "Recommendations", path: "/recommendations", icon: Sparkles },
    ],
  },
  gtm: {
    id: "gtm",
    name: "AI GTM Engine",
    tagline: "Autonomous go-to-market machine",
    domain: "gtm.usevalence.ai",
    basePath: "/niche/gtm",
    icon: Target,
    emoji: "🚀",
    accentColor: "hsl(160, 84%, 39%)",
    accentHsl: "160 84% 39%",
    requiredIntegrations: ["apollo", "hunter", "gmail"],
    optionalIntegrations: ["hubspot", "salesforce", "linkedin", "twitter-x", "google-sheets", "slack"],
    sidebarItems: [
      // AI-first
      { label: "Home", path: "", icon: LayoutDashboard },
      { label: "Insights", path: "/insights", icon: BarChart3 },
      { label: "History", path: "/history", icon: History },
      // Pipeline & Leads
      { label: "Pipeline", path: "/pipeline", icon: Kanban },
      { label: "Leads", path: "/leads", icon: UserSearch },
      { label: "ICP Builder", path: "/icp", icon: Target },
      // Outreach
      { label: "Sequences", path: "/sequences", icon: Mail },
      { label: "LinkedIn", path: "/linkedin", icon: Users },
      { label: "Signals", path: "/signals", icon: Signal },
    ],
  },
  content: {
    id: "content",
    name: "AI Content Studio",
    tagline: "Create, schedule, and analyze content at scale",
    domain: "content.usevalence.ai",
    basePath: "/niche/content",
    icon: PenTool,
    emoji: "✍️",
    accentColor: "hsl(38, 92%, 50%)",
    accentHsl: "38 92% 50%",
    requiredIntegrations: ["twitter-x"],
    optionalIntegrations: ["instagram", "notion", "google-analytics", "mailchimp", "activecampaign"],
    sidebarItems: [
      // AI-first
      { label: "Home", path: "", icon: LayoutDashboard },
      { label: "Insights", path: "/insights", icon: BarChart3 },
      { label: "History", path: "/history", icon: History },
      // Create
      { label: "Compose", path: "/compose", icon: PenTool },
      { label: "Blog", path: "/blog", icon: FileText },
      { label: "Repurpose", path: "/repurpose", icon: Recycle },
      // Plan & Optimize
      { label: "Calendar", path: "/calendar", icon: Calendar },
      { label: "SEO", path: "/seo", icon: Search },
      { label: "Hashtags", path: "/hashtags", icon: Search },
      { label: "Brand Voice", path: "/brand-voice", icon: Palette },
      { label: "Flywheel", path: "/flywheel", icon: RotateCcw },
    ],
  },
  "brand-monitor": {
    id: "brand-monitor",
    name: "AI Brand Monitor",
    tagline: "Track mentions, sentiment, and brand health",
    domain: "brand.usevalence.ai",
    basePath: "/niche/brand-monitor",
    icon: Eye,
    emoji: "👁️",
    accentColor: "hsl(330, 81%, 60%)",
    accentHsl: "330 81% 60%",
    requiredIntegrations: ["twitter-x"],
    optionalIntegrations: ["slack", "notion", "google-alerts"],
    sidebarItems: [
      { label: "Home", path: "", icon: LayoutDashboard },
      { label: "Mentions", path: "/mentions", icon: MessageSquare },
      { label: "Sentiment", path: "/sentiment", icon: TrendingUp },
      { label: "Alerts", path: "/alerts", icon: Bell },
      { label: "Sources", path: "/sources", icon: Globe },
      { label: "Reports", path: "/reports", icon: BarChart3 },
      { label: "History", path: "/history", icon: History },
    ],
  },
};

export const NICHE_LIST = Object.values(NICHE_REGISTRY);

export function getNicheConfig(id: string): NicheConfig | undefined {
  return NICHE_REGISTRY[id];
}
