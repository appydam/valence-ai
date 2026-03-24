/**
 * Fix iconUrl for blueprints whose simpleicons slugs don't exist.
 * Updates DB iconUrl to match the working inline SVGs in integrationLogos.ts.
 *
 * Run: npx convex run fixBrokenLogoBlueprints --url https://<YOUR_DEPLOYMENT>.convex.cloud
 */

import { mutation } from "./_generated/server";

function svgUrl(content: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(content)}`;
}

const ICON_FIXES: Record<string, string> = {
  "klaviyo": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#000000"/><path fill="#ffffff" d="M20 14h8v14.5l12-14.5h10L36 30l14 20H40L29 33.5 28 35v15h-8V14z"/></svg>`
  ),
  "docusign": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#FFB800"/><rect x="14" y="22" width="36" height="24" rx="3" fill="#fff"/><path fill="none" stroke="#FFB800" stroke-width="2.5" d="M14 25l18 12 18-12"/></svg>`
  ),
  "freshdesk": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#25C16F"/><path fill="#fff" d="M32 14c-9.4 0-17 7.2-17 16 0 5.3 2.6 10 6.6 13v7h4v-4.5c2 .9 4.1 1.5 6.4 1.5 9.4 0 17-7.2 17-16S41.4 14 32 14zm-7 18a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm14 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>`
  ),
  "activecampaign": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#356AE6"/><path fill="#fff" d="M36 12L20 34h12l-4 18 24-22H40l6-18z"/></svg>`
  ),
  "microsoft-teams": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#6264A7"/><rect x="18" y="22" width="28" height="6" rx="3" fill="#fff"/><rect x="29" y="22" width="6" height="20" rx="3" fill="#fff"/><circle cx="46" cy="20" r="6" fill="#A9BCDB"/></svg>`
  ),
  "close": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#7AC142"/><path fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" d="M16 32l12 12 20-20"/></svg>`
  ),
  "copper": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#DF7E1E"/><circle cx="32" cy="24" r="8" fill="none" stroke="#fff" stroke-width="4"/><rect x="29" y="32" width="6" height="18" rx="3" fill="#fff"/></svg>`
  ),
  "lever": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#00B4B4"/><rect x="20" y="20" width="6" height="30" rx="3" fill="#fff"/><rect x="20" y="20" width="24" height="6" rx="3" fill="#fff"/></svg>`
  ),
  "ramp": svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#FF4800"/><path fill="#fff" d="M12 46h40v-6H12v6zm20-8l-14-16h8V14h12v8h8L32 38z"/></svg>`
  ),
};

export default mutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, string> = {};

    for (const [slug, iconUrl] of Object.entries(ICON_FIXES)) {
      const blueprint = await ctx.db
        .query("blueprints")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();

      if (!blueprint) {
        results[slug] = "NOT FOUND";
        continue;
      }

      await ctx.db.patch(blueprint._id, { iconUrl, updatedAt: Date.now() });
      results[slug] = "FIXED";
    }

    return { message: "✅ Logo iconUrls patched", results };
  },
});
