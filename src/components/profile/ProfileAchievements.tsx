import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Award, Lock, Sparkles } from "lucide-react";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PlayerAchievement } from "@/hooks/usePlayerProfile";

interface ProfileAchievementsProps {
  unlockedAchievements: PlayerAchievement[];
  lockedAchievements: PlayerAchievement[];
  /** If true, show compact preview (for overview tab) */
  compact?: boolean;
}

const getRarityColor = (rarity: PlayerAchievement["rarity"]) => {
  switch (rarity) {
    case "common": return "bg-muted/50 text-muted-foreground border-border";
    case "rare": return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    case "epic": return "bg-purple-500/10 text-purple-400 border-purple-500/30";
    case "legendary": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    default: return "bg-muted text-muted-foreground";
  }
};

const getRarityGlow = (rarity: PlayerAchievement["rarity"]) => {
  switch (rarity) {
    case "legendary": return "shadow-[0_0_15px_hsl(45_93%_47%/0.2)]";
    case "epic": return "shadow-[0_0_12px_hsl(262_100%_62%/0.15)]";
    case "rare": return "shadow-[0_0_10px_hsl(217_91%_60%/0.1)]";
    default: return "";
  }
};

const AchievementCard = ({ achievement, locked = false }: { achievement: PlayerAchievement; locked?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={!locked ? { scale: 1.03 } : undefined}
    className={cn(
      "flex items-center gap-3 p-4 rounded-sm border transition-all",
      locked
        ? "border-border/50 bg-muted/10 opacity-50"
        : cn(getRarityColor(achievement.rarity), getRarityGlow(achievement.rarity)),
    )}
  >
    <span className={cn("text-3xl", locked && "grayscale")}>{achievement.icon}</span>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className={cn(
          "font-display text-sm font-medium truncate",
          locked && "text-muted-foreground"
        )}>
          {achievement.name}
        </p>
        {!locked && achievement.rarity === "legendary" && (
          <Sparkles className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
        )}
      </div>
      <p className={cn(
        "text-xs truncate",
        locked ? "text-muted-foreground/50" : "opacity-70"
      )}>
        {achievement.description}
      </p>
      <Badge
        variant="outline"
        className={cn(
          "mt-1 text-[10px] capitalize",
          locked && "opacity-40"
        )}
      >
        {achievement.rarity}
      </Badge>
    </div>
  </motion.div>
);

export const ProfileAchievements = ({ unlockedAchievements, lockedAchievements, compact = false }: ProfileAchievementsProps) => {
  const { t } = useTranslation();
  const totalAchievements = unlockedAchievements.length + lockedAchievements.length;
  const completionPercent = totalAchievements > 0 ? Math.round((unlockedAchievements.length / totalAchievements) * 100) : 0;

  if (compact) {
    return (
      <RiftCard>
        <RiftCardHeader>
          <div className="flex items-center justify-between">
            <RiftCardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('playerProfile.achievements')}
            </RiftCardTitle>
            <Badge variant="outline" className="font-display">
              {unlockedAchievements.length}/{totalAchievements}
            </Badge>
          </div>
        </RiftCardHeader>
        <RiftCardContent>
          {/* Completion bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{t('playerProfile.completion', 'Completion')}</span>
              <span className="font-display">{completionPercent}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          {unlockedAchievements.length > 0 ? (
            <div className="space-y-2">
              {unlockedAchievements.slice(0, 4).map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
              {unlockedAchievements.length > 4 && (
                <p className="text-xs text-center text-muted-foreground pt-2">
                  +{unlockedAchievements.length - 4} more
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Award className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('playerProfile.noAchievements')}</p>
            </div>
          )}
        </RiftCardContent>
      </RiftCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Completion summary */}
      <RiftCard glow>
        <RiftCardContent className="py-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-sm bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">{unlockedAchievements.length}/{totalAchievements}</p>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{t('playerProfile.achievementsUnlocked', 'Achievements Unlocked')}</p>
              </div>
            </div>
            <span className="font-display text-3xl font-bold text-primary">{completionPercent}%</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
          </div>
          {/* Rarity breakdown */}
          <div className="flex items-center gap-4 mt-4 text-xs">
            {(["legendary", "epic", "rare", "common"] as const).map((rarity) => {
              const count = unlockedAchievements.filter(a => a.rarity === rarity).length;
              const total = [...unlockedAchievements, ...lockedAchievements].filter(a => a.rarity === rarity).length;
              return (
                <span key={rarity} className="flex items-center gap-1.5">
                  <span className={cn(
                    "h-2 w-2 rounded-full",
                    rarity === "legendary" && "bg-yellow-400",
                    rarity === "epic" && "bg-purple-400",
                    rarity === "rare" && "bg-blue-400",
                    rarity === "common" && "bg-muted-foreground",
                  )} />
                  <span className="capitalize text-muted-foreground">{rarity}</span>
                  <span className="font-display font-semibold">{count}/{total}</span>
                </span>
              );
            })}
          </div>
        </RiftCardContent>
      </RiftCard>

      {/* Unlocked */}
      {unlockedAchievements.length > 0 && (
        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              {t('playerProfile.unlocked')} ({unlockedAchievements.length})
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </RiftCardContent>
        </RiftCard>
      )}

      {/* Locked */}
      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-muted-foreground" />
            {t('playerProfile.locked')} ({lockedAchievements.length})
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lockedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} locked />
            ))}
          </div>
        </RiftCardContent>
      </RiftCard>
    </div>
  );
};
