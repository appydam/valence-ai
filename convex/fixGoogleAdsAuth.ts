/**
 * Fix Google Ads blueprint — updates authConfig, defaultHeaders, and baseUrl.
 * Run from Convex dashboard: Functions → fixGoogleAdsAuth → Run
 */
import { mutation } from "./_generated/server";

export default mutation({
  args: {},
  handler: async (ctx) => {
    const blueprint = await ctx.db
      .query("blueprints")
      .withIndex("by_slug", (q) => q.eq("slug", "google-ads"))
      .first();

    if (!blueprint) {
      return { message: "Google Ads blueprint not found. Run seedGoogleAdsBlueprint first." };
    }

    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

    if (!clientId || clientId === "YOUR_GOOGLE_ADS_CLIENT_ID") {
      return { message: "GOOGLE_ADS_CLIENT_ID env var not set." };
    }
    if (!developerToken) {
      return { message: "GOOGLE_ADS_DEVELOPER_TOKEN env var not set." };
    }

    const newAuthConfig = JSON.stringify({
      clientId,
      clientSecret: "OAUTH_SECRET_GOOGLE_ADS",
      authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
      tokenUrl: "https://oauth2.googleapis.com/token",
      scopes: ["https://www.googleapis.com/auth/adwords"],
      scopeSeparator: "space",
      extraAuthParams: {
        access_type: "offline",
        prompt: "consent select_account",
      },
      tokenEndpointAuth: "body",
    });

    // developer-token header REQUIRED on every Google Ads API request
    const newDefaultHeaders = JSON.stringify({
      "Accept": "application/json",
      "Content-Type": "application/json",
      "developer-token": developerToken,
    });

    // Update to latest active API version (v19)
    await ctx.db.patch(blueprint._id, {
      authConfig: newAuthConfig,
      defaultHeaders: newDefaultHeaders,
      baseUrl: "https://googleads.googleapis.com/v19",
      updatedAt: Date.now(),
    });

    return {
      message: "✅ Google Ads blueprint fully fixed: client ID, developer-token header, and API v19",
      blueprintId: blueprint._id,
      clientId,
      developerTokenSet: true,
      baseUrl: "https://googleads.googleapis.com/v19",
    };
  },
});
