import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading, useMutation } from "convex/react";
import { useUser } from "@clerk/clerk-react";
import { lazy, Suspense, useEffect, useRef } from "react";
import { api } from "../convex/_generated/api";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NicheShell } from "./niche/framework/NicheShell";
import { resolveNiche } from "./niche/framework/nicheResolver";

const AdsApp = lazy(() => import("./niche/ads/AdsApp"));
const GtmApp = lazy(() => import("./niche/gtm/GtmApp"));
const ContentApp = lazy(() => import("./niche/content/ContentApp"));
const BrandMonitorApp = lazy(() => import("./niche/brand-monitor/BrandMonitorApp"));
const OutboundApp = lazy(() => import("./niche/outbound/OutboundApp"));
import Index from "./pages/Index";
import Board from "./pages/Board";
import Missions from "./pages/Missions";
import AgentsPage from "./pages/Agents";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import BlueprintWizard from "./pages/BlueprintWizard";
import BlueprintDetail from "./pages/BlueprintDetail";
import Webhooks from "./pages/Webhooks";
import Monitors from "./pages/Monitors";
import Analytics from "./pages/Analytics";
import MemoryBank from "./pages/MemoryBank";
import AgentMemoryDetail from "./pages/AgentMemoryDetail";
import SoulReview from "./pages/SoulReview";
import MissionReport from "./pages/MissionReport";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Autopilot from "./pages/Autopilot";
import Onboarding from "./pages/Onboarding";
import OperationsHub from "./pages/OperationsHub";
import MorningBrief from "./pages/MorningBrief";
import Docs from "./pages/Docs";
import WarRoom from "./pages/WarRoom";
import FileManager from "./pages/FileManager";

const queryClient = new QueryClient();

/** Wraps auth-dependent routes: shows loading spinner, then resolves to unauth or auth routes */
function AuthRoutes() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <img src="/logo.svg" alt="Valence AI" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Navigate to="/login" replace />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedRoutes />
      </Authenticated>
    </>
  );
}

function AuthenticatedRoutes() {
  const location = useLocation();
  const { user } = useUser();
  const syncUser = useMutation(api.users.getOrCreateUser);
  const synced = useRef(false);

  useEffect(() => {
    if (user && !synced.current) {
      synced.current = true;
      syncUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress ?? "",
        name: user.fullName ?? undefined,
        avatarUrl: user.imageUrl ?? undefined,
      });
    }
  }, [user, syncUser]);

  // Redirect /login to / for authenticated users
  if (location.pathname === "/login") {
    return <Navigate to="/" replace />;
  }

  // Standalone niche mode: subdomain like ads.usevalence.ai renders only the niche
  const standaloneNiche = resolveNiche();
  if (standaloneNiche) {
    const NicheComponent = { ads: AdsApp, gtm: GtmApp, content: ContentApp, "brand-monitor": BrandMonitorApp }[standaloneNiche];
    return (
      <ErrorBoundary>
        <Suspense fallback={<NicheLoadingSpinner />}>
          <NicheShell nicheId={standaloneNiche}>
            <NicheComponent />
          </NicheShell>
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<Index />} />
        <Route path="/autopilot" element={<Autopilot />} />
        <Route path="/board" element={<Board />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/missions/:missionId" element={<MissionReport />} />
        <Route path="/missions/:missionId/warroom" element={<WarRoom />} />
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/integrations/blueprint/new" element={<BlueprintWizard />} />
        <Route path="/integrations/blueprint/:id" element={<BlueprintDetail />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/monitors" element={<Monitors />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/memory" element={<MemoryBank />} />
        <Route path="/memory/:agentName" element={<AgentMemoryDetail />} />
        <Route path="/soul/review/:versionId" element={<SoulReview />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/files" element={<FileManager />} />
        <Route path="/ops" element={<OperationsHub />} />
        <Route path="/brief" element={<MorningBrief />} />
        <Route path="/docs" element={<Docs />} />
        {/* Niche sub-products (embedded mode — accessed via sidebar) */}
        <Route path="/niche/ads/*" element={<Suspense fallback={<NicheLoadingSpinner />}><NicheShell nicheId="ads"><AdsApp /></NicheShell></Suspense>} />
        <Route path="/niche/gtm/*" element={<Suspense fallback={<NicheLoadingSpinner />}><NicheShell nicheId="gtm"><GtmApp /></NicheShell></Suspense>} />
        <Route path="/niche/content/*" element={<Suspense fallback={<NicheLoadingSpinner />}><NicheShell nicheId="content"><ContentApp /></NicheShell></Suspense>} />
        <Route path="/niche/brand-monitor/*" element={<Suspense fallback={<NicheLoadingSpinner />}><NicheShell nicheId="brand-monitor"><BrandMonitorApp /></NicheShell></Suspense>} />
        <Route path="/niche/outbound/*" element={<Suspense fallback={<NicheLoadingSpinner />}><NicheShell nicheId="outbound"><OutboundApp /></NicheShell></Suspense>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

function NicheLoadingSpinner() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dev/login" element={<Login />} />
          {/* Everything else goes through auth */}
          <Route path="*" element={<AuthRoutes />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
