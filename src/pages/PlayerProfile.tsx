import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, Trophy, Target, TrendingUp, Gamepad2, 
  MapPin, Calendar, Award, Lock, ChevronRight, ExternalLink, User
} from "lucide-react";
import { SiDiscord, SiX, SiTwitch } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { 
  usePlayerProfile, 
  usePlayerMatches, 
  usePlayerAllRankings,
  calculateAchievements,
  getLockedAchievements,
  PlayerAchievement
} from "@/hooks/usePlayerProfile";
import { useEloHistory, getRankTier, getWinRate } from "@/hooks/useRankings";
import { EloProgressionChart } from "@/components/profile/EloProgressionChart";
import { GlossaryTerm } from "@/components/ui/glossary-term";

const PlayerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: profileLoading } = usePlayerProfile(id || "");
  const { data: matches, isLoading: matchesLoading } = usePlayerMatches(id || "", 20);
  const { data: rankings, isLoading: rankingsLoading } = usePlayerAllRankings(id || "");
  const { data: eloHistory, isLoading: historyLoading } = useEloHistory(id || "", 50);

  const isLoading = profileLoading || matchesLoading || rankingsLoading || historyLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container text-center py-20">
            <h1 className="font-display text-2xl uppercase mb-4">Player Not Found</h1>
            <p className="text-muted-foreground">This player profile doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate stats
  const totalWins = rankings?.reduce((sum, r) => sum + r.wins, 0) || 0;
  const totalLosses = rankings?.reduce((sum, r) => sum + r.losses, 0) || 0;
  const totalMatches = rankings?.reduce((sum, r) => sum + r.matches_played, 0) || 0;
  const winRate = getWinRate(totalWins, totalLosses);
  const bestRanking = rankings && rankings.length > 0 
    ? rankings.reduce((best, r) => r.elo_rating > best.elo_rating ? r : best, rankings[0])
    : null;
  const bestTier = bestRanking ? getRankTier(bestRanking.elo_rating) : null;

  // Get peak ELO from rankings
  const peakElo = rankings && rankings.length > 0
    ? Math.max(...rankings.map(r => r.peak_elo))
    : 1200;

  // Calculate achievements
  const unlockedAchievements = rankings 
    ? calculateAchievements(rankings, matches?.length || 0) 
    : [];
  const allAchievements = getLockedAchievements();
  const lockedAchievements = allAchievements.filter(
    a => !unlockedAchievements.some(u => u.id === a.id)
  );

  const getRarityColor = (rarity: PlayerAchievement["rarity"]) => {
    switch (rarity) {
      case "common": return "bg-muted text-muted-foreground border-muted";
      case "rare": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
      case "epic": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case "legendary": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Breadcrumbs */}
          <PageBreadcrumbs 
            items={[
              { label: "Rankings", href: "/rankings" },
              { label: profile.username, icon: <User className="h-4 w-4" /> }
            ]}
            className="mb-6"
          />

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <RiftCard glow className="overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent" />
              <RiftCardContent className="relative">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-4">
                  <Avatar className="h-24 w-24 border-2 border-primary/50">
                    <AvatarImage src={profile.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl font-display">
                      {profile.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="font-display text-3xl font-bold uppercase tracking-wide">
                        {profile.username}
                      </h1>
                      {bestTier && (
                        <Badge variant="default" className={cn(
                          "font-display",
                          bestTier.name === "Grandmaster" && "bg-red-500/20 text-red-400",
                          bestTier.name === "Master" && "bg-purple-500/20 text-purple-400",
                          bestTier.name === "Diamond" && "bg-cyan-500/20 text-cyan-400",
                        )}>
                          {bestTier.icon} {bestTier.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {profile.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {format(new Date(profile.created_at), "MMM yyyy")}
                      </span>
                    </div>
                    {profile.bio && (
                      <p className="mt-3 text-muted-foreground max-w-2xl">
                        {profile.bio}
                      </p>
                    )}
                    
                    {/* Social Links */}
                    {(profile.discord_username || profile.twitter_username || profile.twitch_username) && (
                      <div className="flex items-center gap-3 mt-4">
                        {profile.discord_username && (
                          <div 
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5865F2]/10 text-[#5865F2] text-sm"
                            title={`Discord: ${profile.discord_username}`}
                          >
                            <SiDiscord className="h-4 w-4" />
                            <span>{profile.discord_username}</span>
                          </div>
                        )}
                        {profile.twitter_username && (
                          <a
                            href={`https://x.com/${profile.twitter_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground/10 text-foreground text-sm hover:bg-foreground/20 transition-colors"
                          >
                            <SiX className="h-4 w-4" />
                            <span>@{profile.twitter_username}</span>
                          </a>
                        )}
                        {profile.twitch_username && (
                          <a
                            href={`https://twitch.tv/${profile.twitch_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#9146FF]/10 text-[#9146FF] text-sm hover:bg-[#9146FF]/20 transition-colors"
                          >
                            <SiTwitch className="h-4 w-4" />
                            <span>{profile.twitch_username}</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{bestRanking?.elo_rating || 1200}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    <GlossaryTerm term="elo" showIcon={false}>Current ELO</GlossaryTerm>
                  </p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{winRate}%</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    <GlossaryTerm term="winRate" showIcon={false}>Win Rate</GlossaryTerm>
                  </p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <Gamepad2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{totalMatches}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Matches</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">
                    <span className="text-success">{totalWins}</span>
                    <span className="text-muted-foreground mx-1">/</span>
                    <span className="text-destructive">{totalLosses}</span>
                  </p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">W/L Record</p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="matches">Match History</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* ELO Chart */}
                  <EloProgressionChart 
                    eloHistory={eloHistory || []}
                    currentElo={bestRanking?.elo_rating || 1200}
                    peakElo={peakElo}
                    className="lg:col-span-2"
                  />

                  {/* Game Rankings */}
                  <RiftCard>
                    <RiftCardHeader>
                      <RiftCardTitle className="flex items-center gap-2">
                        <Gamepad2 className="h-5 w-5 text-primary" />
                        Rankings by Game
                      </RiftCardTitle>
                    </RiftCardHeader>
                    <RiftCardContent>
                      {rankings && rankings.length > 0 ? (
                        <div className="space-y-3">
                          {rankings.map((ranking) => {
                            const tier = getRankTier(ranking.elo_rating);
                            const rate = getWinRate(ranking.wins, ranking.losses);
                            return (
                              <div 
                                key={ranking.id} 
                                className="flex items-center justify-between p-3 rounded-sm bg-secondary/50 border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{ranking.game?.icon}</span>
                                  <div>
                                    <p className="font-display text-sm">{ranking.game?.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {ranking.wins}W / {ranking.losses}L ({rate}%)
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-display font-bold text-primary">{ranking.elo_rating}</p>
                                  <p className={cn("text-xs", tier.color)}>{tier.icon} {tier.name}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No game rankings yet
                        </div>
                      )}
                    </RiftCardContent>
                  </RiftCard>

                  {/* Recent Achievements */}
                  <RiftCard>
                    <RiftCardHeader>
                      <RiftCardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Recent Achievements
                      </RiftCardTitle>
                    </RiftCardHeader>
                    <RiftCardContent>
                      {unlockedAchievements.length > 0 ? (
                        <div className="space-y-3">
                          {unlockedAchievements.slice(0, 5).map((achievement) => (
                            <div 
                              key={achievement.id}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-sm border",
                                getRarityColor(achievement.rarity)
                              )}
                            >
                              <span className="text-2xl">{achievement.icon}</span>
                              <div>
                                <p className="font-display text-sm">{achievement.name}</p>
                                <p className="text-xs opacity-70">{achievement.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No achievements unlocked yet
                        </div>
                      )}
                    </RiftCardContent>
                  </RiftCard>
                </div>
              </TabsContent>

              {/* Match History Tab */}
              <TabsContent value="matches">
                <RiftCard>
                  <RiftCardHeader>
                    <RiftCardTitle>Match History</RiftCardTitle>
                  </RiftCardHeader>
                  <RiftCardContent>
                    {matches && matches.length > 0 ? (
                      <div className="space-y-2">
                        {matches.map((match) => {
                          const isWinner = match.winner_id === id;
                          const opponent = match.participant1_id === id 
                            ? match.participant2 
                            : match.participant1;
                          const playerScore = match.participant1_id === id 
                            ? match.participant1_score 
                            : match.participant2_score;
                          const opponentScore = match.participant1_id === id 
                            ? match.participant2_score 
                            : match.participant1_score;

                          return (
                            <div 
                              key={match.id}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-sm border",
                                isWinner 
                                  ? "bg-success/5 border-success/30" 
                                  : "bg-destructive/5 border-destructive/30"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <Badge variant={isWinner ? "default" : "destructive"} className="font-display w-12 justify-center">
                                  {isWinner ? "WIN" : "LOSS"}
                                </Badge>
                                <div>
                                  <p className="font-display text-sm">
                                    vs {opponent?.username || "Unknown"}
                                  </p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    {match.tournament?.game?.icon} {match.tournament?.name}
                                    <span>•</span>
                                    Round {match.round}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-display font-bold">
                                  {playerScore ?? 0} - {opponentScore ?? 0}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {match.completed_at && format(new Date(match.completed_at), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Gamepad2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No matches played yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Join a tournament to start competing
                        </p>
                      </div>
                    )}
                  </RiftCardContent>
                </RiftCard>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <div className="space-y-6">
                  {/* Unlocked */}
                  {unlockedAchievements.length > 0 && (
                    <RiftCard>
                      <RiftCardHeader>
                        <RiftCardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5 text-primary" />
                          Unlocked ({unlockedAchievements.length})
                        </RiftCardTitle>
                      </RiftCardHeader>
                      <RiftCardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {unlockedAchievements.map((achievement) => (
                            <div 
                              key={achievement.id}
                              className={cn(
                                "flex items-center gap-3 p-4 rounded-sm border",
                                getRarityColor(achievement.rarity)
                              )}
                            >
                              <span className="text-3xl">{achievement.icon}</span>
                              <div>
                                <p className="font-display text-sm font-medium">{achievement.name}</p>
                                <p className="text-xs opacity-70">{achievement.description}</p>
                                <Badge variant="outline" className="mt-1 text-[10px] capitalize">
                                  {achievement.rarity}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RiftCardContent>
                    </RiftCard>
                  )}

                  {/* Locked */}
                  <RiftCard>
                    <RiftCardHeader>
                      <RiftCardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                        Locked ({lockedAchievements.length})
                      </RiftCardTitle>
                    </RiftCardHeader>
                    <RiftCardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {lockedAchievements.map((achievement) => (
                          <div 
                            key={achievement.id}
                            className="flex items-center gap-3 p-4 rounded-sm border border-border/50 bg-muted/20 opacity-60"
                          >
                            <span className="text-3xl grayscale">{achievement.icon}</span>
                            <div>
                              <p className="font-display text-sm font-medium text-muted-foreground">{achievement.name}</p>
                              <p className="text-xs text-muted-foreground/70">{achievement.description}</p>
                              <Badge variant="outline" className="mt-1 text-[10px] capitalize opacity-50">
                                {achievement.rarity}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </RiftCardContent>
                  </RiftCard>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlayerProfile;
