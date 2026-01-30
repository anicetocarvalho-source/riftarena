import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { TournamentMatch, TournamentRegistration, TournamentStatus } from "@/types/tournament";
import { Loader2, GitBranch, RefreshCw } from "lucide-react";
import { GlossaryTerm } from "@/components/ui/glossary-term";
import { useTranslation } from "react-i18next";

interface BracketTabProps {
  matches: TournamentMatch[];
  isLoading: boolean;
  tournamentId: string;
  registrations: TournamentRegistration[];
  onGenerateBracket: () => void;
  isGenerating: boolean;
  tournamentStatus: TournamentStatus;
}

export const BracketTab = ({
  matches,
  isLoading,
  tournamentId,
  registrations,
  onGenerateBracket,
  isGenerating,
  tournamentStatus,
}: BracketTabProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const confirmedParticipants = registrations.filter(r => r.status === "confirmed");
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

  const getRoundName = (round: number, totalRounds: number) => {
    if (round === totalRounds) return t("bracketTab.finals");
    if (round === totalRounds - 1) return t("bracketTab.semiFinals");
    if (round === totalRounds - 2) return t("bracketTab.quarterFinals");
    return `${t("bracketTab.round")} ${round}`;
  };

  return (
    <RiftCard>
      <RiftCardHeader className="flex flex-row items-center justify-between">
        <RiftCardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" />
          <GlossaryTerm term="bracket" showIcon={false}>{t("bracketTab.title")}</GlossaryTerm>
        </RiftCardTitle>
        {(tournamentStatus === "registration" || tournamentStatus === "live") && (
          <Button
            variant="rift-outline"
            size="sm"
            onClick={onGenerateBracket}
            disabled={isGenerating || confirmedParticipants.length < 2}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {matches.length > 0 ? t("bracketTab.regenerateBracket") : t("bracketTab.generateBracket")}
          </Button>
        )}
      </RiftCardHeader>
      <RiftCardContent>
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {confirmedParticipants.length < 2
                ? t("bracketTab.needParticipants", { count: confirmedParticipants.length })
                : t("bracketTab.noBracket")}
            </p>
            {confirmedParticipants.length >= 2 && (
              <Button
                variant="rift"
                onClick={onGenerateBracket}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("bracketTab.generateBracket")}
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-8 min-w-max py-4">
              {rounds.map((round) => {
                const roundMatches = matches.filter(m => m.round === round);
                return (
                  <div key={round} className="flex flex-col gap-4">
                    <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground text-center">
                      {getRoundName(round, rounds.length)}
                    </h3>
                    <div className="flex flex-col gap-4 justify-around h-full">
                      {roundMatches.map((match) => (
                        <div
                          key={match.id}
                          className="bg-secondary/50 rounded-lg p-3 w-48 border border-border"
                        >
                          <div className="text-xs text-muted-foreground mb-2">
                            {t("bracketTab.match")} {match.match_number}
                          </div>
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner_id === match.participant1_id 
                              ? "bg-primary/20 border border-primary/50" 
                              : "bg-muted/50"
                          }`}>
                            <span className="text-sm truncate">
                              {match.participant1?.username || t("bracketTab.tbd")}
                            </span>
                            {match.participant1_score !== null && (
                              <span className="font-bold">{match.participant1_score}</span>
                            )}
                          </div>
                          <div className="text-center text-xs text-muted-foreground my-1">{t("bracketTab.vs")}</div>
                          <div className={`flex items-center justify-between p-2 rounded ${
                            match.winner_id === match.participant2_id 
                              ? "bg-primary/20 border border-primary/50" 
                              : "bg-muted/50"
                          }`}>
                            <span className="text-sm truncate">
                              {match.participant2?.username || t("bracketTab.tbd")}
                            </span>
                            {match.participant2_score !== null && (
                              <span className="font-bold">{match.participant2_score}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
