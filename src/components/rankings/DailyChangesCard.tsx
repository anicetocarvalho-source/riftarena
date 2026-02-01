import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus, Users, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface DailyChangesCardProps {
  selectedGameId?: string;
}

interface EloChange {
  totalChange: number;
  matchCount: number;
}

interface PositionChange {
  currentPosition: number;
  estimatedChange: number;
}

interface Rival {
  id: string;
  username: string;
  avatar_url: string | null;
  elo_rating: number;
  elo_difference: number;
}

export function DailyChangesCard({ selectedGameId }: DailyChangesCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get ELO changes from the last 24 hours
  const { data: eloChanges, isLoading: eloLoading } = useQuery({
    queryKey: ["daily-elo-changes", user?.id, selectedGameId],
    queryFn: async (): Promise<EloChange | null> => {
      if (!user) return null;

      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      let query = supabase
        .from("match_elo_history")
        .select(`
          elo_change,
          match:tournament_matches!inner(
            tournament:tournaments!inner(game_id)
          )
        `)
        .eq("user_id", user.id)
        .gte("created_at", yesterday.toISOString());

      const { data, error } = await query;
      if (error) throw error;

      // Filter by game if selected
      let filteredData = data;
      if (selectedGameId) {
        filteredData = data.filter((item: any) => 
          item.match?.tournament?.game_id === selectedGameId
        );
      }

      if (!filteredData || filteredData.length === 0) return null;

      const totalChange = filteredData.reduce((sum: number, item: any) => sum + item.elo_change, 0);
      
      return {
        totalChange,
        matchCount: filteredData.length,
      };
    },
    enabled: !!user,
  });

  // Get position and rivals data
  const { data: positionData, isLoading: positionLoading } = useQuery({
    queryKey: ["daily-position-changes", user?.id, selectedGameId],
    queryFn: async (): Promise<{ position: PositionChange; rivals: Rival[] } | null> => {
      if (!user) return null;

      // Get all rankings ordered by ELO
      let query = supabase
        .from("player_rankings")
        .select(`
          user_id,
          elo_rating,
          updated_at,
          user:profiles(id, username, avatar_url)
        `)
        .order("elo_rating", { ascending: false });

      if (selectedGameId) {
        query = query.eq("game_id", selectedGameId);
      }

      const { data: rankings, error } = await query;
      if (error) throw error;

      const userIndex = rankings.findIndex((r: any) => r.user_id === user.id);
      if (userIndex === -1) return null;

      const userRanking = rankings[userIndex];
      const currentPosition = userIndex + 1;

      // Find rivals - players within 50 ELO who updated recently (potential recent passers)
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const rivals: Rival[] = [];
      
      // Look at players just above the user (within top 5 positions and close ELO)
      for (let i = Math.max(0, userIndex - 5); i < userIndex; i++) {
        const rival = rankings[i];
        const eloDiff = rival.elo_rating - userRanking.elo_rating;
        
        // If they're within 30 ELO and updated recently, they might have just passed
        if (eloDiff <= 30 && new Date(rival.updated_at) > yesterday) {
          rivals.push({
            id: rival.user_id,
            username: rival.user?.username || "Unknown",
            avatar_url: rival.user?.avatar_url,
            elo_rating: rival.elo_rating,
            elo_difference: eloDiff,
          });
        }
      }

      // Estimate position change based on ELO changes
      // This is an approximation since we don't have historical position data
      let estimatedChange = 0;
      if (eloChanges) {
        // Rough estimate: ~20 ELO = 1 position change on average
        estimatedChange = Math.round(eloChanges.totalChange / 20);
      }

      return {
        position: {
          currentPosition,
          estimatedChange,
        },
        rivals: rivals.slice(0, 3), // Max 3 rivals
      };
    },
    enabled: !!user && !eloLoading,
  });

  const isLoading = eloLoading || positionLoading;

  // Don't show if user not logged in or no data
  if (!user) return null;
  if (!isLoading && !eloChanges && !positionData) return null;

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-success";
    if (change < 0) return "text-destructive";
    return "text-muted-foreground";
  };

  const formatChange = (change: number, prefix = "") => {
    if (change > 0) return `${prefix}+${change}`;
    if (change < 0) return `${prefix}${change}`;
    return `${prefix}0`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-6"
    >
      <div className="rounded-sm border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-display">
            {t("rankingsPreview.dailyChanges.title")}
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* ELO Change */}
            <div className="flex items-center gap-3 p-3 rounded-sm bg-secondary/30">
              {getChangeIcon(eloChanges?.totalChange || 0)}
              <div>
                <p className={cn(
                  "font-display font-bold text-lg",
                  getChangeColor(eloChanges?.totalChange || 0)
                )}>
                  {formatChange(eloChanges?.totalChange || 0)} ELO
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("rankingsPreview.dailyChanges.eloChange", { 
                    count: eloChanges?.matchCount || 0 
                  })}
                </p>
              </div>
            </div>

            {/* Position Change */}
            <div className="flex items-center gap-3 p-3 rounded-sm bg-secondary/30">
              {getChangeIcon(positionData?.position.estimatedChange || 0)}
              <div>
                <p className={cn(
                  "font-display font-bold text-lg",
                  getChangeColor(positionData?.position.estimatedChange || 0)
                )}>
                  {formatChange(positionData?.position.estimatedChange || 0, "")} {t("rankingsPreview.dailyChanges.positions")}
                </p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("rankingsPreview.dailyChanges.currentRank", { 
                    position: positionData?.position.currentPosition || "?" 
                  })}
                </p>
              </div>
            </div>

            {/* Rivals */}
            <div className="p-3 rounded-sm bg-secondary/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {t("rankingsPreview.dailyChanges.rivals")}
                </span>
              </div>
              {positionData?.rivals && positionData.rivals.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {positionData.rivals.map((rival) => (
                    <div 
                      key={rival.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 rounded-sm p-1 -mx-1 transition-colors"
                      onClick={() => navigate(`/player/${rival.id}`)}
                    >
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={rival.avatar_url || undefined} />
                        <AvatarFallback className="text-[8px]">
                          {rival.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium truncate flex-1">
                        {rival.username}
                      </span>
                      <span className="text-[10px] text-destructive">
                        +{rival.elo_difference}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t("rankingsPreview.dailyChanges.noRivals")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
