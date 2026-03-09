import { createRoot } from "react-dom/client";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { tenant } from "./tenant";

// Initialize Sentry for error monitoring (only in production when DSN is set)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "production",
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

const convex = new ConvexReactClient(tenant.convexUrl);

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ClerkProvider publishableKey={tenant.clerkPublishableKey}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <App />
        <Analytics />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </HelmetProvider>
);
