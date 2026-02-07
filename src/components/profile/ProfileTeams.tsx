import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Users, Crown, ChevronRight } from "lucide-react";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamData {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  role: string;
}

interface ProfileTeamsProps {
  teams: TeamData[] | undefined;
}

export const ProfileTeams = ({ teams }: ProfileTeamsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <RiftCard>
      <RiftCardHeader>
        <RiftCardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {t('playerProfile.teams', 'Teams')}
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent>
        {teams && teams.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center gap-3 p-4 rounded-sm bg-secondary/50 border border-border hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <Avatar className="h-12 w-12 rounded-sm">
                  <AvatarImage src={team.logo_url || undefined} className="object-cover" />
                  <AvatarFallback className="rounded-sm bg-primary/20 text-lg font-bold font-display">
                    {team.tag.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-display font-medium truncate">{team.name}</p>
                    {team.role === "captain" && (
                      <Crown className="h-3.5 w-3.5 text-warning shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">[{team.tag}] • {team.role}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t('playerProfile.noTeams', 'Not a member of any team yet.')}</p>
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
