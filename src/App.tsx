import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Board from "./pages/Board";
import Missions from "./pages/Missions";
import AgentsPage from "./pages/Agents";

import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import BlueprintWizard from "./pages/BlueprintWizard";
import BlueprintDetail from "./pages/BlueprintDetail";
import Webhooks from "./pages/Webhooks";
import Analytics from "./pages/Analytics";
import MemoryBank from "./pages/MemoryBank";
import AgentMemoryDetail from "./pages/AgentMemoryDetail";
import SoulReview from "./pages/SoulReview";
import MissionReport from "./pages/MissionReport";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import UseCasePage from "./pages/UseCase";
import Autopilot from "./pages/Autopilot";
import Billing from "./pages/Billing";
import Onboarding from "./pages/Onboarding";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

/** Wraps auth-dependent routes: shows loading spinner, then resolves to unauth or auth routes */
function AuthRoutes() {
  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <img src="/logo.svg" alt="Mission Control" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <Navigate to="/landing" replace />
      </Unauthenticated>
      <Authenticated>
        <AuthenticatedRoutes />
      </Authenticated>
    </>
  );
}

function AuthenticatedRoutes() {
  const location = useLocation();
  // Redirect /login to / for authenticated users
  if (location.pathname === "/login") {
    return <Navigate to="/" replace />;
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
        <Route path="/agents" element={<AgentsPage />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/integrations/blueprint/new" element={<BlueprintWizard />} />
        <Route path="/integrations/blueprint/:id" element={<BlueprintDetail />} />
        <Route path="/webhooks" element={<Webhooks />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/memory" element={<MemoryBank />} />
        <Route path="/memory/:agentName" element={<AgentMemoryDetail />} />
        <Route path="/soul/review/:versionId" element={<SoulReview />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages — render instantly, no auth required */}
          <Route path="/landing" element={<Landing />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/use-cases/:slug" element={<UseCasePage />} />
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
