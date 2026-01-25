import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Tournament } from "@/types/tournament";
import { Settings, Calendar, DollarSign, Users, FileText } from "lucide-react";
import { format } from "date-fns";

interface TournamentSettingsTabProps {
  tournament: Tournament;
}

export const TournamentSettingsTab = ({ tournament }: TournamentSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Tournament Details
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{tournament.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Game</p>
              <p className="font-medium">{tournament.game?.icon} {tournament.game?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bracket Type</p>
              <p className="font-medium capitalize">{tournament.bracket_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{tournament.status}</p>
            </div>
          </div>
          {tournament.description && (
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="font-medium">{tournament.description}</p>
            </div>
          )}
        </RiftCardContent>
      </RiftCard>

      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Schedule
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">{format(new Date(tournament.start_date), "PPP p")}</p>
            </div>
            {tournament.end_date && (
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{format(new Date(tournament.end_date), "PPP p")}</p>
              </div>
            )}
            {tournament.registration_deadline && (
              <div>
                <p className="text-sm text-muted-foreground">Registration Deadline</p>
                <p className="font-medium">{format(new Date(tournament.registration_deadline), "PPP p")}</p>
              </div>
            )}
          </div>
        </RiftCardContent>
      </RiftCard>

      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Prize & Fees
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Prize Pool</p>
              <p className="font-medium text-xl">${tournament.prize_pool.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration Fee</p>
              <p className="font-medium">${tournament.registration_fee}</p>
            </div>
          </div>
        </RiftCardContent>
      </RiftCard>

      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Capacity
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div>
            <p className="text-sm text-muted-foreground">Max Participants</p>
            <p className="font-medium">{tournament.max_participants}</p>
          </div>
        </RiftCardContent>
      </RiftCard>

      {tournament.rules && (
        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Rules
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <p className="whitespace-pre-wrap">{tournament.rules}</p>
          </RiftCardContent>
        </RiftCard>
      )}
    </div>
  );
};
