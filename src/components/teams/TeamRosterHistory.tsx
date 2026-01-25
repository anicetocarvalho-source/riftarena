import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { History, UserPlus, UserMinus, LogOut, ArrowUp, ArrowDown } from "lucide-react";
import { useTeamHistory, TeamMemberHistory } from "@/hooks/useTeamHistory";
import { cn } from "@/lib/utils";

interface TeamRosterHistoryProps {
  teamId: string;
}

const getActionConfig = (action: TeamMemberHistory["action"]) => {
  switch (action) {
    case "joined":
      return { 
        icon: UserPlus, 
        label: "Joined", 
        color: "text-success",
        bgColor: "bg-success/10"
      };
    case "left":
      return { 
        icon: LogOut, 
        label: "Left", 
        color: "text-muted-foreground",
        bgColor: "bg-muted/50"
      };
    case "removed":
      return { 
        icon: UserMinus, 
        label: "Removed", 
        color: "text-destructive",
        bgColor: "bg-destructive/10"
      };
    case "promoted":
      return { 
        icon: ArrowUp, 
        label: "Promoted", 
        color: "text-warning",
        bgColor: "bg-warning/10"
      };
    case "demoted":
      return { 
        icon: ArrowDown, 
        label: "Demoted", 
        color: "text-orange-400",
        bgColor: "bg-orange-400/10"
      };
    default:
      return { 
        icon: History, 
        label: action, 
        color: "text-muted-foreground",
        bgColor: "bg-muted/50"
      };
  }
};

export const TeamRosterHistory = ({ teamId }: TeamRosterHistoryProps) => {
  const { data: history, isLoading } = useTeamHistory(teamId);

  if (isLoading) {
    return (
      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Roster History
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 bg-secondary/50 rounded-lg animate-pulse" />
            ))}
          </div>
        </RiftCardContent>
      </RiftCard>
    );
  }

  return (
    <RiftCard>
      <RiftCardHeader>
        <RiftCardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Roster History
        </RiftCardTitle>
      </RiftCardHeader>
      <RiftCardContent>
        {!history || history.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No roster changes recorded yet
          </p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
            {history.map((entry) => {
              const config = getActionConfig(entry.action);
              const Icon = config.icon;
              
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg"
                >
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full",
                    config.bgColor
                  )}>
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.user?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {entry.user?.username?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">
                        {entry.user?.username || "Unknown"}
                      </span>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", config.color)}
                      >
                        {config.label}
                      </Badge>
                      {entry.role && entry.role !== "member" && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {entry.role}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </RiftCardContent>
    </RiftCard>
  );
};
