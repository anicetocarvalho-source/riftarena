import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Medal, Award, Plus, Minus, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrizeDistribution {
  first: number;
  second: number;
  third: number;
  fourth?: number;
  fifth?: number;
  sixth?: number;
  seventh?: number;
  eighth?: number;
}

type PlaceKey = keyof PrizeDistribution;

interface PlaceConfig {
  key: PlaceKey;
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

interface PrizeDistributionEditorProps {
  value: PrizeDistribution;
  onChange: (value: PrizeDistribution) => void;
  prizePool: number;
  disabled?: boolean;
}

export const PrizeDistributionEditor = ({
  value,
  onChange,
  prizePool,
  disabled = false,
}: PrizeDistributionEditorProps) => {
  const { t } = useTranslation();

  // Determine how many positions are active (have a value > 0 or are in the top 3)
  const getActivePositionCount = (): number => {
    if (value.eighth !== undefined && value.eighth > 0) return 8;
    if (value.seventh !== undefined && value.seventh > 0) return 7;
    if (value.sixth !== undefined && value.sixth > 0) return 6;
    if (value.fifth !== undefined && value.fifth > 0) return 5;
    if (value.fourth !== undefined && value.fourth > 0) return 4;
    return 3;
  };

  const [positionCount, setPositionCount] = useState(getActivePositionCount());

  const activePlaces = ALL_PLACES.slice(0, positionCount);

  const total = activePlaces.reduce((sum, place) => {
    const val = value[place.key];
    return sum + (val ?? 0);
  }, 0);
  
  const isValid = total === 100;

  const handleChange = (place: PlaceKey, newValue: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(newValue) || 0));
    onChange({
      ...value,
      [place]: numValue,
    });
  };

  const calculateAmount = (percentage: number) => {
    return ((prizePool * percentage) / 100).toFixed(2);
  };

  const addPosition = () => {
    if (positionCount < 8) {
      const newCount = positionCount + 1;
      setPositionCount(newCount);
      
      // Initialize the new position with 0
      const newKey = ALL_PLACES[newCount - 1].key;
      onChange({
        ...value,
        [newKey]: 0,
      });
    }
  };

  const removePosition = () => {
    if (positionCount > 3) {
      const removedKey = ALL_PLACES[positionCount - 1].key;
      const newValue = { ...value };
      delete newValue[removedKey];
      setPositionCount(positionCount - 1);
      onChange(newValue);
    }
  };

  const applyEvenDistribution = () => {
    const evenPercentage = Math.floor(100 / positionCount);
    const remainder = 100 - (evenPercentage * positionCount);
    
    const newValue: PrizeDistribution = {
      first: evenPercentage + remainder, // Give remainder to 1st place
      second: evenPercentage,
      third: evenPercentage,
    };

    if (positionCount >= 4) newValue.fourth = evenPercentage;
    if (positionCount >= 5) newValue.fifth = evenPercentage;
    if (positionCount >= 6) newValue.sixth = evenPercentage;
    if (positionCount >= 7) newValue.seventh = evenPercentage;
    if (positionCount >= 8) newValue.eighth = evenPercentage;

    onChange(newValue);
  };

  const applyStandardDistribution = () => {
    // Standard competitive distributions
    const distributions: Record<number, number[]> = {
      3: [50, 30, 20],
      4: [45, 25, 18, 12],
      5: [40, 25, 18, 10, 7],
      6: [38, 23, 16, 10, 8, 5],
      7: [36, 22, 15, 10, 8, 5, 4],
      8: [35, 20, 14, 10, 8, 6, 4, 3],
    };

    const dist = distributions[positionCount] || distributions[3];
    const newValue: PrizeDistribution = {
      first: dist[0],
      second: dist[1],
      third: dist[2],
    };

    if (positionCount >= 4) newValue.fourth = dist[3];
    if (positionCount >= 5) newValue.fifth = dist[4];
    if (positionCount >= 6) newValue.sixth = dist[5];
    if (positionCount >= 7) newValue.seventh = dist[6];
    if (positionCount >= 8) newValue.eighth = dist[7];

    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Label className="text-base font-medium">
          {t("prizeDistribution.title")}
        </Label>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "text-xs px-2 py-1 rounded-full font-medium",
              isValid
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {t("prizeDistribution.total")}: {total}%
          </div>
        </div>
      </div>

      {/* Position Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removePosition}
            disabled={disabled || positionCount <= 3}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm px-2 min-w-[100px] text-center">
            {positionCount} {t("prizeDistribution.positions")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPosition}
            disabled={disabled || positionCount >= 8}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-1 ml-auto">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={applyStandardDistribution}
            disabled={disabled}
            className="text-xs"
          >
            {t("prizeDistribution.standard")}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={applyEvenDistribution}
            disabled={disabled}
            className="text-xs"
          >
            {t("prizeDistribution.even")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {activePlaces.map(({ key, icon: Icon, labelKey, color, bgColor, borderColor }) => (
          <div
            key={key}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg border",
              bgColor,
              borderColor
            )}
          >
            <div className={cn("p-1.5 rounded-full", bgColor)}>
              <Icon className={cn("h-4 w-4", color)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{t(labelKey)}</p>
              <p className="text-xs text-muted-foreground">
                ${calculateAmount(value[key] ?? 0)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={value[key] ?? 0}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={disabled}
                className="w-16 text-center h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>
        ))}
      </div>

      {!isValid && (
        <p className="text-xs text-destructive">
          {t("prizeDistribution.mustEqual100")}
        </p>
      )}

      {prizePool > 0 && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">{t("prizeDistribution.preview")}</p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            {activePlaces.map(({ key, labelKey, color }) => (
              <div key={key} className="py-1">
                <p className={cn("font-bold text-sm", color)}>
                  ${calculateAmount(value[key] ?? 0)}
                </p>
                <p className="text-muted-foreground text-[10px] truncate">{t(labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
