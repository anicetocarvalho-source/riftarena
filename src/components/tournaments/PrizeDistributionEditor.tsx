import { useTranslation } from "react-i18next";
import { Trophy, Medal, Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface PrizeDistribution {
  first: number;
  second: number;
  third: number;
}

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

  const total = value.first + value.second + value.third;
  const isValid = total === 100;

  const handleChange = (place: keyof PrizeDistribution, newValue: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(newValue) || 0));
    onChange({
      ...value,
      [place]: numValue,
    });
  };

  const calculateAmount = (percentage: number) => {
    return ((prizePool * percentage) / 100).toFixed(2);
  };

  const places = [
    {
      key: "first" as const,
      icon: Trophy,
      label: t("prizeDistribution.first"),
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
    },
    {
      key: "second" as const,
      icon: Medal,
      label: t("prizeDistribution.second"),
      color: "text-gray-400",
      bgColor: "bg-gray-400/10",
      borderColor: "border-gray-400/30",
    },
    {
      key: "third" as const,
      icon: Award,
      label: t("prizeDistribution.third"),
      color: "text-amber-600",
      bgColor: "bg-amber-600/10",
      borderColor: "border-amber-600/30",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {t("prizeDistribution.title")}
        </Label>
        <div
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            isValid
              ? "bg-green-500/20 text-green-400"
              : "bg-destructive/20 text-destructive"
          )}
        >
          {t("prizeDistribution.total")}: {total}%
        </div>
      </div>

      <div className="grid gap-3">
        {places.map(({ key, icon: Icon, label, color, bgColor, borderColor }) => (
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
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">
                ${calculateAmount(value[key])}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                max={100}
                value={value[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                disabled={disabled}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">%</span>
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
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {places.map(({ key, label, color }) => (
              <div key={key}>
                <p className={cn("font-bold text-lg", color)}>
                  ${calculateAmount(value[key])}
                </p>
                <p className="text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
