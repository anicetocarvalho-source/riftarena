import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  useTournament, 
  useTournamentRegistrations, 
  useTournamentMatches,
  useUpdateTournamentStatus,
  useUpdateRegistrationStatus,
  useGenerateBracket,
  useUpdateMatchResult
} from "@/hooks/useTournaments";
import { TournamentStatus } from "@/types/tournament";
import { 
  ArrowLeft, Trophy, Users, GitBranch, Settings, 
  Loader2, Check, X, Play, Pause, CheckCircle, AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { RegistrationsTab } from "@/components/tournaments/RegistrationsTab";
import { BracketTab } from "@/components/tournaments/BracketTab";
import { MatchesTab } from "@/components/tournaments/MatchesTab";
import { TournamentSettingsTab } from "@/components/tournaments/TournamentSettingsTab";

const ManageTournament = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isOrganizer, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(id || "");
  const { data: registrations, isLoading: registrationsLoading } = useTournamentRegistrations(id || "");
  const { data: matches, isLoading: matchesLoading } = useTournamentMatches(id || "");
  
  const updateStatus = useUpdateTournamentStatus();
  const updateRegistration = useUpdateRegistrationStatus();
  const generateBracket = useGenerateBracket();
  const updateMatchResult = useUpdateMatchResult();

  if (authLoading || tournamentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !tournament) {
    navigate("/dashboard");
    return null;
  }

  const isOwner = tournament.organizer_id === user.id;
  const canManage = isOwner || isAdmin;

  if (!canManage) {
    navigate("/dashboard");
    return null;
  }

  const getStatusBadge = (status: TournamentStatus) => {
    const variants: Record<TournamentStatus, "default" | "gold" | "diamond" | "destructive" | "secondary"> = {
      draft: "secondary",
      registration: "default",
      live: "diamond",
      completed: "gold",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const handleStatusChange = (newStatus: TournamentStatus) => {
    updateStatus.mutate({ id: tournament.id, status: newStatus });
  };

  const confirmedCount = registrations?.filter(r => r.status === "confirmed").length || 0;
  const pendingCount = registrations?.filter(r => r.status === "pending").length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{tournament.game?.icon}</span>
                  <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                    {tournament.name}
                  </h1>
                  {getStatusBadge(tournament.status)}
                </div>
                <p className="text-muted-foreground">
                  {tournament.game?.name} • {format(new Date(tournament.start_date), "PPP")} • 
                  ${tournament.prize_pool.toLocaleString()} Prize Pool
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tournament.status === "draft" && (
                  <Button 
                    variant="rift" 
                    onClick={() => handleStatusChange("registration")}
                    disabled={updateStatus.isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Open Registration
                  </Button>
                )}
                {tournament.status === "registration" && (
                  <>
                    <Button 
                      variant="rift" 
                      onClick={() => handleStatusChange("live")}
                      disabled={updateStatus.isPending || confirmedCount < 2}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Tournament
                    </Button>
                    <Button 
                      variant="rift-outline" 
                      onClick={() => handleStatusChange("draft")}
                      disabled={updateStatus.isPending}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Close Registration
                    </Button>
                  </>
                )}
                {tournament.status === "live" && (
                  <Button 
                    variant="rift" 
                    onClick={() => handleStatusChange("completed")}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete Tournament
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">{confirmedCount}/{tournament.max_participants}</p>
                  <p className="text-xs text-muted-foreground">Confirmed</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">{pendingCount}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-success/10 text-success">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">{matches?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Matches</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">${tournament.prize_pool.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="registrations">
              <TabsList className="mb-6">
                <TabsTrigger value="registrations">
                  <Users className="mr-2 h-4 w-4" />
                  Registrations
                </TabsTrigger>
                <TabsTrigger value="bracket">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Bracket
                </TabsTrigger>
                <TabsTrigger value="matches">
                  <Trophy className="mr-2 h-4 w-4" />
                  Matches
                </TabsTrigger>
                <TabsTrigger value="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="registrations">
                <RegistrationsTab
                  registrations={registrations || []}
                  isLoading={registrationsLoading}
                  tournamentId={tournament.id}
                  onUpdateStatus={(id, status) => 
                    updateRegistration.mutate({ id, status, tournamentId: tournament.id })
                  }
                  isUpdating={updateRegistration.isPending}
                />
              </TabsContent>

              <TabsContent value="bracket">
                <BracketTab
                  matches={matches || []}
                  isLoading={matchesLoading}
                  tournamentId={tournament.id}
                  registrations={registrations || []}
                  onGenerateBracket={() => 
                    generateBracket.mutate({ 
                      tournamentId: tournament.id, 
                      participants: registrations || [] 
                    })
                  }
                  isGenerating={generateBracket.isPending}
                  tournamentStatus={tournament.status}
                />
              </TabsContent>

              <TabsContent value="matches">
                <MatchesTab
                  matches={matches || []}
                  isLoading={matchesLoading}
                  tournamentId={tournament.id}
                  onUpdateResult={(matchId, winnerId, p1Score, p2Score) =>
                    updateMatchResult.mutate({
                      matchId,
                      tournamentId: tournament.id,
                      winnerId,
                      participant1Score: p1Score,
                      participant2Score: p2Score,
                    })
                  }
                  isUpdating={updateMatchResult.isPending}
                  tournamentStatus={tournament.status}
                />
              </TabsContent>

              <TabsContent value="settings">
                <TournamentSettingsTab tournament={tournament} />
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManageTournament;
