import { useState } from "react";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TournamentMatch, TournamentStatus, MatchStatus } from "@/types/tournament";
import { Loader2, Trophy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface MatchesTabProps {
  matches: TournamentMatch[];
  isLoading: boolean;
  tournamentId: string;
  onUpdateResult: (matchId: string, winnerId: string, p1Score: number, p2Score: number) => void;
  isUpdating: boolean;
  tournamentStatus: TournamentStatus;
}

export const MatchesTab = ({
  matches,
  isLoading,
  tournamentId,
  onUpdateResult,
  isUpdating,
  tournamentStatus,
}: MatchesTabProps) => {
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);
  const [p1Score, setP1Score] = useState("");
  const [p2Score, setP2Score] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingMatches = matches.filter(m => 
    m.status === "pending" && m.participant1_id && m.participant2_id
  );
  const completedMatches = matches.filter(m => m.status === "completed");

  const getStatusBadge = (status: MatchStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="diamond">Completed</Badge>;
      case "in_progress":
        return <Badge variant="gold">In Progress</Badge>;
      case "disputed":
        return <Badge variant="destructive">Disputed</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const handleSubmitResult = () => {
    if (!selectedMatch) return;
    
    const score1 = parseInt(p1Score) || 0;
    const score2 = parseInt(p2Score) || 0;
    const winnerId = score1 > score2 
      ? selectedMatch.participant1_id! 
      : selectedMatch.participant2_id!;
    
    onUpdateResult(selectedMatch.id, winnerId, score1, score2);
    setSelectedMatch(null);
    setP1Score("");
    setP2Score("");
  };

  const openResultDialog = (match: TournamentMatch) => {
    setSelectedMatch(match);
    setP1Score(match.participant1_score?.toString() || "");
    setP2Score(match.participant2_score?.toString() || "");
  };

  return (
    <>
      <div className="space-y-6">
        {/* Pending Matches */}
        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Matches Awaiting Results ({pendingMatches.length})
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            {pendingMatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No matches awaiting results
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Round {match.round}, Match {match.match_number}
                      </div>
                      <div className="font-medium">
                        {match.participant1?.username || "TBD"} 
                        <span className="text-muted-foreground mx-2">vs</span>
                        {match.participant2?.username || "TBD"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(match.status)}
                      {tournamentStatus === "live" && (
                        <Button
                          size="sm"
                          variant="rift"
                          onClick={() => openResultDialog(match)}
                        >
                          Submit Result
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </RiftCardContent>
        </RiftCard>

        {/* Completed Matches */}
        {completedMatches.length > 0 && (
          <RiftCard>
            <RiftCardHeader>
              <RiftCardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                Completed Matches ({completedMatches.length})
              </RiftCardTitle>
            </RiftCardHeader>
            <RiftCardContent>
              <div className="space-y-3">
                {completedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        Round {match.round}, Match {match.match_number}
                      </div>
                      <div className="font-medium">
                        <span className={match.winner_id === match.participant1_id ? "text-primary" : ""}>
                          {match.participant1?.username}
                        </span>
                        <span className="text-muted-foreground mx-2">
                          {match.participant1_score} - {match.participant2_score}
                        </span>
                        <span className={match.winner_id === match.participant2_id ? "text-primary" : ""}>
                          {match.participant2?.username}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">
                        Winner: {match.winner?.username}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </RiftCardContent>
          </RiftCard>
        )}
      </div>

      {/* Result Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Match Result</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{selectedMatch.participant1?.username}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={p1Score}
                    onChange={(e) => setP1Score(e.target.value)}
                    placeholder="Score"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{selectedMatch.participant2?.username}</Label>
                  <Input
                    type="number"
                    min="0"
                    value={p2Score}
                    onChange={(e) => setP2Score(e.target.value)}
                    placeholder="Score"
                  />
                </div>
              </div>
              {p1Score && p2Score && p1Score !== p2Score && (
                <p className="text-sm text-muted-foreground">
                  Winner: <span className="text-primary font-medium">
                    {parseInt(p1Score) > parseInt(p2Score) 
                      ? selectedMatch.participant1?.username 
                      : selectedMatch.participant2?.username}
                  </span>
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedMatch(null)}>
              Cancel
            </Button>
            <Button 
              variant="rift" 
              onClick={handleSubmitResult}
              disabled={isUpdating || !p1Score || !p2Score || p1Score === p2Score}
            >
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
