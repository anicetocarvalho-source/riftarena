import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Users, UserPlus, LogOut, Eye, Crown, Loader2, UsersRound, Trophy } from "lucide-react";
import { useUserTeams, useUserInvites, useRespondToInvite, useLeaveTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const MyTeamsSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: teams, isLoading: teamsLoading } = useUserTeams();
  const { data: invites, isLoading: invitesLoading } = useUserInvites();
  const respondToInvite = useRespondToInvite();
  const leaveTeam = useLeaveTeam();

  const handleAcceptInvite = (inviteId: string, teamId: string) => {
    respondToInvite.mutate({ inviteId, teamId, accept: true });
  };

  const handleDeclineInvite = (inviteId: string, teamId: string) => {
    respondToInvite.mutate({ inviteId, teamId, accept: false });
  };

  const handleLeaveTeam = (teamId: string) => {
    leaveTeam.mutate(teamId);
  };

  const isLoading = teamsLoading || invitesLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="mt-8"
    >
      <RiftCard>
        <RiftCardHeader>
          <div className="flex items-center justify-between">
            <RiftCardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {t("myTeams.title")}
            </RiftCardTitle>
            <Button variant="rift-outline" size="sm" onClick={() => navigate("/teams/create")}>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("myTeams.createTeam")}
            </Button>
          </div>
        </RiftCardHeader>
        <RiftCardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Pending Invites */}
              {invites && invites.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground">
                    {t("myTeams.pendingInvites")}
                  </h3>
                  <div className="space-y-2">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-3 rounded-sm bg-secondary/50 border border-border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={invite.team?.logo_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary font-display">
                              {invite.team?.tag?.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{invite.team?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              [{invite.team?.tag}] • {t("myTeams.captain")}: {invite.team?.captain?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="rift"
                            size="sm"
                            onClick={() => handleAcceptInvite(invite.id, invite.team_id)}
                            disabled={respondToInvite.isPending}
                          >
                            {t("myTeams.accept")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineInvite(invite.id, invite.team_id)}
                            disabled={respondToInvite.isPending}
                          >
                            {t("myTeams.decline")}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams List */}
              {teams && teams.length > 0 ? (
                <div className="space-y-3">
                  {invites && invites.length > 0 && (
                    <h3 className="text-sm font-display uppercase tracking-wider text-muted-foreground">
                      {t("myTeams.yourTeams")}
                    </h3>
                  )}
                  <div className="grid gap-3 md:grid-cols-2">
                    {teams.map((team) => {
                      const isCaptain = team.captain_id === user?.id;
                      return (
                        <div
                          key={team.id}
                          className="flex items-center justify-between p-4 rounded-sm bg-secondary/30 border border-border hover:border-primary/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={team.logo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-display text-lg">
                                {team.tag?.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-display font-semibold">{team.name}</p>
                                {isCaptain && (
                                  <Badge variant="gold" className="text-xs">
                                    <Crown className="mr-1 h-3 w-3" />
                                    {t("myTeams.captain")}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                [{team.tag}] • {t("myTeams.maxMembers", { count: team.max_members })}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/teams/${team.id}`)}
                              title={t("myTeams.viewTeam")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!isCaptain && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    title={t("myTeams.leaveTeam")}
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("myTeams.leaveConfirmTitle", { team: team.name })}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t("myTeams.leaveConfirmDesc")}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleLeaveTeam(team.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      {t("myTeams.leaveTeam")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                !invites?.length && (
                  <EmptyState
                    icon={UsersRound}
                    title={t("myTeams.noTeamsTitle")}
                    description={t("myTeams.noTeamsDesc")}
                    tip={t("myTeams.noTeamsTip")}
                    actions={[
                      {
                        label: t("myTeams.createTeam"),
                        onClick: () => navigate("/teams/create"),
                        icon: UserPlus,
                      },
                      {
                        label: t("myTeams.exploreTeams"),
                        onClick: () => navigate("/teams"),
                        variant: "rift-outline",
                        icon: Users,
                      },
                    ]}
                    compact
                  />
                )
              )}
            </div>
          )}
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
};
