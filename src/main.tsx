import { createRoot } from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

// Validate critical frontend env vars on startup
const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL — set it in .env.local");
}
if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY — set it in .env.local");
}

// Initialize Sentry for error monitoring (only in production when DSN is set)
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || "production",
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
    replaysOnErrorSampleRate: 1.0, // 100% of errors get session replays
  });
}

const convex = new ConvexReactClient(convexUrl as string);

createRoot(document.getElementById("root")!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <App />
      <Analytics />
    </ConvexProviderWithClerk>
  </ClerkProvider>
);
