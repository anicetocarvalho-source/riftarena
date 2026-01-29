import { useState } from "react";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Tournament, TournamentStatus } from "@/types/tournament";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUpdateTournament, useUpdateTournamentStatus } from "@/hooks/useTournaments";
import { Settings, Calendar as CalendarIcon, DollarSign, Users, FileText, Save, X, Edit, Ban, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TournamentSettingsTabProps {
  tournament: Tournament;
}

export const TournamentSettingsTab = ({ tournament }: TournamentSettingsTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const updateTournament = useUpdateTournament();
  const updateStatus = useUpdateTournamentStatus();
  
  // Form state
  const [name, setName] = useState(tournament.name);
  const [description, setDescription] = useState(tournament.description || "");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(tournament.start_date));
  const [endDate, setEndDate] = useState<Date | undefined>(
    tournament.end_date ? new Date(tournament.end_date) : undefined
  );
  const [registrationDeadline, setRegistrationDeadline] = useState<Date | undefined>(
    tournament.registration_deadline ? new Date(tournament.registration_deadline) : undefined
  );
  const [prizePool, setPrizePool] = useState(tournament.prize_pool.toString());
  const [registrationFee, setRegistrationFee] = useState(tournament.registration_fee.toString());
  const [maxParticipants, setMaxParticipants] = useState(tournament.max_participants.toString());
  const [rules, setRules] = useState(tournament.rules || "");

  const canEdit = tournament.status === "draft" || tournament.status === "registration";
  const canCancel = tournament.status !== "cancelled" && tournament.status !== "completed";

  const handleCancelTournament = async () => {
    await updateStatus.mutateAsync({ id: tournament.id, status: "cancelled" });
  };

  const handleSave = async () => {
    await updateTournament.mutateAsync({
      id: tournament.id,
      name,
      description: description || null,
      start_date: startDate?.toISOString() || tournament.start_date,
      end_date: endDate?.toISOString() || null,
      registration_deadline: registrationDeadline?.toISOString() || null,
      prize_pool: parseFloat(prizePool) || 0,
      registration_fee: parseFloat(registrationFee) || 0,
      max_participants: parseInt(maxParticipants) || 64,
      rules: rules || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original values
    setName(tournament.name);
    setDescription(tournament.description || "");
    setStartDate(new Date(tournament.start_date));
    setEndDate(tournament.end_date ? new Date(tournament.end_date) : undefined);
    setRegistrationDeadline(tournament.registration_deadline ? new Date(tournament.registration_deadline) : undefined);
    setPrizePool(tournament.prize_pool.toString());
    setRegistrationFee(tournament.registration_fee.toString());
    setMaxParticipants(tournament.max_participants.toString());
    setRules(tournament.rules || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Edit Tournament</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="rift" 
              onClick={handleSave}
              disabled={updateTournament.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateTournament.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Tournament Details
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tournament name"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Game</p>
                <p className="font-medium">{tournament.game?.icon} {tournament.game?.name}</p>
                <p className="text-xs text-muted-foreground">(Cannot be changed)</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tournament description"
                rows={3}
              />
            </div>
          </RiftCardContent>
        </RiftCard>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              Schedule
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Registration Deadline (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !registrationDeadline && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {registrationDeadline ? format(registrationDeadline, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationDeadline}
                      onSelect={setRegistrationDeadline}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
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
              <div className="space-y-2">
                <Label htmlFor="prizePool">Prize Pool ($)</Label>
                <Input
                  id="prizePool"
                  type="number"
                  value={prizePool}
                  onChange={(e) => setPrizePool(e.target.value)}
                  min="0"
                  step="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationFee">Registration Fee ($)</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  min="0"
                  step="1"
                />
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
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="2"
                max="256"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 8, 16, 32, or 64 for optimal bracket generation
              </p>
            </div>
          </RiftCardContent>
        </RiftCard>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Rules
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="space-y-2">
              <Label htmlFor="rules">Tournament Rules</Label>
              <Textarea
                id="rules"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                placeholder="Enter tournament rules..."
                rows={6}
              />
            </div>
          </RiftCardContent>
        </RiftCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          {!canEdit && tournament.status !== "cancelled" && (
            <div className="bg-muted/50 border border-border rounded-sm p-3 text-sm text-muted-foreground">
              Tournament editing is disabled for tournaments in <strong>{tournament.status}</strong> status.
            </div>
          )}
          {tournament.status === "cancelled" && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">This tournament has been cancelled.</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="rift" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Tournament
            </Button>
          )}
          
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Ban className="h-4 w-4" />
                  Cancel Tournament
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Cancel Tournament
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel <strong>{tournament.name}</strong>? 
                    This action cannot be undone. All registrations will be affected and 
                    participants will be notified.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Tournament</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelTournament}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updateStatus.isPending ? "Cancelling..." : "Yes, Cancel Tournament"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

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
            <CalendarIcon className="h-5 w-5 text-primary" />
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