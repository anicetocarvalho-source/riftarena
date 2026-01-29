import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { ScrollToTop } from "./ScrollToTop";
import Index from "@/pages/Index";
import Tournaments from "@/pages/Tournaments";
import Rankings from "@/pages/Rankings";
import Games from "@/pages/Games";
import Sponsors from "@/pages/Sponsors";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import SponsorDashboard from "@/pages/SponsorDashboard";
import TournamentDetail from "@/pages/TournamentDetail";
import AdminUsers from "@/pages/AdminUsers";
import AdminAnalytics from "@/pages/AdminAnalytics";
import SetupAdmin from "@/pages/SetupAdmin";
import CreateTournament from "@/pages/CreateTournament";
import ManageTournament from "@/pages/ManageTournament";
import TeamsPage from "@/pages/TeamsPage";
import CreateTeam from "@/pages/CreateTeam";
import TeamDetail from "@/pages/TeamDetail";
import PlayerProfile from "@/pages/PlayerProfile";
import EditProfile from "@/pages/EditProfile";
import NotFound from "@/pages/NotFound";

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/tournaments" element={<PageTransition><Tournaments /></PageTransition>} />
        <Route path="/tournaments/:id" element={<PageTransition><TournamentDetail /></PageTransition>} />
        <Route path="/rankings" element={<PageTransition><Rankings /></PageTransition>} />
        <Route path="/games" element={<PageTransition><Games /></PageTransition>} />
        <Route path="/teams" element={<PageTransition><TeamsPage /></PageTransition>} />
        <Route path="/teams/create" element={<PageTransition><CreateTeam /></PageTransition>} />
        <Route path="/teams/:id" element={<PageTransition><TeamDetail /></PageTransition>} />
        <Route path="/sponsors" element={<PageTransition><Sponsors /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
        <Route path="/sponsor/dashboard" element={<PageTransition><SponsorDashboard /></PageTransition>} />
        <Route path="/admin/users" element={<PageTransition><AdminUsers /></PageTransition>} />
        <Route path="/admin/analytics" element={<PageTransition><AdminAnalytics /></PageTransition>} />
        <Route path="/admin/setup" element={<PageTransition><SetupAdmin /></PageTransition>} />
        <Route path="/tournaments/create" element={<PageTransition><CreateTournament /></PageTransition>} />
        <Route path="/tournaments/manage/:id" element={<PageTransition><ManageTournament /></PageTransition>} />
        <Route path="/player/:id" element={<PageTransition><PlayerProfile /></PageTransition>} />
        <Route path="/profile/edit" element={<PageTransition><EditProfile /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
    </>
  );
}
