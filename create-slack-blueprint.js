// Script to create a test Slack OAuth2 blueprint
// Run with: node create-slack-blueprint.js

const CONVEX_URL = "https://beloved-squirrel-599.convex.site";

async function createSlackBlueprint() {
  const blueprint = {
    slug: "slack",
    name: "Slack",
    description: "Team communication and collaboration platform. Send messages, create channels, manage users.",
    category: "communication",
    authType: "oauth2",
    authConfig: JSON.stringify({
      clientId: "YOUR_SLACK_CLIENT_ID", // Replace with actual client ID
      clientSecret: "YOUR_SLACK_CLIENT_SECRET", // Replace with actual client secret
      authorizeUrl: "https://slack.com/oauth/v2/authorize",
      tokenUrl: "https://slack.com/api/oauth.v2.access",
      scopes: ["chat:write", "channels:read", "users:read", "im:write"],
    }),
    baseUrl: "https://slack.com/api",
    sourceType: "manual",
    sourceUrl: "https://api.slack.com/methods",
    iconUrl: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png",
    createdBy: "user_39f60iciK4nX4Q0efRxrfyuHqj2",
  };

  try {
    const response = await fetch(`${CONVEX_URL}/api/integrations/blueprints`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(blueprint),
    });

    const result = await response.json();
    console.log("Slack blueprint created:", result);

    // Create a sample tool
    const tool = {
      blueprintId: result.id,
      name: "post_message",
      displayName: "Post Message",
      description: "Post a message to a Slack channel",
      method: "POST",
      path: "/chat.postMessage",
      pathParams: "[]",
      queryParams: "[]",
      bodySchema: JSON.stringify({
        type: "object",
        properties: {
          channel: { type: "string", description: "Channel ID or name" },
          text: { type: "string", description: "Message text" },
        },
        required: ["channel", "text"],
      }),
      aiUsageHint: "Use this to send messages to Slack channels. Provide channel ID or name and message text.",
      exampleArgs: JSON.stringify({ channel: "general", text: "Hello from AI!" }),
      status: "active",
    };

    console.log("\nBlueprint created! Now add tools via the UI or API.");
  } catch (error) {
    console.error("Error creating blueprint:", error.message);
  }
}

createSlackBlueprint();
