import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Tournaments from "./pages/Tournaments";
import Rankings from "./pages/Rankings";
import Games from "./pages/Games";
import Sponsors from "./pages/Sponsors";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TournamentDetail from "./pages/TournamentDetail";
import AdminUsers from "./pages/AdminUsers";
import SetupAdmin from "./pages/SetupAdmin";
import CreateTournament from "./pages/CreateTournament";
import ManageTournament from "./pages/ManageTournament";
import TeamsPage from "./pages/TeamsPage";
import CreateTeam from "./pages/CreateTeam";
import TeamDetail from "./pages/TeamDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/games" element={<Games />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/create" element={<CreateTeam />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/setup" element={<SetupAdmin />} />
            <Route path="/tournaments/create" element={<CreateTournament />} />
            <Route path="/tournaments/manage/:id" element={<ManageTournament />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
