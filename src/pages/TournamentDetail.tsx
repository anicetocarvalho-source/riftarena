import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTournament, useTournamentMatches, useTournamentRegistrations } from "@/hooks/useTournaments";
import { 
  useUserRegistration, 
  useRegistrationCount, 
  useRegisterForTournament, 
  useRegisterTeamForTournament,
  useCancelRegistration 
} from "@/hooks/useTournamentRegistration";
import { useUserTeams } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { TournamentStatus } from "@/types/tournament";
import { PrizeDistributionDisplay } from "@/components/tournaments/PrizeDistributionDisplay";
 import { TournamentRulesDisplay } from "@/components/tournaments/rules";
import { 
  Trophy, Users, Calendar, DollarSign, 
  Loader2, Clock, CheckCircle, XCircle, GitBranch, FileText, UsersRound
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TournamentDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { data: tournament, isLoading: tournamentLoading } = useTournament(id || "");
  const { data: registrations } = useTournamentRegistrations(id || "");
  const { data: matches } = useTournamentMatches(id || "");
  const { data: userRegistration, isLoading: regLoading } = useUserRegistration(id || "");
  const { data: registrationCount } = useRegistrationCount(id || "");
  const { data: userTeams } = useUserTeams();
  
  const registerMutation = useRegisterForTournament();
  const registerTeamMutation = useRegisterTeamForTournament();
  const cancelMutation = useCancelRegistration();

  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  if (tournamentLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container text-center">
            <h1 className="text-2xl font-bold mb-4">{t('tournamentDetail.notFound')}</h1>
            <Button variant="rift" onClick={() => navigate("/tournaments")}>
              {t('tournamentDetail.browseTournaments')}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isTeamBased = (tournament as any).is_team_based;
  const teamSize = (tournament as any).team_size || 5;

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

  // Check if user's team is already registered
  const userTeamRegistrations = registrations?.filter(r => 
    r.team_id && userTeams?.some(t => t.id === r.team_id)
  );
  const hasTeamRegistered = userTeamRegistrations && userTeamRegistrations.length > 0;
  const teamRegistration = hasTeamRegistered ? userTeamRegistrations[0] : null;

  // Filter teams user can register (captain only, not already registered)
  const registeredTeamIds = registrations?.map(r => r.team_id).filter(Boolean) || [];
  const eligibleTeams = userTeams?.filter(t => 
    t.captain_id === user?.id && !registeredTeamIds.includes(t.id)
  ) || [];

  const canRegister = tournament.status === "registration" && 
    user && 
    (registrationCount || 0) < tournament.max_participants;

  const canRegisterSolo = canRegister && !isTeamBased && !userRegistration;
  const canRegisterTeam = canRegister && isTeamBased && eligibleTeams.length > 0;

  const isRegistered = isTeamBased ? hasTeamRegistered : !!userRegistration;
  const currentRegistration = isTeamBased ? teamRegistration : userRegistration;
  const isFull = (registrationCount || 0) >= tournament.max_participants;
  const confirmedParticipants = registrations?.filter(r => r.status === "confirmed") || [];
  const rounds = [...new Set(matches?.map(m => m.round) || [])].sort((a, b) => a - b);

  const handleRegister = () => {
    if (isTeamBased) {
      setShowTeamDialog(true);
    } else if (id) {
      registerMutation.mutate(id);
    }
  };

  const handleTeamRegister = () => {
    if (id && selectedTeamId) {
      registerTeamMutation.mutate(
        { tournamentId: id, teamId: selectedTeamId },
        { onSuccess: () => { setShowTeamDialog(false); setSelectedTeamId(""); } }
      );
    }
  };

  const handleCancelRegistration = () => {
    if (currentRegistration && id) {
      cancelMutation.mutate({ registrationId: currentRegistration.id, tournamentId: id });
    }
  };

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return t('tournamentDetail.finals');
    if (round === totalRounds - 1) return t('tournamentDetail.semiFinals');
    if (round === totalRounds - 2) return t('tournamentDetail.quarterFinals');
    return `${t('playerProfile.round')} ${round}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <PageBreadcrumbs 
            items={[
              { label: t('breadcrumbs.tournaments'), href: "/tournaments" },
              { label: tournament.name, icon: <span className="text-lg">{tournament.game?.icon}</span> }
            ]}
            className="mb-6"
          />

          {/* Banner */}
          {tournament.banner_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-lg overflow-hidden border border-border"
            >
              <img
                src={tournament.banner_url}
                alt={tournament.name}
                className="w-full h-48 md:h-64 lg:h-80 object-cover"
              />
            </motion.div>
          )}

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tournament.banner_url ? 0.1 : 0 }}
            className="mb-8"
          >
            
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{tournament.game?.icon}</span>
                  <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
                    {tournament.name}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {getStatusBadge(tournament.status)}
                  <Badge variant="secondary">{tournament.game?.name}</Badge>
                  <Badge variant="secondary" className="capitalize">
                    {tournament.bracket_type.replace("_", " ")}
                  </Badge>
                  {isTeamBased && (
                    <Badge variant="gold" className="flex items-center gap-1">
                      <UsersRound className="h-3 w-3" />
                      Team ({teamSize}v{teamSize})
                    </Badge>
                  )}
                </div>
                {tournament.description && (
                  <p className="text-muted-foreground max-w-2xl">
                    {tournament.description}
                  </p>
                )}
              </div>
              
              {/* Registration CTA */}
              <RiftCard className="lg:min-w-[300px]" glow={canRegisterSolo || canRegisterTeam}>
                <RiftCardContent className="py-6">
                  <div className="text-center mb-4">
                    <p className="text-3xl font-display font-bold text-primary mb-1">
                      ${tournament.prize_pool.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{t('tournamentDetail.prizePool')}</p>
                  </div>
                  
                  <div className="flex justify-center gap-6 mb-6 text-sm">
                    <div className="text-center">
                      <p className="font-bold">{registrationCount || 0}/{tournament.max_participants}</p>
                      <p className="text-muted-foreground">{isTeamBased ? t('tournamentDetail.teams') : t('tournamentDetail.players')}</p>
                    </div>
                    {tournament.registration_fee > 0 && (
                      <div className="text-center">
                        <p className="font-bold">${tournament.registration_fee}</p>
                        <p className="text-muted-foreground">{t('tournamentDetail.entryFee')}</p>
                      </div>
                    )}
                  </div>

                  {!user ? (
                    <Button variant="rift" className="w-full" onClick={() => navigate("/auth")}>
                      {t('tournamentDetail.signInToRegister')}
                    </Button>
                  ) : isRegistered ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        {currentRegistration?.status === "confirmed" ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-success">{t('tournamentDetail.registrationConfirmed')}</span>
                          </>
                        ) : currentRegistration?.status === "pending" ? (
                          <>
                            <Clock className="h-4 w-4 text-warning" />
                            <span className="text-warning">{t('tournamentDetail.awaitingApproval')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-destructive" />
                            <span className="text-destructive">{t('tournamentDetail.registrationRejected')}</span>
                          </>
                        )}
                      </div>
                      {currentRegistration?.status !== "confirmed" && tournament.status === "registration" && (
                        <Button 
                          variant="ghost" 
                          className="w-full" 
                          onClick={handleCancelRegistration}
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          {t('tournamentDetail.cancelRegistration')}
                        </Button>
                      )}
                    </div>
                  ) : tournament.status === "registration" ? (
                    isFull ? (
                      <Button variant="rift-outline" className="w-full" disabled>
                        {t('tournamentDetail.tournamentFull')}
                      </Button>
                    ) : isTeamBased ? (
                      eligibleTeams.length > 0 ? (
                        <Button 
                          variant="rift" 
                          className="w-full" 
                          onClick={handleRegister}
                          disabled={registerTeamMutation.isPending || regLoading}
                        >
                          {registerTeamMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <UsersRound className="mr-2 h-4 w-4" />
                          )}
                          {t('tournamentDetail.registerTeam')}
                        </Button>
                      ) : userTeams && userTeams.length > 0 ? (
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {t('tournamentDetail.needCaptain')}
                          </p>
                          <Button variant="rift-outline" className="w-full" onClick={() => navigate("/teams/create")}>
                            {t('tournamentDetail.createTeam')}
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground">
                            {t('tournamentDetail.createOrJoinTeam')}
                          </p>
                          <Button variant="rift" className="w-full" onClick={() => navigate("/teams/create")}>
                            {t('tournamentDetail.createTeam')}
                          </Button>
                        </div>
                      )
                    ) : (
                      <Button 
                        variant="rift" 
                        className="w-full" 
                        onClick={handleRegister}
                        disabled={registerMutation.isPending || regLoading}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trophy className="mr-2 h-4 w-4" />
                          )}
                          {t('tournamentDetail.registerNow')}
                        </Button>
                    )
                  ) : tournament.status === "draft" ? (
                    <Button variant="rift-outline" className="w-full" disabled>
                      {t('tournamentDetail.registrationNotOpen')}
                    </Button>
                  ) : (
                    <Button variant="rift-outline" className="w-full" disabled>
                      {t('tournamentDetail.registrationClosed')}
                    </Button>
                  )}
                </RiftCardContent>
              </RiftCard>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('tournamentDetail.startDate')}</p>
                  <p className="font-medium">{format(new Date(tournament.start_date), "PPP")}</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            
            {tournament.registration_deadline && (
              <RiftCard>
                <RiftCardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-warning/10 text-warning">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('tournamentDetail.regDeadline')}</p>
                    <p className="font-medium">{format(new Date(tournament.registration_deadline), "PPP")}</p>
                  </div>
                </RiftCardContent>
              </RiftCard>
            )}
            
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-success/10 text-success">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{isTeamBased ? t('tournamentDetail.teams') : t('tournamentDetail.participants')}</p>
                    <p className="font-medium">{registrationCount || 0} / {tournament.max_participants}</p>
                </div>
              </RiftCardContent>
            </RiftCard>
            
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <DollarSign className="h-5 w-5" />
                </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('tournamentDetail.prizePool')}</p>
                    <p className="font-medium">${tournament.prize_pool.toLocaleString()}</p>
                  </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Prize Distribution Section */}
          {tournament.prize_pool > 0 && tournament.prize_distribution && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t('prizeDistribution.title')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <PrizeDistributionDisplay 
                    prizePool={tournament.prize_pool} 
                    distribution={tournament.prize_distribution} 
                  />
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bracket */}
              {matches && matches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <RiftCard>
                    <RiftCardHeader>
                      <RiftCardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-primary" />
                        {t('tournamentDetail.tournamentBracket')}
                      </RiftCardTitle>
                    </RiftCardHeader>
                    <RiftCardContent>
                      <div className="overflow-x-auto">
                        <div className="flex gap-6 min-w-max py-4">
                          {rounds.map((round) => {
                            const roundMatches = matches.filter(m => m.round === round);
                            return (
                              <div key={round} className="flex flex-col gap-3">
                                <h3 className="font-display text-xs uppercase tracking-wider text-muted-foreground text-center">
                                  {getRoundName(round, rounds.length)}
                                </h3>
                                <div className="flex flex-col gap-3 justify-around h-full">
                                  {roundMatches.map((match) => (
                                    <div
                                      key={match.id}
                                      className="bg-secondary/50 rounded-lg p-2 w-40 border border-border text-sm"
                                    >
                                      <div className={`flex items-center justify-between p-1.5 rounded ${
                                        match.winner_id === match.participant1_id 
                                          ? "bg-primary/20" 
                                          : ""
                                      }`}>
                                        <span className="truncate">
                                          {match.participant1?.username || "TBD"}
                                        </span>
                                        {match.participant1_score !== null && (
                                          <span className="font-bold ml-2">{match.participant1_score}</span>
                                        )}
                                      </div>
                                      <div className={`flex items-center justify-between p-1.5 rounded ${
                                        match.winner_id === match.participant2_id 
                                          ? "bg-primary/20" 
                                          : ""
                                      }`}>
                                        <span className="truncate">
                                          {match.participant2?.username || "TBD"}
                                        </span>
                                        {match.participant2_score !== null && (
                                          <span className="font-bold ml-2">{match.participant2_score}</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </RiftCardContent>
                  </RiftCard>
                </motion.div>
              )}

              {/* Rules */}
              {tournament.rules && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <RiftCard>
                    <RiftCardHeader>
                      <RiftCardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        {t('tournamentDetail.rulesGuidelines')}
                      </RiftCardTitle>
                    </RiftCardHeader>
                    <RiftCardContent>
                       <TournamentRulesDisplay rules={tournament.rules} />
                    </RiftCardContent>
                  </RiftCard>
                </motion.div>
              )}
            </div>

            {/* Sidebar - Participants */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {isTeamBased ? t('tournamentDetail.confirmedTeams') : t('tournamentDetail.confirmedParticipants')} ({confirmedParticipants.length})
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {confirmedParticipants.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {isTeamBased ? t('tournamentDetail.noConfirmedTeams') : t('tournamentDetail.noConfirmedParticipants')}
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {confirmedParticipants.map((reg, index) => (
                        <div
                          key={reg.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                        >
                          <span className="text-xs text-muted-foreground w-6">
                            #{index + 1}
                          </span>
                          {isTeamBased && reg.team_id ? (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/20 text-xs font-bold">
                                TM
                              </div>
                              <span className="font-medium text-sm">Team</span>
                            </div>
                          ) : (
                            <>
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reg.user?.avatar_url || undefined} />
                                <AvatarFallback>
                                  {reg.user?.username?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm truncate">
                                {reg.user?.username || "Unknown"}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Team Selection Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('tournamentDetail.selectTeamToRegister')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('tournamentDetail.yourTeams')}</Label>
              <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('tournamentDetail.selectTeam')} />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      [{team.tag}] {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {t('tournamentDetail.captainOnly')}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowTeamDialog(false)}>
              {t('common.cancel')}
            </Button>
            <Button 
              variant="rift" 
              onClick={handleTeamRegister}
              disabled={registerTeamMutation.isPending || !selectedTeamId}
            >
              {registerTeamMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UsersRound className="mr-2 h-4 w-4" />
              )}
              {t('tournamentDetail.registerTeam')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentDetail;
