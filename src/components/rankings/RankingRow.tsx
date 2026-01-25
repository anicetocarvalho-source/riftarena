import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface Player {
  rank: number;
  username: string;
  avatar: string;
  country: string;
  elo: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface RankingRowProps {
  player: Player;
  index?: number;
}

function getRankBadgeVariant(rank: number): "diamond" | "platinum" | "gold" | "silver" | "bronze" {
  if (rank === 1) return "diamond";
  if (rank === 2) return "platinum";
  if (rank === 3) return "gold";
  if (rank <= 10) return "silver";
  return "bronze";
}

export function RankingRow({ player, index = 0 }: RankingRowProps) {
  const isTop3 = player.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "group flex items-center gap-4 border-b border-border px-4 py-3 transition-colors hover:bg-secondary/50",
        isTop3 && "bg-primary/5 hover:bg-primary/10"
      )}
    >
      {/* Rank */}
      <div className="w-12 text-center">
        {isTop3 ? (
          <Badge variant={getRankBadgeVariant(player.rank)} className="w-8">
            {player.rank}
          </Badge>
        ) : (
          <span className="font-display text-lg font-semibold text-muted-foreground">
            {player.rank}
          </span>
        )}
      </div>

      {/* Player Info */}
      <div className="flex flex-1 items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-sm bg-secondary">
          <img
            src={player.avatar}
            alt={player.username}
            className="h-full w-full object-cover"
          />
          {isTop3 && (
            <div className="absolute inset-0 ring-2 ring-primary/50 rounded-sm" />
          )}
        </div>
        <div>
          <p className="font-display text-sm font-semibold uppercase tracking-wide group-hover:text-primary transition-colors">
            {player.username}
          </p>
          <p className="text-xs text-muted-foreground">{player.country}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-6 text-sm">
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase">W/L</p>
          <p>
            <span className="text-success">{player.wins}</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-destructive">{player.losses}</span>
          </p>
        </div>
        <div className="text-center">
          <p className="text-muted-foreground text-xs uppercase">Win Rate</p>
          <p className={cn(player.winRate >= 50 ? "text-success" : "text-muted-foreground")}>
            {player.winRate}%
          </p>
        </div>
      </div>

      {/* ELO */}
      <div className="w-20 text-right">
        <span className="font-display text-lg font-bold text-gradient-purple">
          {player.elo}
        </span>
        <p className="text-xs text-muted-foreground uppercase">ELO</p>
      </div>
    </motion.div>
  );
}
