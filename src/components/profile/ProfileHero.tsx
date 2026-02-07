import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, Calendar, Zap } from "lucide-react";
import { SiDiscord, SiX, SiTwitch } from "@icons-pack/react-simple-icons";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { PlayerProfile } from "@/hooks/usePlayerProfile";

interface ProfileHeroProps {
  profile: PlayerProfile;
  bestTier: { name: string; color: string; icon: string } | null;
  bestElo: number;
  peakElo: number;
  totalMatches: number;
  winRate: number;
}

export const ProfileHero = ({ profile, bestTier, bestElo, peakElo, totalMatches, winRate }: ProfileHeroProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <RiftCard glow className="overflow-hidden relative">
        {/* Dramatic background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        
        <RiftCardContent className="relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 py-4">
            {/* Avatar with glow ring */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-primary/60 to-primary/20 rounded-full blur-sm" />
              <Avatar className="relative h-28 w-28 border-2 border-primary/50">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-3xl font-display bg-secondary">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
                  {profile.username}
                </h1>
                {bestTier && (
                  <Badge variant="default" className={cn(
                    "font-display text-sm px-3 py-1",
                    bestTier.name === "Grandmaster" && "bg-red-500/20 text-red-400 border-red-500/30",
                    bestTier.name === "Master" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
                    bestTier.name === "Diamond" && "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
                    bestTier.name === "Platinum" && "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                    bestTier.name === "Gold" && "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                  )}>
                    {bestTier.icon} {bestTier.name}
                  </Badge>
                )}
              </div>

              {/* Inline key stats */}
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="font-display text-2xl font-bold text-primary">{bestElo}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">ELO</span>
                <span className="text-border">|</span>
                <span className="font-display text-sm font-semibold text-success">{winRate}%</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Win Rate</span>
                <span className="text-border">|</span>
                <span className="font-display text-sm font-semibold">{totalMatches}</span>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{t('playerProfile.matches')}</span>
                {peakElo > bestElo && (
                  <>
                    <span className="text-border">|</span>
                    <Zap className="h-3.5 w-3.5 text-warning" />
                    <span className="font-display text-sm font-semibold text-warning">{peakElo}</span>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Peak</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.city ? `${profile.city}, ${profile.country}` : profile.country}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('playerProfile.joined')} {format(new Date(profile.created_at), "MMM yyyy")}
                </span>
              </div>

              {profile.bio && (
                <p className="mt-3 text-muted-foreground max-w-2xl">{profile.bio}</p>
              )}
              
              {/* Social Links */}
              {(profile.discord_username || profile.twitter_username || profile.twitch_username) && (
                <div className="flex items-center gap-3 mt-4">
                  {profile.discord_username && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#5865F2]/10 text-[#5865F2] text-sm" title={`Discord: ${profile.discord_username}`}>
                      <SiDiscord className="h-4 w-4" />
                      <span>{profile.discord_username}</span>
                    </div>
                  )}
                  {profile.twitter_username && (
                    <a href={`https://x.com/${profile.twitter_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground/10 text-foreground text-sm hover:bg-foreground/20 transition-colors">
                      <SiX className="h-4 w-4" />
                      <span>@{profile.twitter_username}</span>
                    </a>
                  )}
                  {profile.twitch_username && (
                    <a href={`https://twitch.tv/${profile.twitch_username}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#9146FF]/10 text-[#9146FF] text-sm hover:bg-[#9146FF]/20 transition-colors">
                      <SiTwitch className="h-4 w-4" />
                      <span>{profile.twitch_username}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
};
