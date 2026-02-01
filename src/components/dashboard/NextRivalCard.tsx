import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, TrendingUp, Swords, Loader2 } from "lucide-react";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getRankTier } from "@/hooks/useRankings";
import { cn } from "@/lib/utils";

interface RivalData {
  userId: string;
  username: string;
  avatarUrl: string | null;
  elo: number;
  eloGap: number;
  position: number;
  userPosition: number;
  game: {
    id: string;
    name: string;
    icon: string;
  } | null;
}

export function NextRivalCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: rivalData, isLoading } = useQuery({
    queryKey: ["next-rival", user?.id],
    queryFn: async (): Promise<RivalData | null> => {
      if (!user) return null;

      // Get all rankings ordered by ELO
      const { data: rankings, error } = await supabase
        .from("player_rankings")
        .select(`
          user_id,
          elo_rating,
          game:games(id, name, icon)
        `)
        .order("elo_rating", { ascending: false });

      if (error) throw error;
      if (!rankings || rankings.length === 0) return null;

      // Find user's position
      const userIndex = rankings.findIndex(r => r.user_id === user.id);
      if (userIndex === -1) return null;

      // User is already #1
      if (userIndex === 0) return null;

      // Get the player immediately above
      const rivalRanking = rankings[userIndex - 1];
      const userRanking = rankings[userIndex];

      // Fetch rival's profile
      const { data: rivalProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", rivalRanking.user_id)
        .maybeSingle();

      return {
        userId: rivalRanking.user_id,
        username: rivalProfile?.username || "Unknown",
        avatarUrl: rivalProfile?.avatar_url,
        elo: rivalRanking.elo_rating,
        eloGap: rivalRanking.elo_rating - userRanking.elo_rating,
        position: userIndex, // 0-indexed position of rival (user - 1)
        userPosition: userIndex + 1,
        game: rivalRanking.game as RivalData["game"],
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  });

  if (isLoading) {
    return (
      <RiftCard className="animate-pulse">
        <RiftCardContent className="py-6">
          <div className="h-20 bg-muted/50 rounded" />
        </RiftCardContent>
      </RiftCard>
    );
  }

  // User is #1 or not ranked yet
  if (!rivalData) {
    return (
      <RiftCard className="border-primary/20">
        <RiftCardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <p className="font-display text-sm font-bold uppercase tracking-wide text-primary">
                {t('dashboard.noRival', 'Sem rival')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.noRivalDesc', 'Estás no topo ou ainda não tens ranking!')}
              </p>
            </div>
          </div>
        </RiftCardContent>
      </RiftCard>
    );
  }

  const rivalTier = getRankTier(rivalData.elo);

  return (
    <RiftCard className="border-destructive/30 overflow-hidden">
      <RiftCardContent className="py-5">
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-destructive" />
              <span className="font-display text-xs font-bold uppercase tracking-wider text-destructive">
                {t('dashboard.nextRival', 'Próximo Rival')}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              #{rivalData.position} → #{rivalData.userPosition}
            </span>
          </div>

          {/* Rival Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={rivalData.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${rivalData.userId}`}
                alt={rivalData.username}
                className="w-14 h-14 rounded-sm border-2 border-destructive/50"
              />
              <span className="absolute -bottom-1 -right-1 text-lg">{rivalTier.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-display text-lg font-bold uppercase tracking-wide truncate">
                {rivalData.username}
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <span className={cn("font-medium", rivalTier.color)}>
                  {rivalTier.name}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="font-mono font-bold">{rivalData.elo} ELO</span>
              </div>
              {rivalData.game && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <span>{rivalData.game.icon}</span>
                  <span>{rivalData.game.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* ELO Gap */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-destructive/10 to-transparent rounded-sm p-3 border border-destructive/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-destructive" />
                <span className="text-sm">
                  {t('dashboard.eloToOvertake', 'ELO para ultrapassar')}
                </span>
              </div>
              <span className="font-display text-xl font-bold text-destructive">
                +{rivalData.eloGap + 1}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.overtakeHint', 'Ganha partidas para subir no ranking!')}
            </p>
          </motion.div>

          {/* Action */}
          <Button 
            variant="rift-outline" 
            size="sm" 
            className="w-full"
            onClick={() => navigate(`/player/${rivalData.userId}`)}
          >
            {t('dashboard.viewRivalProfile', 'Ver perfil do rival')}
          </Button>
        </div>
      </RiftCardContent>
    </RiftCard>
  );
}
