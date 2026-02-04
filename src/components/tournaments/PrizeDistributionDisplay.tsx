import { useTranslation } from "react-i18next";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { PrizeDistribution } from "@/types/tournament";
import { cn } from "@/lib/utils";

interface PlaceConfig {
  key: keyof PrizeDistribution;
  icon: typeof Trophy;
  labelKey: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const ALL_PLACES: PlaceConfig[] = [
  {
    key: "first",
    icon: Trophy,
    labelKey: "prizeDistribution.first",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
  },
  {
    key: "second",
    icon: Medal,
    labelKey: "prizeDistribution.second",
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
    borderColor: "border-gray-400/30",
  },
  {
    key: "third",
    icon: Award,
    labelKey: "prizeDistribution.third",
    color: "text-amber-600",
    bgColor: "bg-amber-600/10",
    borderColor: "border-amber-600/30",
  },
  {
    key: "fourth",
    icon: Star,
    labelKey: "prizeDistribution.fourth",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
  },
  {
    key: "fifth",
    icon: Star,
    labelKey: "prizeDistribution.fifth",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
    borderColor: "border-purple-400/30",
  },
  {
    key: "sixth",
    icon: Star,
    labelKey: "prizeDistribution.sixth",
    color: "text-pink-400",
    bgColor: "bg-pink-400/10",
    borderColor: "border-pink-400/30",
  },
  {
    key: "seventh",
    icon: Star,
    labelKey: "prizeDistribution.seventh",
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
    borderColor: "border-teal-400/30",
  },
  {
    key: "eighth",
    icon: Star,
    labelKey: "prizeDistribution.eighth",
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10",
    borderColor: "border-indigo-400/30",
  },
];

interface PrizeDistributionDisplayProps {
  prizePool: number;
  distribution: PrizeDistribution;
}

export const PrizeDistributionDisplay = ({
  prizePool,
  distribution,
}: PrizeDistributionDisplayProps) => {
  const { t } = useTranslation();

  // Get only the places that have a value
  const activePlaces = ALL_PLACES.filter(place => {
    const value = distribution[place.key];
    return value !== undefined && value > 0;
  });

  const calculateAmount = (percentage: number) => {
    return ((prizePool * percentage) / 100).toLocaleString();
  };

  // Determine grid columns based on number of active places
  const getGridClass = () => {
    const count = activePlaces.length;
    if (count <= 3) return "md:grid-cols-3";
    if (count <= 4) return "md:grid-cols-4";
    return "md:grid-cols-4 lg:grid-cols-4";
  };

  return (
    <div className={cn("grid gap-3", getGridClass())}>
      {activePlaces.map(({ key, icon: Icon, labelKey, color, bgColor, borderColor }) => {
        const percentage = distribution[key] ?? 0;
        return (
          <div 
            key={key}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              bgColor,
              borderColor
            )}
          >
            <div className={cn("p-2 rounded-full", bgColor)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t(labelKey)}</p>
              <p className={cn("text-lg font-bold", color)}>
                ${calculateAmount(percentage)}
              </p>
              <p className="text-[10px] text-muted-foreground">{percentage}%</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
