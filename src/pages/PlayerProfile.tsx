import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { SEOHead } from "@/components/seo/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "lucide-react";
import { 
  usePlayerProfile, 
  usePlayerMatches, 
  usePlayerAllRankings,
  calculateAchievements,
  getLockedAchievements,
} from "@/hooks/usePlayerProfile";
import { useEloHistory, getRankTier, getWinRate } from "@/hooks/useRankings";
import { usePlayerTeams } from "@/hooks/usePlayerTeams";
import { PlayerProfileSkeleton } from "@/components/skeletons/PlayerProfileSkeleton";

// Profile sub-components
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileDetailedStats } from "@/components/profile/ProfileDetailedStats";
import { EloProgressionChart } from "@/components/profile/EloProgressionChart";
import { ProfileGameRankings } from "@/components/profile/ProfileGameRankings";
import { ProfileAchievements } from "@/components/profile/ProfileAchievements";
import { ProfileMatchHistory } from "@/components/profile/ProfileMatchHistory";
import { ProfileTeams } from "@/components/profile/ProfileTeams";

const PlayerProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: profile, isLoading: profileLoading } = usePlayerProfile(id || "");
  const { data: matches, isLoading: matchesLoading } = usePlayerMatches(id || "", 20);
  const { data: rankings, isLoading: rankingsLoading } = usePlayerAllRankings(id || "");
  const { data: eloHistory, isLoading: historyLoading } = useEloHistory(id || "", 50);
  const { data: playerTeams } = usePlayerTeams(id || "");

  const isLoading = profileLoading || matchesLoading || rankingsLoading || historyLoading;

  if (isLoading) {
    return <PlayerProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container text-center py-20">
            <h1 className="font-display text-2xl uppercase mb-4">{t('playerProfile.notFound')}</h1>
            <p className="text-muted-foreground">{t('playerProfile.notFoundDesc')}</p>
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
  const peakElo = rankings && rankings.length > 0
    ? Math.max(...rankings.map(r => r.peak_elo))
    : 1200;
  const bestWinStreak = rankings && rankings.length > 0
    ? Math.max(...rankings.map(r => r.best_win_streak))
    : 0;
  const currentWinStreak = rankings && rankings.length > 0
    ? Math.max(...rankings.map(r => r.win_streak))
    : 0;

  // Calculate achievements
  const unlockedAchievements = rankings 
    ? calculateAchievements(rankings, matches?.length || 0) 
    : [];
  const allAchievements = getLockedAchievements();
  const lockedAchievements = allAchievements.filter(
    a => !unlockedAchievements.some(u => u.id === a.id)
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title={`${profile.username} — Player Profile`}
        description={profile.bio || `View ${profile.username}'s competitive stats, ELO ratings, and match history on RIFT Arena.`}
        canonical={`https://riftarena.lovable.app/player/${id}`}
        ogType="profile"
        ogImage={profile.avatar_url || undefined}
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          <PageBreadcrumbs 
            items={[
              { label: t('rankings.title'), href: "/rankings" },
              { label: profile.username, icon: <User className="h-4 w-4" /> }
            ]}
            className="mb-6"
          />

          {/* Enhanced Hero */}
          <ProfileHero
            profile={profile}
            bestTier={bestTier}
            bestElo={bestRanking?.elo_rating || 1200}
            peakElo={peakElo}
            totalMatches={totalMatches}
            winRate={winRate}
          />

          {/* Detailed Stats Grid */}
          <ProfileDetailedStats
            bestElo={bestRanking?.elo_rating || 1200}
            peakElo={peakElo}
            winRate={winRate}
            totalWins={totalWins}
            totalLosses={totalLosses}
            totalMatches={totalMatches}
            bestWinStreak={bestWinStreak}
            currentWinStreak={currentWinStreak}
            gamesPlayed={rankings?.length || 0}
          />

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="overview">{t('playerProfile.overview')}</TabsTrigger>
                <TabsTrigger value="matches">{t('playerProfile.matchHistory')}</TabsTrigger>
                <TabsTrigger value="teams">{t('playerProfile.teams', 'Teams')}</TabsTrigger>
                <TabsTrigger value="achievements">{t('playerProfile.achievements')}</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid gap-6 lg:grid-cols-2">
                  <EloProgressionChart 
                    eloHistory={eloHistory || []}
                    currentElo={bestRanking?.elo_rating || 1200}
                    peakElo={peakElo}
                    className="lg:col-span-2"
                  />
                  <ProfileGameRankings rankings={rankings} />
                  <ProfileAchievements
                    unlockedAchievements={unlockedAchievements}
                    lockedAchievements={lockedAchievements}
                    compact
                  />
                </div>
              </TabsContent>

              {/* Match History Tab */}
              <TabsContent value="matches">
                <ProfileMatchHistory 
                  matches={matches} 
                  eloHistory={eloHistory}
                  userId={id || ""} 
                />
              </TabsContent>

              {/* Teams Tab */}
              <TabsContent value="teams">
                <ProfileTeams teams={playerTeams} />
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements">
                <ProfileAchievements
                  unlockedAchievements={unlockedAchievements}
                  lockedAchievements={lockedAchievements}
                />
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
