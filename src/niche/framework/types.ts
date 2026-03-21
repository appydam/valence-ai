import { type LucideIcon } from "lucide-react";

export type NicheId = "ads" | "gtm" | "content";

export interface NicheSidebarItem {
  label: string;
  path: string; // relative to niche basePath
  icon: LucideIcon;
  badge?: string;
}

export interface NicheConfig {
  id: NicheId;
  name: string;
  tagline: string;
  domain: string;
  basePath: string;
  icon: LucideIcon;
  emoji: string;
  accentColor: string;
  accentHsl: string;
  requiredIntegrations: string[];
  optionalIntegrations: string[];
  sidebarItems: NicheSidebarItem[];
}
