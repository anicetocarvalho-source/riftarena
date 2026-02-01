import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import { usePlayerPercentile } from "@/hooks/usePlayerPercentile";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PercentileBadgeProps {
  className?: string;
  compact?: boolean;
}

export function PercentileBadge({ className, compact = false }: PercentileBadgeProps) {
  const { t } = useTranslation();
  const { data: percentileData, isLoading } = usePlayerPercentile();

  if (isLoading || !percentileData) {
    return null;
  }

  const { percentile, position, totalPlayers, elo } = percentileData;

  // Determine badge color based on percentile
  const getBadgeStyle = () => {
    if (percentile >= 90) {
      return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 text-yellow-400";
    }
    if (percentile >= 75) {
      return "bg-gradient-to-r from-primary/20 to-primary/10 border-primary/50 text-primary";
    }
    if (percentile >= 50) {
      return "bg-gradient-to-r from-blue-500/20 to-blue-500/10 border-blue-500/50 text-blue-400";
    }
    return "bg-gradient-to-r from-muted/50 to-muted/30 border-border text-muted-foreground";
  };

  const getPercentileLabel = () => {
    if (percentile >= 99) return "Top 1%";
    if (percentile >= 95) return "Top 5%";
    if (percentile >= 90) return "Top 10%";
    if (percentile >= 75) return "Top 25%";
    if (percentile >= 50) return "Top 50%";
    return `Top ${100 - percentile}%`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/rankings"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-sm border transition-all hover:scale-105",
              getBadgeStyle(),
              className
            )}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="font-display text-xs font-bold uppercase tracking-wider">
              {getPercentileLabel()}
            </span>
          </Link>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-card border-border p-3"
        >
          <div className="space-y-1.5">
            <p className="font-display font-bold text-sm">
              {t("rankings.yourPosition", "A tua posição")}
            </p>
            <div className="flex items-center gap-3 text-xs">
              <span>
                <span className="text-primary font-bold">#{position}</span>
                <span className="text-muted-foreground"> / {totalPlayers}</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span>
                <span className="font-mono font-bold">{elo}</span>
                <span className="text-muted-foreground"> ELO</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("rankings.aheadOf", "Estás à frente de {{percent}}% dos jogadores", { percent: percentile })}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
