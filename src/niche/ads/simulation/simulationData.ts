/**
 * Simulation Data — MAISON DTC Fashion & Lifestyle Brand
 * Realistic dummy data for AI Ad Manager simulate mode.
 * Every page reads from this when simulation is active.
 */

import type { CampaignData, AggregateStats } from "../hooks/useCampaignData";

// ──────────────────────────────────────────────
// CAMPAIGNS (10)
// ──────────────────────────────────────────────

export const SIM_CAMPAIGNS: CampaignData[] = [
  { id: "g-10001", name: "Summer Sale 2026 — Search", platform: "google", status: "active", spend: 4250, impressions: 142000, clicks: 5680, conversions: 284, ctr: 4.0, roas: 3.2 },
  { id: "i-20001", name: "The Summer Edit — Collection Launch", platform: "instagram", status: "active", spend: 3600, impressions: 480000, clicks: 14400, conversions: 216, ctr: 3.0, roas: 2.6 },
  { id: "f-20002", name: "Retargeting — Cart Abandoners", platform: "facebook", status: "active", spend: 1850, impressions: 89000, clicks: 5340, conversions: 267, ctr: 6.0, roas: 5.1 },
  { id: "g-10002", name: "Brand Awareness — Display", platform: "google", status: "active", spend: 2100, impressions: 310000, clicks: 6200, conversions: 62, ctr: 2.0, roas: 1.8 },
  { id: "f-20003", name: "Lookalike — Top Purchasers", platform: "facebook", status: "active", spend: 2800, impressions: 175000, clicks: 8750, conversions: 350, ctr: 5.0, roas: 4.2 },
  { id: "g-10003", name: "Dynamic Remarketing — Product Catalog", platform: "google", status: "active", spend: 1450, impressions: 95000, clicks: 4750, conversions: 380, ctr: 5.0, roas: 6.2 },
  { id: "i-20004", name: "Gen-Z Awareness — Reels", platform: "instagram", status: "active", spend: 920, impressions: 520000, clicks: 10400, conversions: 52, ctr: 2.0, roas: 1.3 },
  { id: "f-20005", name: "Spring Collection Preview", platform: "facebook", status: "draft", spend: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, roas: 0 },
  { id: "g-10004", name: "Holiday Pre-Sale", platform: "google", status: "paused", spend: 950, impressions: 31000, clicks: 930, conversions: 28, ctr: 3.0, roas: 1.5 },
  { id: "g-10005", name: "Accessories — Shopping", platform: "google", status: "active", spend: 1680, impressions: 68000, clicks: 4080, conversions: 204, ctr: 6.0, roas: 3.8 },
];

export const SIM_STATS: AggregateStats = {
  totalSpend: 19600,
  totalSpendChange: "+14.1%",
  totalSpendUp: true,
  averageRoas: 3.4,
  averageRoasChange: "+0.5x",
  averageRoasUp: true,
  totalImpressions: 1910000,
  totalImpressionsChange: "+22.3%",
  totalImpressionsUp: true,
  averageCtr: 4.1,
  averageCtrChange: "+0.4%",
  averageCtrUp: true,
};

// ──────────────────────────────────────────────
// AD GROUPS (8)
// ──────────────────────────────────────────────

export interface SimAdGroup {
  id: string;
  name: string;
  campaignName: string;
  platform: string;
  status: string;
  cpcBid: number;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
}

export const SIM_AD_GROUPS: SimAdGroup[] = [
  { id: "ag-1", name: "Branded Terms", campaignName: "Summer Sale 2026 — Search", platform: "google", status: "ENABLED", cpcBid: 1.20, impressions: 52000, clicks: 2600, cost: 1560, conversions: 130 },
  { id: "ag-2", name: "Generic — Dresses", campaignName: "Summer Sale 2026 — Search", platform: "google", status: "ENABLED", cpcBid: 1.85, impressions: 48000, clicks: 1920, cost: 1440, conversions: 96 },
  { id: "ag-3", name: "Generic — Shoes", campaignName: "Summer Sale 2026 — Search", platform: "google", status: "ENABLED", cpcBid: 2.10, impressions: 42000, clicks: 1160, cost: 1250, conversions: 58 },
  { id: "ag-4", name: "Accessories", campaignName: "Accessories — Shopping", platform: "google", status: "ENABLED", cpcBid: 1.40, impressions: 68000, clicks: 4080, cost: 1680, conversions: 204 },
  { id: "ag-5", name: "Competitor — Zara/H&M/Reformation", campaignName: "Summer Sale 2026 — Search", platform: "google", status: "ENABLED", cpcBid: 2.90, impressions: 18000, clicks: 1080, cost: 720, conversions: 43 },
  { id: "ag-6", name: "Seasonal — Summer", campaignName: "The Summer Edit — Collection Launch", platform: "instagram", status: "ENABLED", cpcBid: 0.65, impressions: 240000, clicks: 7200, cost: 1800, conversions: 108 },
  { id: "ag-7", name: "Remarketing — Viewed Product", campaignName: "Dynamic Remarketing — Product Catalog", platform: "google", status: "ENABLED", cpcBid: 0.80, impressions: 60000, clicks: 3000, cost: 900, conversions: 240 },
  { id: "ag-8", name: "Remarketing — Cart Abandoners", campaignName: "Dynamic Remarketing — Product Catalog", platform: "google", status: "ENABLED", cpcBid: 1.10, impressions: 35000, clicks: 1750, cost: 550, conversions: 140 },
];

// ──────────────────────────────────────────────
// SEARCH TERMS (15)
// ──────────────────────────────────────────────

export interface SimSearchTerm {
  id: string;
  searchTerm: string;
  campaignName: string;
  adGroupName: string;
  matchType: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
}

export const SIM_SEARCH_TERMS: SimSearchTerm[] = [
  { id: "st-1", searchTerm: "summer dresses on sale", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Dresses", matchType: "BROAD", impressions: 18500, clicks: 1110, cost: 1332, conversions: 56, ctr: 6.0 },
  { id: "st-2", searchTerm: "linen clothing women", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Dresses", matchType: "PHRASE", impressions: 12400, clicks: 868, cost: 1042, conversions: 43, ctr: 7.0 },
  { id: "st-3", searchTerm: "white sneakers women", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Shoes", matchType: "EXACT", impressions: 9200, clicks: 552, cost: 662, conversions: 28, ctr: 6.0 },
  { id: "st-4", searchTerm: "zara summer dress alternative", campaignName: "Summer Sale 2026 — Search", adGroupName: "Competitor — Zara/H&M/Reformation", matchType: "BROAD", impressions: 8900, clicks: 534, cost: 854, conversions: 21, ctr: 6.0 },
  { id: "st-5", searchTerm: "sustainable fashion brands", campaignName: "Brand Awareness — Display", adGroupName: "Branded Terms", matchType: "PHRASE", impressions: 14200, clicks: 426, cost: 320, conversions: 13, ctr: 3.0 },
  { id: "st-6", searchTerm: "running shoes sale free shipping", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Shoes", matchType: "BROAD", impressions: 22000, clicks: 880, cost: 704, conversions: 35, ctr: 4.0 },
  { id: "st-7", searchTerm: "leather tote bag", campaignName: "Accessories — Shopping", adGroupName: "Accessories", matchType: "PHRASE", impressions: 11200, clicks: 672, cost: 538, conversions: 34, ctr: 6.0 },
  { id: "st-8", searchTerm: "reformation dress dupe", campaignName: "Summer Sale 2026 — Search", adGroupName: "Competitor — Zara/H&M/Reformation", matchType: "BROAD", impressions: 6800, clicks: 408, cost: 490, conversions: 16, ctr: 6.0 },
  { id: "st-9", searchTerm: "gold jewelry minimalist", campaignName: "Accessories — Shopping", adGroupName: "Accessories", matchType: "BROAD", impressions: 9200, clicks: 368, cost: 294, conversions: 15, ctr: 4.0 },
  { id: "st-10", searchTerm: "wedding guest dress summer", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Dresses", matchType: "PHRASE", impressions: 15600, clicks: 936, cost: 749, conversions: 37, ctr: 6.0 },
  { id: "st-11", searchTerm: "silk camisole outfit", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Dresses", matchType: "BROAD", impressions: 7800, clicks: 312, cost: 250, conversions: 12, ctr: 4.0 },
  { id: "st-12", searchTerm: "h&m clothing quality better alternative", campaignName: "Summer Sale 2026 — Search", adGroupName: "Competitor — Zara/H&M/Reformation", matchType: "BROAD", impressions: 4200, clicks: 252, cost: 378, conversions: 10, ctr: 6.0 },
  { id: "st-13", searchTerm: "summer outfit ideas 2026", campaignName: "The Summer Edit — Collection Launch", adGroupName: "Seasonal — Summer", matchType: "BROAD", impressions: 19400, clicks: 776, cost: 504, conversions: 23, ctr: 4.0 },
  { id: "st-14", searchTerm: "maison clothing reviews", campaignName: "Summer Sale 2026 — Search", adGroupName: "Branded Terms", matchType: "EXACT", impressions: 5400, clicks: 432, cost: 302, conversions: 26, ctr: 8.0 },
  { id: "st-15", searchTerm: "designer handbag affordable", campaignName: "Accessories — Shopping", adGroupName: "Accessories", matchType: "BROAD", impressions: 8600, clicks: 430, cost: 344, conversions: 17, ctr: 5.0 },
];

// ──────────────────────────────────────────────
// KEYWORDS (12)
// ──────────────────────────────────────────────

export interface SimKeyword {
  id: string;
  keyword: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  adGroupName: string;
  qualityScore: number;
  avgCpc: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: string;
}

export const SIM_KEYWORDS: SimKeyword[] = [
  { id: "kw-1", keyword: "summer dresses", matchType: "EXACT", adGroupName: "Generic — Dresses", qualityScore: 8, avgCpc: 1.20, impressions: 18500, clicks: 1480, conversions: 74, status: "ENABLED" },
  { id: "kw-2", keyword: "linen clothing women", matchType: "PHRASE", adGroupName: "Generic — Dresses", qualityScore: 7, avgCpc: 1.45, impressions: 12400, clicks: 868, conversions: 43, status: "ENABLED" },
  { id: "kw-3", keyword: "sustainable fashion", matchType: "BROAD", adGroupName: "Branded Terms", qualityScore: 6, avgCpc: 0.95, impressions: 14200, clicks: 426, conversions: 13, status: "ENABLED" },
  { id: "kw-4", keyword: "running shoes sale", matchType: "PHRASE", adGroupName: "Generic — Shoes", qualityScore: 7, avgCpc: 2.10, impressions: 22000, clicks: 880, conversions: 35, status: "ENABLED" },
  { id: "kw-5", keyword: "leather tote bag", matchType: "EXACT", adGroupName: "Accessories", qualityScore: 9, avgCpc: 1.40, impressions: 11200, clicks: 672, conversions: 34, status: "ENABLED" },
  { id: "kw-6", keyword: "wedding guest dress", matchType: "PHRASE", adGroupName: "Generic — Dresses", qualityScore: 5, avgCpc: 1.85, impressions: 15600, clicks: 936, conversions: 37, status: "ENABLED" },
  { id: "kw-7", keyword: "white sneakers women", matchType: "EXACT", adGroupName: "Generic — Shoes", qualityScore: 8, avgCpc: 1.80, impressions: 9200, clicks: 552, conversions: 28, status: "ENABLED" },
  { id: "kw-8", keyword: "gold jewelry minimalist", matchType: "BROAD", adGroupName: "Accessories", qualityScore: 6, avgCpc: 0.85, impressions: 9200, clicks: 368, conversions: 15, status: "ENABLED" },
  { id: "kw-9", keyword: "silk camisole", matchType: "PHRASE", adGroupName: "Generic — Dresses", qualityScore: 4, avgCpc: 0.95, impressions: 7800, clicks: 312, conversions: 12, status: "ENABLED" },
  { id: "kw-10", keyword: "summer outfit ideas", matchType: "BROAD", adGroupName: "Seasonal — Summer", qualityScore: 5, avgCpc: 0.65, impressions: 19400, clicks: 776, conversions: 23, status: "ENABLED" },
  { id: "kw-11", keyword: "maison clothing", matchType: "EXACT", adGroupName: "Branded Terms", qualityScore: 10, avgCpc: 0.80, impressions: 5400, clicks: 432, conversions: 26, status: "ENABLED" },
  { id: "kw-12", keyword: "designer handbag affordable", matchType: "PHRASE", adGroupName: "Accessories", qualityScore: 6, avgCpc: 1.10, impressions: 8600, clicks: 430, conversions: 17, status: "ENABLED" },
];

// ──────────────────────────────────────────────
// AUDIENCES (6)
// ──────────────────────────────────────────────

export interface SimAudience {
  id: string;
  name: string;
  size: number;
  platform: string;
  type: string;
  targeting: string[];
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
}

export const SIM_AUDIENCES: SimAudience[] = [
  { id: "aud-1", name: "Fashion-Forward Women 25-44", size: 4800000, platform: "facebook", type: "Interest", targeting: ["Women's Fashion", "Age 25-44", "Online Shoppers", "Style Influencers"], impressions: 210000, clicks: 10500, conversions: 420, ctr: 5.0 },
  { id: "aud-2", name: "Luxury Lifestyle Shoppers", size: 2200000, platform: "google", type: "In-Market", targeting: ["Luxury Fashion", "Premium Brands", "High Household Income"], impressions: 95000, clicks: 5700, conversions: 285, ctr: 6.0 },
  { id: "aud-3", name: "Sustainable Fashion Enthusiasts", size: 1600000, platform: "facebook", type: "Interest", targeting: ["Eco-Friendly", "Sustainable Brands", "Conscious Consumer", "Organic Materials"], impressions: 72000, clicks: 3600, conversions: 144, ctr: 5.0 },
  { id: "aud-4", name: "Cart Abandoners — Last 14 Days", size: 38000, platform: "google", type: "Remarketing", targeting: ["Cart Value > $75", "Last 14 days", "No purchase"], impressions: 28000, clicks: 1960, conversions: 392, ctr: 7.0 },
  { id: "aud-5", name: "Lookalike — Top 1% Purchasers", size: 1800000, platform: "facebook", type: "Lookalike", targeting: ["Source: Top Purchasers", "1% Similarity", "US + UK + Canada + Australia"], impressions: 175000, clicks: 8750, conversions: 350, ctr: 5.0 },
  { id: "aud-6", name: "Instagram Engaged — Last 30 Days", size: 620000, platform: "instagram", type: "Custom", targeting: ["IG Profile Visitors", "Story Interactions", "Saved Posts", "Last 30 Days"], impressions: 145000, clicks: 5800, conversions: 174, ctr: 4.0 },
];

// ──────────────────────────────────────────────
// A/B TESTS (4)
// ──────────────────────────────────────────────

export interface SimABTest {
  id: string;
  name: string;
  status: "running" | "completed" | "draft";
  startDate: string;
  endDate?: string;
  variants: { name: string; impressions: number; clicks: number; conversions: number; ctr: number; isWinner?: boolean }[];
  confidence: number;
  campaignName: string;
}

export const SIM_AB_TESTS: SimABTest[] = [
  {
    id: "ab-1", name: "Headline: Sale % vs New Arrivals Messaging", status: "running", startDate: "2026-03-10", campaignName: "Summer Sale 2026 — Search", confidence: 87,
    variants: [
      { name: "Sale-Led: 'Up to 50% Off Summer Styles'", impressions: 28000, clicks: 1680, conversions: 84, ctr: 6.0 },
      { name: "New Arrivals: 'Just Dropped — The Summer Edit'", impressions: 27500, clicks: 1375, conversions: 55, ctr: 5.0 },
    ],
  },
  {
    id: "ab-2", name: "CTA: Shop Now vs Explore Collection", status: "completed", startDate: "2026-02-15", endDate: "2026-03-01", campaignName: "The Summer Edit — Collection Launch", confidence: 94,
    variants: [
      { name: "'Shop Now'", impressions: 62000, clicks: 3100, conversions: 155, ctr: 5.0, isWinner: true },
      { name: "'Explore Collection'", impressions: 61000, clicks: 2440, conversions: 98, ctr: 4.0 },
    ],
  },
  {
    id: "ab-3", name: "Creative: Lifestyle vs Product-Only Photography", status: "running", startDate: "2026-03-15", campaignName: "Retargeting — Cart Abandoners", confidence: 72,
    variants: [
      { name: "Lifestyle — Model wearing outfit in setting", impressions: 15000, clicks: 1050, conversions: 63, ctr: 7.0 },
      { name: "Product-Only — Clean flat-lay on white", impressions: 14800, clicks: 1184, conversions: 71, ctr: 8.0 },
      { name: "Hybrid — Product with lifestyle background", impressions: 15200, clicks: 912, conversions: 46, ctr: 6.0 },
    ],
  },
  {
    id: "ab-4", name: "Audience: Interest vs Lookalike Targeting", status: "draft", startDate: "2026-03-25", campaignName: "Lookalike — Top Purchasers", confidence: 0,
    variants: [
      { name: "Interest-based (Fashion + Lifestyle)", impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
      { name: "1% Lookalike of Top Purchasers", impressions: 0, clicks: 0, conversions: 0, ctr: 0 },
    ],
  },
];

// ──────────────────────────────────────────────
// AD FATIGUE (8)
// ──────────────────────────────────────────────

export interface SimFatigueCreative {
  id: string;
  headline: string;
  platform: string;
  campaignName: string;
  fatigueScore: number; // 0-100
  frequency: number;
  ctrCurrent: number;
  ctrPeak: number;
  daysRunning: number;
  status: "fresh" | "aging" | "fatigued";
}

export const SIM_FATIGUE_CREATIVES: SimFatigueCreative[] = [
  { id: "fc-1", headline: "MAISON Summer Sale — Up to 50% Off", platform: "google", campaignName: "Summer Sale 2026 — Search", fatigueScore: 15, frequency: 1.8, ctrCurrent: 5.8, ctrPeak: 6.2, daysRunning: 12, status: "fresh" },
  { id: "fc-2", headline: "Free Shipping on All Orders Over $75", platform: "google", campaignName: "Summer Sale 2026 — Search", fatigueScore: 42, frequency: 3.2, ctrCurrent: 3.9, ctrPeak: 5.8, daysRunning: 28, status: "aging" },
  { id: "fc-3", headline: "The Summer Edit — New Arrivals Just Dropped", platform: "instagram", campaignName: "The Summer Edit — Collection Launch", fatigueScore: 78, frequency: 5.1, ctrCurrent: 1.8, ctrPeak: 4.5, daysRunning: 45, status: "fatigued" },
  { id: "fc-4", headline: "Handcrafted Gold Jewelry — Starting at $48", platform: "google", campaignName: "Accessories — Shopping", fatigueScore: 22, frequency: 2.1, ctrCurrent: 7.2, ctrPeak: 8.0, daysRunning: 14, status: "fresh" },
  { id: "fc-5", headline: "Styles You'll Love — Curated Just for You", platform: "facebook", campaignName: "Lookalike — Top Purchasers", fatigueScore: 65, frequency: 4.3, ctrCurrent: 2.4, ctrPeak: 5.2, daysRunning: 38, status: "fatigued" },
  { id: "fc-6", headline: "Still Thinking? Your Cart Items Are Going Fast", platform: "google", campaignName: "Dynamic Remarketing — Product Catalog", fatigueScore: 35, frequency: 2.8, ctrCurrent: 4.5, ctrPeak: 5.6, daysRunning: 21, status: "aging" },
  { id: "fc-7", headline: "Better Than Zara. Better Price. Better Quality.", platform: "google", campaignName: "Summer Sale 2026 — Search", fatigueScore: 55, frequency: 3.8, ctrCurrent: 3.1, ctrPeak: 5.9, daysRunning: 32, status: "aging" },
  { id: "fc-8", headline: "Forgot Something? Complete Your MAISON Order", platform: "facebook", campaignName: "Retargeting — Cart Abandoners", fatigueScore: 88, frequency: 6.2, ctrCurrent: 1.2, ctrPeak: 5.0, daysRunning: 55, status: "fatigued" },
];

// ──────────────────────────────────────────────
// BUDGETS (6)
// ──────────────────────────────────────────────

export interface SimBudget {
  id: string;
  name: string;
  campaignName: string;
  dailyBudget: number;
  spent: number;
  utilization: number; // percentage
  platform: string;
  status: string;
}

export const SIM_BUDGETS: SimBudget[] = [
  { id: "b-1", name: "Summer Sale Budget", campaignName: "Summer Sale 2026 — Search", dailyBudget: 200, spent: 186, utilization: 93, platform: "google", status: "active" },
  { id: "b-2", name: "Collection Launch Budget", campaignName: "The Summer Edit — Collection Launch", dailyBudget: 170, spent: 168, utilization: 99, platform: "instagram", status: "active" },
  { id: "b-3", name: "Retargeting Budget", campaignName: "Retargeting — Cart Abandoners", dailyBudget: 75, spent: 82, utilization: 109, platform: "facebook", status: "active" },
  { id: "b-4", name: "Brand Awareness Budget", campaignName: "Brand Awareness — Display", dailyBudget: 100, spent: 92, utilization: 92, platform: "google", status: "active" },
  { id: "b-5", name: "Remarketing Budget", campaignName: "Dynamic Remarketing — Product Catalog", dailyBudget: 60, spent: 52, utilization: 87, platform: "google", status: "active" },
  { id: "b-6", name: "Accessories Budget", campaignName: "Accessories — Shopping", dailyBudget: 80, spent: 74, utilization: 93, platform: "google", status: "active" },
];

// ──────────────────────────────────────────────
// ATTRIBUTION (7 channels)
// ──────────────────────────────────────────────

export interface SimAttribution {
  channel: string;
  conversions: number;
  revenue: number;
  cpa: number;
  roas: number;
  assistedConversions: number;
  touchpoints: number;
}

export const SIM_ATTRIBUTION: SimAttribution[] = [
  { channel: "Paid Search", conversions: 480, revenue: 52800, cpa: 11.80, roas: 4.2, assistedConversions: 210, touchpoints: 1350 },
  { channel: "Organic Search", conversions: 360, revenue: 34200, cpa: 0, roas: 0, assistedConversions: 280, touchpoints: 980 },
  { channel: "Direct", conversions: 220, revenue: 24200, cpa: 0, roas: 0, assistedConversions: 150, touchpoints: 620 },
  { channel: "Paid Social", conversions: 410, revenue: 38950, cpa: 16.40, roas: 3.5, assistedConversions: 340, touchpoints: 1280 },
  { channel: "Display", conversions: 85, revenue: 6800, cpa: 24.70, roas: 1.8, assistedConversions: 290, touchpoints: 2100 },
  { channel: "Email", conversions: 280, revenue: 30800, cpa: 1.80, roas: 14.2, assistedConversions: 220, touchpoints: 560 },
  { channel: "Referral", conversions: 95, revenue: 9025, cpa: 0, roas: 0, assistedConversions: 110, touchpoints: 240 },
];

// ──────────────────────────────────────────────
// DEMOGRAPHICS
// ──────────────────────────────────────────────

export interface SimDemographic {
  label: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
}

export const SIM_DEVICES: SimDemographic[] = [
  { label: "Mobile", impressions: 520000, clicks: 20800, cost: 10400, conversions: 624, ctr: 4.0 },
  { label: "Desktop", impressions: 310000, clicks: 15500, cost: 7750, conversions: 620, ctr: 5.0 },
  { label: "Tablet", impressions: 62000, clicks: 1860, cost: 930, conversions: 56, ctr: 3.0 },
];

export const SIM_AGE_DATA: SimDemographic[] = [
  { label: "18-24", impressions: 198000, clicks: 7920, cost: 3960, conversions: 158, ctr: 4.0 },
  { label: "25-34", impressions: 340000, clicks: 17000, cost: 8500, conversions: 680, ctr: 5.0 },
  { label: "35-44", impressions: 215000, clicks: 10750, cost: 5375, conversions: 430, ctr: 5.0 },
  { label: "45-54", impressions: 98000, clicks: 3920, cost: 1960, conversions: 118, ctr: 4.0 },
  { label: "55-64", impressions: 32000, clicks: 960, cost: 480, conversions: 29, ctr: 3.0 },
  { label: "65+", impressions: 9000, clicks: 180, cost: 90, conversions: 5, ctr: 2.0 },
];

export const SIM_GENDER_DATA: SimDemographic[] = [
  { label: "Female", impressions: 535000, clicks: 26750, cost: 12038, conversions: 803, ctr: 5.0 },
  { label: "Male", impressions: 326000, clicks: 13040, cost: 5868, conversions: 392, ctr: 4.0 },
  { label: "Unknown", impressions: 31000, clicks: 930, cost: 419, conversions: 25, ctr: 3.0 },
];

export const SIM_LOCATIONS: SimDemographic[] = [
  { label: "United States", impressions: 480000, clicks: 24000, cost: 12000, conversions: 720, ctr: 5.0 },
  { label: "United Kingdom", impressions: 145000, clicks: 5800, cost: 2900, conversions: 232, ctr: 4.0 },
  { label: "Canada", impressions: 112000, clicks: 4480, cost: 2240, conversions: 134, ctr: 4.0 },
  { label: "Australia", impressions: 98000, clicks: 3920, cost: 1960, conversions: 118, ctr: 4.0 },
  { label: "Germany", impressions: 42000, clicks: 1260, cost: 630, conversions: 25, ctr: 3.0 },
  { label: "France", impressions: 15000, clicks: 450, cost: 225, conversions: 9, ctr: 3.0 },
];

// ──────────────────────────────────────────────
// CONVERSION ACTIONS (5)
// ──────────────────────────────────────────────

export interface SimConversionAction {
  id: string;
  name: string;
  category: string;
  status: string;
  source: string;
  conversions: number;
  value: number;
  conversionRate: number;
}

export const SIM_CONVERSION_ACTIONS: SimConversionAction[] = [
  { id: "cv-1", name: "Purchase", category: "Sales", status: "active", source: "Google Analytics 4", conversions: 1420, value: 156200, conversionRate: 2.8 },
  { id: "cv-2", name: "Add to Cart", category: "Engagement", status: "active", source: "Google Tag Manager", conversions: 5680, value: 0, conversionRate: 11.2 },
  { id: "cv-3", name: "Email Sign-Up", category: "Lead", status: "active", source: "Website Tag", conversions: 3200, value: 16000, conversionRate: 6.3 },
  { id: "cv-4", name: "Begin Checkout", category: "Engagement", status: "active", source: "Google Analytics 4", conversions: 2840, value: 0, conversionRate: 5.6 },
  { id: "cv-5", name: "View Collection Page", category: "Engagement", status: "active", source: "Google Analytics 4", conversions: 12400, value: 0, conversionRate: 24.5 },
];

// ──────────────────────────────────────────────
// AUTOMATION RULES (4)
// ──────────────────────────────────────────────

export interface SimAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  action: string;
  lastTriggered?: string;
  timesTriggered: number;
  affectedCampaigns: number;
}

export const SIM_AUTOMATION_RULES: SimAutomationRule[] = [
  { id: "rule-1", name: "Auto-Pause High CPA Campaigns", description: "Pauses campaigns when CPA exceeds 2x target for 3 consecutive days", enabled: true, trigger: "CPA > $28 for 3 days", action: "Pause campaign + notify", lastTriggered: "2 hours ago", timesTriggered: 5, affectedCampaigns: 2 },
  { id: "rule-2", name: "Scale Winners Automatically", description: "Increases budget 20% for campaigns with ROAS > 4x sustained over 7 days", enabled: true, trigger: "ROAS > 4.0x for 7 days", action: "Increase budget 20%", lastTriggered: "1 day ago", timesTriggered: 3, affectedCampaigns: 2 },
  { id: "rule-3", name: "Budget Pacing Alert", description: "Alerts when daily spend exceeds 110% of budget", enabled: true, trigger: "Spend > 110% daily budget", action: "Slack alert + log", lastTriggered: "6 hours ago", timesTriggered: 9, affectedCampaigns: 3 },
  { id: "rule-4", name: "Weekend Bid Boost — Fashion", description: "Increases bids 15% on Sat-Sun when fashion browsing peaks", enabled: true, trigger: "Day = Saturday or Sunday", action: "Increase bid modifier 15%", lastTriggered: "2 days ago", timesTriggered: 12, affectedCampaigns: 6 },
];

// ──────────────────────────────────────────────
// RECOMMENDATIONS (8)
// ──────────────────────────────────────────────

export interface SimRecommendation {
  id: string;
  type: "keyword" | "budget" | "bid" | "ad" | "extension";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  estimatedImpact: string;
  campaignName: string;
  applied: boolean;
}

export const SIM_RECOMMENDATIONS: SimRecommendation[] = [
  { id: "rec-1", type: "keyword", title: "Add 'linen dress summer' as exact match", description: "This search term has 3,800 monthly searches and strong purchase intent. Avg CPC is $1.45 with low competition.", impact: "high", estimatedImpact: "+42 conversions/mo", campaignName: "Summer Sale 2026 — Search", applied: false },
  { id: "rec-2", type: "budget", title: "Increase remarketing budget — 6.2x ROAS", description: "Dynamic Remarketing — Product Catalog has 6.2x ROAS but is limited by budget (87% utilization). Increasing to $84/day could capture $2,400 more revenue.", impact: "high", estimatedImpact: "+$2,400 revenue/mo", campaignName: "Dynamic Remarketing — Product Catalog", applied: false },
  { id: "rec-3", type: "ad", title: "Refresh retargeting creative (frequency 6.2)", description: "Cart abandoner creative has reached frequency 6.2 with CTR dropping from 5.0% to 1.2%. Fresh creative variants needed to restore performance.", impact: "high", estimatedImpact: "+3.5% CTR recovery", campaignName: "Retargeting — Cart Abandoners", applied: false },
  { id: "rec-4", type: "extension", title: "Add sitelink extensions: New Arrivals, Sale, Sustainability", description: "3 search campaigns are missing sitelinks. Adding 'New Arrivals', 'Sale Up to 50%', 'Our Sustainability Promise', and 'Free Returns' could lift CTR 10-18%.", impact: "medium", estimatedImpact: "+14% CTR", campaignName: "Multiple campaigns", applied: false },
  { id: "rec-5", type: "keyword", title: "Add negative keyword: 'free' and 'diy'", description: "Search term report shows 1,400 impressions for 'free sewing patterns' and 'diy summer dress' with 0 conversions. Blocking saves $280/mo.", impact: "medium", estimatedImpact: "-$280 wasted/mo", campaignName: "Summer Sale 2026 — Search", applied: false },
  { id: "rec-6", type: "bid", title: "Reduce bid on 'silk camisole' — low QS", description: "Quality Score dropped to 4, CPA is 2.2x target. Reducing bid 25% will improve efficiency without significant volume loss.", impact: "medium", estimatedImpact: "-$150 wasted spend/mo", campaignName: "Summer Sale 2026 — Search", applied: false },
  { id: "rec-7", type: "budget", title: "Reallocate Holiday Pre-Sale budget", description: "This paused campaign still has $950 allocated. Reallocate to high-performing active campaigns like Accessories — Shopping.", impact: "low", estimatedImpact: "Realloc $950 budget", campaignName: "Holiday Pre-Sale", applied: false },
  { id: "rec-8", type: "bid", title: "Increase bid for 'maison clothing' — brand term", description: "Top-performing branded keyword (QS 10, 8% CTR) but losing 35% impression share to budget. Bid increase captures more branded searches.", impact: "high", estimatedImpact: "+35% impression share", campaignName: "Summer Sale 2026 — Search", applied: false },
];

// ──────────────────────────────────────────────
// EXISTING ADS (6)
// ──────────────────────────────────────────────

export interface SimExistingAd {
  id: string;
  campaignName: string;
  adGroupName: string;
  type: string;
  headlines: string[];
  descriptions: string[];
  status: string;
  impressions: number;
  clicks: number;
  ctr: number;
  imageUrl?: string;
}

export const SIM_EXISTING_ADS: SimExistingAd[] = [
  { id: "ad-1", campaignName: "Summer Sale 2026 — Search", adGroupName: "Generic — Dresses", type: "Responsive Search", headlines: ["Summer Sale — Up to 50% Off", "Free Shipping Over $75", "MAISON — Effortless Style"], descriptions: ["Discover summer dresses, linen sets, and resort wear at up to 50% off. Limited time only.", "Premium fabrics, thoughtful design. Shop the MAISON Summer Sale — free returns within 30 days."], status: "ENABLED", impressions: 48000, clicks: 2880, ctr: 6.0, imageUrl: "/simulation/ads/summer-sale.png" },
  { id: "ad-2", campaignName: "Summer Sale 2026 — Search", adGroupName: "Branded Terms", type: "Responsive Search", headlines: ["MAISON — Official Store", "New Arrivals Just Dropped", "Trusted by 25,000+ Women"], descriptions: ["Shop the official MAISON store for exclusive collections and member-only prices.", "Sustainable materials, timeless design. Free returns and exchanges on every order."], status: "ENABLED", impressions: 52000, clicks: 3640, ctr: 7.0 },
  { id: "ad-3", campaignName: "The Summer Edit — Collection Launch", adGroupName: "Seasonal — Summer", type: "Image", headlines: ["The Summer Edit — Now Live", "Sage, Sand & Sun", "New Collection: Effortless Summer"], descriptions: ["Our most anticipated collection of the year. Linen dresses, silk camisoles, and resort-ready pieces.", "Designed for warm days and long evenings. Responsibly made with natural fabrics."], status: "ENABLED", impressions: 240000, clicks: 7200, ctr: 3.0, imageUrl: "/simulation/ads/summer-collection.png" },
  { id: "ad-4", campaignName: "Summer Sale 2026 — Search", adGroupName: "Competitor — Zara/H&M/Reformation", type: "Responsive Search", headlines: ["Better Quality Than Fast Fashion", "Like Reformation, Without the Markup", "MAISON — Premium at Fair Prices"], descriptions: ["Why pay Reformation prices? MAISON delivers the same quality and sustainability at 40% less.", "Tired of fast fashion quality? Discover MAISON — premium fabrics, ethical production, fair prices."], status: "ENABLED", impressions: 18000, clicks: 1080, ctr: 6.0 },
  { id: "ad-5", campaignName: "Retargeting — Cart Abandoners", adGroupName: "Remarketing — Cart Abandoners", type: "Dynamic", headlines: ["Still Thinking About It?", "Your MAISON Cart Is Waiting", "Complete Your Order — 10% Off"], descriptions: ["The pieces you loved are still available. Come back and save 10% with code COMEBACK10.", "Free shipping when you complete your order today. Your items won't last long."], status: "ENABLED", impressions: 28000, clicks: 1680, ctr: 6.0, imageUrl: "/simulation/ads/retargeting.png" },
  { id: "ad-6", campaignName: "Dynamic Remarketing — Product Catalog", adGroupName: "Remarketing — Viewed Product", type: "Dynamic", headlines: ["Still Interested?", "Popular Pick — Selling Fast", "Back in Stock — Shop Now"], descriptions: ["The MAISON piece you viewed is a bestseller. Grab it before it's gone.", "Personalized picks curated for you. Free shipping on orders over $75."], status: "ENABLED", impressions: 60000, clicks: 3000, ctr: 5.0, imageUrl: "/simulation/ads/remarketing-grid.png" },
];

// ──────────────────────────────────────────────
// CREATIVES (for CreativeStudio)
// ──────────────────────────────────────────────

export interface SimCreative {
  id: string;
  platform: string;
  campaignName: string;
  headline: string;
  body: string;
  cta: string;
  impressions: number;
  clicks: number;
  ctr: number;
  status: string;
  imageUrl?: string;
}

export const SIM_CREATIVES: SimCreative[] = [
  { id: "cr-1", platform: "facebook", campaignName: "Retargeting — Cart Abandoners", headline: "Your Cart Misses You", body: "The MAISON pieces you loved are still available — but not for long. Complete your order now and get free shipping + 10% off with code COMEBACK10.", cta: "Shop Now", impressions: 45000, clicks: 3150, ctr: 7.0, status: "active", imageUrl: "/simulation/ads/retargeting.png" },
  { id: "cr-2", platform: "instagram", campaignName: "The Summer Edit — Collection Launch", headline: "The Summer Edit — Now Live", body: "Sage linen, sand silk, and sun-kissed neutrals. Our most anticipated collection is here — responsibly made with natural fabrics for effortless warm-weather style.", cta: "Shop the Edit", impressions: 240000, clicks: 7200, ctr: 3.0, status: "active", imageUrl: "/simulation/ads/summer-collection.png" },
  { id: "cr-3", platform: "facebook", campaignName: "Lookalike — Top Purchasers", headline: "25,000+ Women Trust MAISON", body: "See why fashion-forward women are choosing MAISON for their everyday wardrobe. Premium quality, sustainable materials, and prices that make sense.", cta: "Discover MAISON", impressions: 85000, clicks: 4250, ctr: 5.0, status: "active" },
  { id: "cr-4", platform: "instagram", campaignName: "Gen-Z Awareness — Reels", headline: "MAISON Unboxing", body: "First impressions of the Summer Edit drop. The packaging, the fabrics, the fit — see it all before you buy.", cta: "Watch Now", impressions: 260000, clicks: 7800, ctr: 3.0, status: "active", imageUrl: "/simulation/ads/genz-unboxing.mp4" },
];

// ──────────────────────────────────────────────
// HISTORY TASKS (6)
// ──────────────────────────────────────────────

export interface SimHistoryTask {
  id: string;
  title: string;
  agent: string;
  status: string;
  completedAt: string;
  deliverable: string;
}

export const SIM_HISTORY_TASKS: SimHistoryTask[] = [
  { id: "ht-1", title: "Optimize Summer Sale budget allocation", agent: "Kaze", status: "done", completedAt: "2 hours ago", deliverable: "Recommended reallocating $1,400/mo from Brand Awareness Display to high-ROAS Dynamic Remarketing and Accessories Shopping campaigns." },
  { id: "ht-2", title: "Generate 20 ad copy variants for The Summer Edit", agent: "Ghost", status: "done", completedAt: "5 hours ago", deliverable: "Created 20 headline + description combinations targeting different personas (minimalist, trend-seeker, conscious consumer, wedding guest)." },
  { id: "ht-3", title: "Analyze competitor strategies (Zara, Reformation, Everlane)", agent: "Scout", status: "done", completedAt: "1 day ago", deliverable: "Found 12 high-opportunity keywords competitors bid on that MAISON is missing. Estimated opportunity: +$5,200 revenue/mo. Key gap: 'linen dress summer' and 'sustainable fashion brands'." },
  { id: "ht-4", title: "Refresh fatigued retargeting creatives", agent: "Ghost", status: "done", completedAt: "2 days ago", deliverable: "Replaced 3 fatigued creatives (frequency >5.0) with fresh variants using lifestyle photography. New creatives showing 2.4x higher CTR in first 48 hours." },
  { id: "ht-5", title: "Set up conversion tracking for new collection launch", agent: "Forge", status: "done", completedAt: "3 days ago", deliverable: "Configured GA4 purchase + begin_checkout events, Meta Pixel view_content + purchase events, and Google Ads conversion actions for The Summer Edit collection. All verified firing correctly." },
  { id: "ht-6", title: "A/B test results: lifestyle vs product photography", agent: "Kaze", status: "done", completedAt: "4 days ago", deliverable: "Product-only flat-lay photography outperformed lifestyle shots with 72% confidence. CTR +14%, but lifestyle had +8% higher AOV. Recommending hybrid approach for cart abandoner campaigns." },
];

// ──────────────────────────────────────────────
// EXECUTION STREAM ITEMS (for animated stream)
// ──────────────────────────────────────────────

export interface SimStreamItem {
  type: "thinking" | "api_call" | "decision" | "deliverable" | "research" | "analysis" | "creative_preview" | "launch" | "monitoring" | "optimization";
  agentName: string;
  content: string;
  toolName?: string;
  integrationName?: string;
  status?: "success" | "error" | "calling";
  durationMs?: number;
  delayMs: number;
  // Creative preview fields
  imageUrl?: string;
  headline?: string;
  cta?: string;
  platform?: string;
  // Monitoring fields
  metrics?: { label: string; value: string; change: string; up: boolean }[];
  // Phase label
  phase?: string;
}

export const SIM_STREAM_ITEMS: SimStreamItem[] = [
  // ═══════════════════════════════════════════
  // ACT 1: STRATEGY & RESEARCH (0-12s)
  // ═══════════════════════════════════════════
  { type: "thinking", agentName: "Kaze", content: "Planning MAISON's Summer Sale campaign launch. Analyzing target audience, competitor landscape, and budget allocation strategy for maximum ROAS across Google Ads and Meta platforms...", delayMs: 0, phase: "Strategy & Planning" },
  { type: "api_call", agentName: "Kaze", content: "Fetching existing MAISON campaign data", toolName: "search_campaigns", integrationName: "google-ads", status: "success", durationMs: 240, delayMs: 2500 },
  { type: "decision", agentName: "Kaze", content: "Campaign plan ready. Target: $200/day budget split across Search ($80), Social ($70), and Remarketing ($50). Goal: 3.5x ROAS within 14 days. Assigning Scout for keyword research and Ghost for creative generation.", delayMs: 5000 },

  { type: "thinking", agentName: "Scout", content: "Researching competitor ad strategies for Zara, Reformation, and Everlane. Identifying high-intent fashion keywords MAISON should target...", delayMs: 7500, phase: "Competitor Research" },
  { type: "api_call", agentName: "Scout", content: "Analyzing fashion industry search trends", toolName: "get_search_terms", integrationName: "google-ads", status: "success", durationMs: 320, delayMs: 9500 },
  { type: "research", agentName: "Scout", content: "**Keyword Strategy — 8 high-opportunity targets identified:**\n\n| Keyword | Volume | CPC | Competition |\n|---------|--------|-----|-------------|\n| summer dresses sale | 12,400/mo | $1.20 | Medium |\n| linen dress women | 8,200/mo | $1.45 | Low |\n| sustainable fashion brands | 6,800/mo | $0.95 | Low |\n| wedding guest dress 2026 | 5,400/mo | $1.65 | High |\n| reformation alternative | 3,200/mo | $1.90 | Low |\n| white sneakers women | 9,100/mo | $1.10 | Medium |\n| minimalist gold jewelry | 4,600/mo | $0.85 | Low |\n| silk camisole | 2,800/mo | $1.30 | Low |\n\n**Competitor insight:** Reformation spends ~$8K/mo on branded terms. Zara dominates generic fashion queries. Gap exists in sustainable + luxury positioning.", delayMs: 12000 },

  // ═══════════════════════════════════════════
  // ACT 2: CREATIVE GENERATION (14-28s)
  // ═══════════════════════════════════════════
  { type: "thinking", agentName: "Ghost", content: "Generating MAISON ad creatives across 4 formats: Search ads (headlines + descriptions), Display banners, Instagram Stories, and Retargeting. Using MAISON's brand voice: elegant, sustainable, effortless...", delayMs: 14000, phase: "AI Creative Generation" },

  { type: "creative_preview", agentName: "Ghost", content: "", delayMs: 16500, imageUrl: "/simulation/ads/summer-sale.png", headline: "Summer Sale — Up to 50% Off", cta: "Shop Now →", platform: "Google Display + Facebook" },

  { type: "creative_preview", agentName: "Ghost", content: "", delayMs: 18500, imageUrl: "/simulation/ads/summer-collection.png", headline: "The Summer Edit — New Arrivals", cta: "Shop Collection →", platform: "Instagram Feed + Stories" },

  { type: "creative_preview", agentName: "Ghost", content: "", delayMs: 20500, imageUrl: "/simulation/ads/retargeting.png", headline: "Still Thinking? 10% Off", cta: "Complete Order →", platform: "Facebook + Display" },

  { type: "creative_preview", agentName: "Ghost", content: "", delayMs: 22500, imageUrl: "/simulation/ads/remarketing-grid.png", headline: "Picked For You", cta: "Shop Picks →", platform: "Google Shopping" },

  { type: "creative_preview", agentName: "Ghost", content: "", delayMs: 24500, imageUrl: "/simulation/ads/genz-unboxing.mp4", headline: "UGC Unboxing — Gen-Z Reels", cta: "Shop the Drop →", platform: "Instagram Reels + TikTok" },

  { type: "deliverable", agentName: "Ghost", content: "**5 creatives generated** for MAISON Summer Sale launch:\n• Search campaign hero banner\n• Instagram collection editorial\n• Retargeting cart abandonment\n• Dynamic remarketing product grid\n• UGC unboxing video for Reels/TikTok\n\nAll creatives follow MAISON brand guidelines. Ready for campaign setup.", delayMs: 26500 },

  // ═══════════════════════════════════════════
  // ACT 3: CAMPAIGN LAUNCH (29-38s)
  // ═══════════════════════════════════════════
  { type: "thinking", agentName: "Forge", content: "Setting up campaign structure in Google Ads and Meta Ads Manager. Creating ad groups, uploading creatives, configuring targeting, and setting bid strategies...", delayMs: 27000, phase: "Campaign Launch" },
  { type: "api_call", agentName: "Forge", content: "Creating 'Summer Sale 2026' campaign", toolName: "create_campaign", integrationName: "google-ads", status: "success", durationMs: 890, delayMs: 29000 },
  { type: "api_call", agentName: "Forge", content: "Creating ad groups + uploading keywords", toolName: "create_ad_group", integrationName: "google-ads", status: "success", durationMs: 1240, delayMs: 31000 },
  { type: "api_call", agentName: "Forge", content: "Uploading creatives to Meta Ads Manager", toolName: "create_ad", integrationName: "facebook-ads", status: "success", durationMs: 2100, delayMs: 33000 },

  { type: "launch", agentName: "Forge", content: "**MAISON Summer Sale — Campaign Launched**\n\n| Platform | Campaign | Status | Daily Budget |\n|----------|----------|--------|--------------|\n| Google Ads | Summer Sale 2026 — Search | ✅ Live | $80/day |\n| Google Ads | Dynamic Remarketing — Catalog | ✅ Live | $50/day |\n| Meta Ads | The Summer Edit — Instagram | ✅ Live | $40/day |\n| Meta Ads | Retargeting — Cart Abandoners | ✅ Live | $30/day |\n\n**Total: $200/day · 4 campaigns · 8 ad groups · 12 ads**\nConversion tracking verified. Bid strategy: Target ROAS (3.5x).", delayMs: 35500 },

  // ═══════════════════════════════════════════
  // ACT 4: MONITORING PERIOD (38-48s)
  // ═══════════════════════════════════════════
  { type: "monitoring", agentName: "Kaze", content: "Campaigns are live. Collecting initial performance data...", delayMs: 38000, phase: "Performance Monitoring",
    metrics: [
      { label: "Impressions", value: "12,400", change: "Collecting...", up: true },
      { label: "Clicks", value: "248", change: "2.0% CTR", up: true },
      { label: "Spend", value: "$42.80", change: "21% of daily", up: true },
    ],
  },

  { type: "monitoring", agentName: "Kaze", content: "4 hours in — early signals strong. Instagram creative exceeding benchmarks.", delayMs: 41000,
    metrics: [
      { label: "Impressions", value: "48,200", change: "+289%", up: true },
      { label: "Clicks", value: "1,928", change: "4.0% CTR", up: true },
      { label: "Conversions", value: "38", change: "$12.40 CPA", up: true },
      { label: "Revenue", value: "$3,420", change: "3.8x ROAS", up: true },
    ],
  },

  { type: "monitoring", agentName: "Kaze", content: "24 hours complete. Full day of data collected — ready for optimization.", delayMs: 44000,
    metrics: [
      { label: "Impressions", value: "142,800", change: "+196%", up: true },
      { label: "Clicks", value: "5,712", change: "4.2% CTR", up: true },
      { label: "Conversions", value: "184", change: "$10.80 CPA", up: true },
      { label: "Revenue", value: "$16,560", change: "4.1x ROAS", up: true },
    ],
  },

  // ═══════════════════════════════════════════
  // ACT 5: OPTIMIZATION (46-54s)
  // ═══════════════════════════════════════════
  { type: "analysis", agentName: "Kaze", content: "**24-Hour Performance Analysis:**\n\n• **Summer Sale — Search:** 4.8% CTR, 3.2x ROAS — strong, increase budget\n• **The Summer Edit — Instagram:** 6.1% CTR, 4.5x ROAS — top performer, scale aggressively\n• **Dynamic Remarketing:** 5.2% CTR, 6.8x ROAS — excellent, budget-constrained\n• **Retargeting — Cart Abandoners:** 3.1% CTR, 2.1x ROAS — underperforming, needs creative refresh\n\nOverall: **4.1x ROAS vs 3.5x target — exceeding goal by 17%.**", delayMs: 47000, phase: "AI Optimization" },

  { type: "optimization", agentName: "Kaze", content: "**Auto-Optimizations Applied:**\n\n| Optimization | Campaign | Action | Impact |\n|-------------|----------|--------|--------|\n| ↑ Budget +30% | The Summer Edit — IG | $40 → $52/day | Capture more volume |\n| ↑ Budget +25% | Dynamic Remarketing | $50 → $62/day | Remove constraint |\n| ↓ Bid -15% | Retargeting | CPC $1.80 → $1.53 | Reduce CPA |\n| + Keyword | Summer Sale — Search | 'linen dress summer' | +120 clicks/week |\n| - Negative | Summer Sale — Search | 'free summer dress' | Save $12/day |\n\n**Projected ROAS: 4.6x (+12% improvement).**\nNext optimization in 48 hours.", delayMs: 51000 },
];

// ──────────────────────────────────────────────
// AGGREGATE EXPORT
// ──────────────────────────────────────────────

export const SIMULATION_DATA = {
  campaigns: SIM_CAMPAIGNS,
  stats: SIM_STATS,
  adGroups: SIM_AD_GROUPS,
  searchTerms: SIM_SEARCH_TERMS,
  keywords: SIM_KEYWORDS,
  audiences: SIM_AUDIENCES,
  abTests: SIM_AB_TESTS,
  fatigueCreatives: SIM_FATIGUE_CREATIVES,
  budgets: SIM_BUDGETS,
  attribution: SIM_ATTRIBUTION,
  devices: SIM_DEVICES,
  ageData: SIM_AGE_DATA,
  genderData: SIM_GENDER_DATA,
  locations: SIM_LOCATIONS,
  conversionActions: SIM_CONVERSION_ACTIONS,
  automationRules: SIM_AUTOMATION_RULES,
  recommendations: SIM_RECOMMENDATIONS,
  existingAds: SIM_EXISTING_ADS,
  creatives: SIM_CREATIVES,
  historyTasks: SIM_HISTORY_TASKS,
  streamItems: SIM_STREAM_ITEMS,
};

export type SimulationDataSet = typeof SIMULATION_DATA;
