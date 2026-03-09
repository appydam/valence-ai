import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Info } from "lucide-react";

import { tenant } from "@/tenant";

const CONVEX_SITE_URL = tenant.convexSiteUrl;

interface Blueprint {
  slug: string;
  name: string;
  authConfig: string;
}

interface OAuthSetupGuideProps {
  blueprint: Blueprint;
}

export function OAuthSetupGuide({ blueprint }: OAuthSetupGuideProps) {
  const callbackUrl = `${CONVEX_SITE_URL}/api/integrations/oauth/callback`;

  let authConfig: any = {};
  try {
    authConfig = JSON.parse(blueprint.authConfig);
  } catch (e) {
    // Fallback
  }

  // Extract provider from authorize URL
  const authorizeUrl = authConfig.authorizeUrl || "";
  let providerName = blueprint.name;
  let developerConsoleUrl = "";

  if (authorizeUrl.includes("github.com")) {
    providerName = "GitHub";
    developerConsoleUrl = "https://github.com/settings/developers";
  } else if (authorizeUrl.includes("slack.com")) {
    providerName = "Slack";
    developerConsoleUrl = "https://api.slack.com/apps";
  } else if (authorizeUrl.includes("google.com") || authorizeUrl.includes("googleapis.com")) {
    providerName = "Google";
    developerConsoleUrl = "https://console.cloud.google.com/apis/credentials";
  } else if (authorizeUrl.includes("salesforce.com")) {
    providerName = "Salesforce";
    developerConsoleUrl = "https://login.salesforce.com/";
  } else if (authorizeUrl.includes("hubspot.com")) {
    providerName = "HubSpot";
    developerConsoleUrl = "https://developers.hubspot.com/";
  } else if (authorizeUrl.includes("notion.so")) {
    providerName = "Notion";
    developerConsoleUrl = "https://www.notion.so/my-integrations";
  } else if (authorizeUrl.includes("stripe.com")) {
    providerName = "Stripe";
    developerConsoleUrl = "https://dashboard.stripe.com/apikeys";
  } else if (authorizeUrl.includes("atlassian.com") || authorizeUrl.includes("jira.com")) {
    providerName = "Atlassian (Jira/Confluence)";
    developerConsoleUrl = "https://developer.atlassian.com/console/myapps/";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="w-4 h-4" />
          OAuth Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <p className="font-medium">To connect {providerName}, you need to create an OAuth app:</p>

          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>
              Go to the {providerName} developer console
              {developerConsoleUrl && (
                <a
                  href={developerConsoleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 ml-2 text-primary hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
              )}
            </li>
            <li>Create a new OAuth application / integration</li>
            <li>
              Set the <span className="font-medium text-foreground">Redirect URI / Callback URL</span> to:
              <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono break-all">
                {callbackUrl}
              </code>
            </li>
            <li>Copy the Client ID and Client Secret</li>
            <li>Add them to the blueprint's Auth Configuration (Configuration tab)</li>
            {authConfig.scopes && authConfig.scopes.length > 0 && (
              <li>
                Request the following scopes:
                <code className="block mt-1 p-2 bg-muted rounded text-xs font-mono">
                  {authConfig.scopes.join(", ")}
                </code>
              </li>
            )}
          </ol>
        </div>

        <div className="bg-muted p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Note:</strong> OAuth credentials are stored as environment variables
            for security. After creating the app, you'll need to add the client secret to your Convex environment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
