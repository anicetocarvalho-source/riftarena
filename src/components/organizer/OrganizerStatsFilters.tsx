import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

export type TimePeriod = "all" | "7d" | "30d" | "90d" | "365d";

interface Game {
  id: string;
  name: string;
  icon: string;
}

interface OrganizerStatsFiltersProps {
  games: Game[];
  selectedGameId: string;
  selectedPeriod: TimePeriod;
  onGameChange: (gameId: string) => void;
  onPeriodChange: (period: TimePeriod) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const OrganizerStatsFilters = ({
  games,
  selectedGameId,
  selectedPeriod,
  onGameChange,
  onPeriodChange,
  onClearFilters,
  hasActiveFilters,
}: OrganizerStatsFiltersProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Filter className="h-4 w-4 text-muted-foreground" />

      {/* Game Filter */}
      <Select value={selectedGameId} onValueChange={onGameChange}>
        <SelectTrigger className="w-[180px] h-9 text-sm">
          <SelectValue placeholder={t("organizerStats.filters.allGames")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("organizerStats.filters.allGames")}</SelectItem>
          {games.map((game) => (
            <SelectItem key={game.id} value={game.id}>
              <span className="flex items-center gap-1.5">
                <span>{game.icon}</span>
                <span>{game.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Time Period Filter */}
      <Select value={selectedPeriod} onValueChange={(v) => onPeriodChange(v as TimePeriod)}>
        <SelectTrigger className="w-[160px] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("organizerStats.filters.allTime")}</SelectItem>
          <SelectItem value="7d">{t("organizerStats.filters.last7Days")}</SelectItem>
          <SelectItem value="30d">{t("organizerStats.filters.last30Days")}</SelectItem>
          <SelectItem value="90d">{t("organizerStats.filters.last90Days")}</SelectItem>
          <SelectItem value="365d">{t("organizerStats.filters.lastYear")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 text-xs gap-1">
          <X className="h-3 w-3" />
          {t("organizerStats.filters.clear")}
        </Button>
      )}
    </div>
  );
};
