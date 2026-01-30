import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeams, useUserTeams, useUserInvites, useRespondToInvite } from "@/hooks/useTeams";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Search, Plus, Loader2, Check, X, Crown, UserPlus, UsersRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TeamsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allTeams, isLoading } = useTeams();
  const { data: userTeams } = useUserTeams();
  const { data: invites } = useUserInvites();
  const respondToInvite = useRespondToInvite();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = allTeams?.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.tag.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Badge variant="default" className="mb-4">{t('teams.badge')}</Badge>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
                  {t('teams.title')}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {t('teams.subtitle')}
                </p>
              </div>
              {user && (
                <Button variant="rift" onClick={() => navigate("/teams/create")}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('teams.createTeam')}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Team Invites */}
          {invites && invites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mb-8"
            >
              <RiftCard glow>
                <RiftCardHeader>
                  <RiftCardTitle>{t('teams.pendingInvites')} ({invites.length})</RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-3">
                    {invites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/20 text-lg font-bold">
                            {invite.team?.tag?.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{invite.team?.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {t('teams.captain')}: {invite.team?.captain?.username}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => respondToInvite.mutate({ 
                              inviteId: invite.id, 
                              teamId: invite.team_id, 
                              accept: true 
                            })}
                            disabled={respondToInvite.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => respondToInvite.mutate({ 
                              inviteId: invite.id, 
                              teamId: invite.team_id, 
                              accept: false 
                            })}
                            disabled={respondToInvite.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          )}

          {/* My Teams */}
          {userTeams && userTeams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <h2 className="font-display text-xl uppercase tracking-wider mb-4">{t('teams.myTeams')}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userTeams.map((team) => (
                  <RiftCard 
                    key={team.id} 
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <RiftCardContent className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-primary/20 text-xl font-bold">
                          {team.tag.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-lg font-bold">{team.name}</h3>
                            {team.captain_id === user?.id && (
                              <Crown className="h-4 w-4 text-warning" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">[{team.tag}]</p>
                        </div>
                        <Badge variant="secondary">{team.max_members} {t('teams.max')}</Badge>
                      </div>
                    </RiftCardContent>
                  </RiftCard>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <h2 className="font-display text-xl uppercase tracking-wider mb-4">{t('teams.allTeams')}</h2>
            <div className="relative max-w-md mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={t('teams.searchPlaceholder')}
                className="pl-10 bg-secondary border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </motion.div>

          {/* All Teams Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredTeams.length === 0 ? (
            searchTerm ? (
              <EmptyState
                icon={Search}
                title={t('teams.noTeamsSearch')}
                description={t('teams.noTeamsSearchDesc')}
                actions={[
                  {
                    label: t('teams.clearSearch'),
                    onClick: () => setSearchTerm(""),
                    icon: X,
                  },
                ]}
              />
            ) : (
              <EmptyState
                icon={UsersRound}
                title={t('teams.noTeams')}
                description={t('teams.noTeamsDesc')}
                tip={t('teams.noTeamsTip')}
                actions={
                  user
                    ? [
                        {
                          label: t('teams.createFirst'),
                          onClick: () => navigate("/teams/create"),
                          icon: UserPlus,
                        },
                      ]
                    : [
                        {
                          label: t('teams.signInToCreate'),
                          onClick: () => navigate("/auth"),
                          icon: Users,
                        },
                      ]
                }
              />
            )
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <RiftCard 
                    className="cursor-pointer hover:border-primary/50 transition-colors h-full"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    <RiftCardContent className="py-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-secondary text-xl font-bold shrink-0">
                          {team.tag.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg font-bold truncate">{team.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">[{team.tag}]</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={team.captain?.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">
                                {team.captain?.username?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{team.captain?.username}</span>
                          </div>
                        </div>
                      </div>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                          {team.description}
                        </p>
                      )}
                    </RiftCardContent>
                  </RiftCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TeamsPage;
