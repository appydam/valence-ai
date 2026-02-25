import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import Index from "./pages/Index";
import Board from "./pages/Board";
import Missions from "./pages/Missions";
import AgentsPage from "./pages/Agents";
import CommandCenter from "./pages/Command";
import Settings from "./pages/Settings";
import Integrations from "./pages/Integrations";
import BlueprintWizard from "./pages/BlueprintWizard";
import BlueprintDetail from "./pages/BlueprintDetail";
import Webhooks from "./pages/Webhooks";
import Analytics from "./pages/Analytics";
import MemoryBank from "./pages/MemoryBank";
import AgentMemoryDetail from "./pages/AgentMemoryDetail";
import SoulReview from "./pages/SoulReview";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthLoading>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <img src="/logo.svg" alt="Mission Control" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AuthLoading>
      <Unauthenticated>
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dev/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/landing" replace />} />
          </Routes>
        </BrowserRouter>
      </Unauthenticated>
      <Authenticated>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/board" element={<Board />} />
            <Route path="/missions" element={<Missions />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/command" element={<CommandCenter />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/integrations/blueprint/new" element={<BlueprintWizard />} />
            <Route path="/integrations/blueprint/:id" element={<BlueprintDetail />} />
            <Route path="/webhooks" element={<Webhooks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/memory" element={<MemoryBank />} />
            <Route path="/memory/:agentName" element={<AgentMemoryDetail />} />
            <Route path="/soul/review/:versionId" element={<SoulReview />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </Authenticated>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
