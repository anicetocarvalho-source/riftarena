import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TournamentRegistration } from "@/types/tournament";
import { Loader2, Check, X, Users } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RegistrationsTabProps {
  registrations: TournamentRegistration[];
  isLoading: boolean;
  tournamentId: string;
  onUpdateStatus: (id: string, status: string) => void;
  isUpdating: boolean;
}

export const RegistrationsTab = ({
  registrations,
  isLoading,
  tournamentId,
  onUpdateStatus,
  isUpdating,
}: RegistrationsTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="diamond">Confirmed</Badge>;
      case "pending":
        return <Badge variant="default">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <RiftCard>
      <RiftCardHeader>
        <RiftCardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Registrations ({registrations.length})
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent>
        {registrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No registrations yet
          </div>
        ) : (
          <div className="space-y-3">
            {registrations.map((registration) => (
              <div
                key={registration.id}
                className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={registration.user?.avatar_url || undefined} />
                    <AvatarFallback>
                      {registration.user?.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{registration.user?.username || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">
                      Registered {format(new Date(registration.created_at), "PPp")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(registration.status)}
                  {registration.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onUpdateStatus(registration.id, "confirmed")}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onUpdateStatus(registration.id, "rejected")}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {registration.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onUpdateStatus(registration.id, "pending")}
                      disabled={isUpdating}
                    >
                      Undo
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
