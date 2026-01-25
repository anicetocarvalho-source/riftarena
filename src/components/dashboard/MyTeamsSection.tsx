import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, UserPlus, LogOut, Eye, Crown, Loader2 } from "lucide-react";
import { useUserTeams, useUserInvites, useRespondToInvite, useLeaveTeam } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
              My Teams
            </RiftCardTitle>
            <Button variant="rift-outline" size="sm" onClick={() => navigate("/teams/create")}>
              <UserPlus className="mr-2 h-4 w-4" />
              Create Team
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
                    Pending Invites
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
                              [{invite.team?.tag}] • Captain: {invite.team?.captain?.username}
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
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeclineInvite(invite.id, invite.team_id)}
                            disabled={respondToInvite.isPending}
                          >
                            Decline
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
                      Your Teams
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
                                    Captain
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                [{team.tag}] • {team.max_members} max members
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/teams/${team.id}`)}
                              title="View Team"
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
                                    title="Leave Team"
                                  >
                                    <LogOut className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Leave {team.name}?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to leave this team? You'll need a new invite to rejoin.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleLeaveTeam(team.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Leave Team
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
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground mb-4">
                      You're not a member of any teams yet.
                    </p>
                    <div className="flex gap-3">
                      <Button variant="rift" onClick={() => navigate("/teams/create")}>
                        Create a Team
                      </Button>
                      <Button variant="rift-outline" onClick={() => navigate("/teams")}>
                        Browse Teams
                      </Button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
};
