export interface AdPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  blueprintSlug: string;
  formats: string[];
}

export const AD_PLATFORMS: AdPlatform[] = [
  {
    id: "google",
    name: "Google Ads",
    icon: "🔍",
    color: "hsl(217, 89%, 61%)",
    blueprintSlug: "google-ads",
    formats: ["Search", "Display", "Video (YouTube)", "Shopping", "Performance Max"],
  },
  {
    id: "facebook",
    name: "Facebook Ads",
    icon: "📘",
    color: "hsl(220, 46%, 48%)",
    blueprintSlug: "facebook-ads",
    formats: ["Image", "Video", "Carousel", "Collection", "Stories", "Reels"],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: "📸",
    color: "hsl(330, 70%, 55%)",
    blueprintSlug: "instagram",
    formats: ["Feed Image", "Feed Video", "Stories", "Reels", "Carousel"],
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    icon: "🎵",
    color: "hsl(348, 83%, 47%)",
    blueprintSlug: "tiktok",
    formats: ["In-Feed Video", "TopView", "Branded Hashtag", "Spark Ads"],
  },
];

export const CAMPAIGN_OBJECTIVES = [
  { id: "awareness", label: "Brand Awareness", description: "Reach people likely to remember your ads" },
  { id: "traffic", label: "Traffic", description: "Drive visitors to your website or app" },
  { id: "engagement", label: "Engagement", description: "Get more interactions on your posts" },
  { id: "leads", label: "Lead Generation", description: "Collect leads with forms and CTAs" },
  { id: "conversions", label: "Conversions", description: "Drive valuable actions on your website" },
  { id: "sales", label: "Sales", description: "Optimize for purchases and revenue" },
];

export const BUDGET_TYPES = [
  { id: "daily", label: "Daily Budget", description: "Set a maximum spend per day" },
  { id: "lifetime", label: "Lifetime Budget", description: "Set a total budget for the campaign duration" },
];
