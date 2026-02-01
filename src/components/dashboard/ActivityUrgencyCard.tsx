import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, AlertTriangle, Flame, TrendingDown, Gamepad2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type UrgencyLevel = "active" | "warning" | "danger" | "critical";

interface ActivityData {
  lastMatchAt: Date | null;
  hoursSinceMatch: number;
  urgencyLevel: UrgencyLevel;
  potentialPositionsLost: number;
  decayProgress: number;
}

const getUrgencyConfig = (level: UrgencyLevel) => {
  switch (level) {
    case "active":
      return {
        icon: Flame,
        label: "Ativo",
        description: "Continua assim! A tua atividade está em dia.",
        color: "text-success",
        bgColor: "bg-success/10",
        borderColor: "border-success/30",
        progressColor: "bg-success",
      };
    case "warning":
      return {
        icon: Clock,
        label: "Atenção",
        description: "Outros jogadores estão a subir. Joga para manter a posição!",
        color: "text-warning",
        bgColor: "bg-warning/10",
        borderColor: "border-warning/30",
        progressColor: "bg-warning",
      };
    case "danger":
      return {
        icon: AlertTriangle,
        label: "Perigo",
        description: "Estás a perder terreno! Jogadores ativos estão a aproximar-se.",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        borderColor: "border-orange-500/30",
        progressColor: "bg-orange-500",
      };
    case "critical":
      return {
        icon: TrendingDown,
        label: "Crítico",
        description: "Risco alto de perder posições! Joga agora para defender o teu rank.",
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        borderColor: "border-destructive/30",
        progressColor: "bg-destructive",
      };
  }
};

const calculateUrgencyLevel = (hoursSinceMatch: number): UrgencyLevel => {
  if (hoursSinceMatch < 24) return "active";
  if (hoursSinceMatch < 48) return "warning";
  if (hoursSinceMatch < 72) return "danger";
  return "critical";
};

const calculatePotentialPositionsLost = (hoursSinceMatch: number): number => {
  if (hoursSinceMatch < 24) return 0;
  if (hoursSinceMatch < 48) return Math.floor(Math.random() * 2) + 1;
  if (hoursSinceMatch < 72) return Math.floor(Math.random() * 3) + 2;
  return Math.floor(Math.random() * 5) + 3;
};

const formatTimeSince = (hours: number): string => {
  if (hours < 1) return "Há menos de 1 hora";
  if (hours < 24) return `Há ${Math.floor(hours)} hora${Math.floor(hours) !== 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Há ${days} dia${days !== 1 ? 's' : ''}`;
};

export const ActivityUrgencyCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: activityData, isLoading } = useQuery({
    queryKey: ["activity-urgency", user?.id],
    queryFn: async (): Promise<ActivityData> => {
      if (!user?.id) {
        return {
          lastMatchAt: null,
          hoursSinceMatch: 0,
          urgencyLevel: "active",
          potentialPositionsLost: 0,
          decayProgress: 0,
        };
      }

      const { data: rankings } = await supabase
        .from("player_rankings")
        .select("last_match_at")
        .eq("user_id", user.id)
        .order("last_match_at", { ascending: false })
        .limit(1);

      const lastMatchAt = rankings?.[0]?.last_match_at 
        ? new Date(rankings[0].last_match_at) 
        : null;

      const hoursSinceMatch = lastMatchAt 
        ? (Date.now() - lastMatchAt.getTime()) / (1000 * 60 * 60)
        : 168; // 7 days if never played

      const urgencyLevel = calculateUrgencyLevel(hoursSinceMatch);
      const potentialPositionsLost = calculatePotentialPositionsLost(hoursSinceMatch);
      
      // Decay progress: 0% at 0 hours, 100% at 72+ hours
      const decayProgress = Math.min(100, (hoursSinceMatch / 72) * 100);

      return {
        lastMatchAt,
        hoursSinceMatch,
        urgencyLevel,
        potentialPositionsLost,
        decayProgress,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading || !activityData) {
    return (
      <RiftCard>
        <RiftCardContent className="py-6">
          <div className="flex items-center justify-center">
            <Clock className="h-5 w-5 animate-pulse text-muted-foreground" />
          </div>
        </RiftCardContent>
      </RiftCard>
    );
  }

  const config = getUrgencyConfig(activityData.urgencyLevel);
  const Icon = config.icon;

  // If user has never played
  if (!activityData.lastMatchAt) {
    return (
      <RiftCard className="border-primary/30">
        <RiftCardHeader className="pb-2">
          <RiftCardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-primary" />
            Começa a Jogar
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Ainda não jogaste nenhuma partida. Entra num torneio para começar a subir no ranking!
          </p>
          <Button 
            variant="rift" 
            size="sm" 
            className="w-full"
            onClick={() => navigate("/tournaments")}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            Ver Torneios
          </Button>
        </RiftCardContent>
      </RiftCard>
    );
  }

  return (
    <RiftCard className={cn("transition-all", config.borderColor)}>
      <RiftCardHeader className="pb-2">
        <RiftCardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", config.color)} />
            Status de Atividade
          </span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded", config.bgColor, config.color)}>
            {config.label}
          </span>
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent className="space-y-4">
        {/* Time since last match */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Última partida</span>
          <span className={cn("font-medium", config.color)}>
            {formatTimeSince(activityData.hoursSinceMatch)}
          </span>
        </div>

        {/* Decay progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Risco de decaimento</span>
            <span className={config.color}>{Math.round(activityData.decayProgress)}%</span>
          </div>
          <Progress 
            value={activityData.decayProgress} 
            className="h-2"
            indicatorClassName={config.progressColor}
          />
        </div>

        {/* Warning message */}
        <p className={cn("text-xs", config.color)}>
          {config.description}
        </p>

        {/* Potential positions lost */}
        {activityData.potentialPositionsLost > 0 && (
          <div className={cn("flex items-center gap-2 p-2 rounded text-xs", config.bgColor)}>
            <TrendingDown className={cn("h-4 w-4", config.color)} />
            <span className={config.color}>
              Podes perder até <strong>{activityData.potentialPositionsLost} posições</strong> se não jogares
            </span>
          </div>
        )}

        {/* CTA Button */}
        {activityData.urgencyLevel !== "active" && (
          <Button 
            variant={activityData.urgencyLevel === "critical" ? "destructive" : "rift"}
            size="sm" 
            className="w-full"
            onClick={() => navigate("/tournaments")}
          >
            <Gamepad2 className="mr-2 h-4 w-4" />
            {activityData.urgencyLevel === "critical" ? "Jogar Agora!" : "Encontrar Partida"}
          </Button>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
