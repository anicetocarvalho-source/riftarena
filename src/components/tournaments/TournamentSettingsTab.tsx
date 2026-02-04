import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { TournamentRulesBuilder } from "@/components/tournaments/rules";
import { TournamentBannerUpload } from "@/components/tournaments/TournamentBannerUpload";
import { Settings, Calendar as CalendarIcon, DollarSign, Users, FileText, Save, X, Edit, Ban, AlertTriangle, Image } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TournamentSettingsTabProps {
  tournament: Tournament;
}

export const TournamentSettingsTab = ({ tournament }: TournamentSettingsTabProps) => {
  const { t } = useTranslation();
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
  const [bannerUrl, setBannerUrl] = useState(tournament.banner_url || "");
  
  // Validation errors
  const [dateErrors, setDateErrors] = useState<{
    endDate?: string;
    registrationDeadline?: string;
  }>({});

  // Validate dates whenever they change
  const validateDates = (start?: Date, end?: Date, regDeadline?: Date) => {
    const errors: { endDate?: string; registrationDeadline?: string } = {};
    
    if (start && end && end <= start) {
      errors.endDate = t('tournamentSettings.endDateError');
    }
    
    if (start && regDeadline && regDeadline >= start) {
      errors.registrationDeadline = t('tournamentSettings.regDeadlineError');
    }
    
    setDateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    validateDates(date, endDate, registrationDeadline);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    validateDates(startDate, date, registrationDeadline);
  };

  const handleRegistrationDeadlineChange = (date: Date | undefined) => {
    setRegistrationDeadline(date);
    validateDates(startDate, endDate, date);
  };

  const hasValidationErrors = Object.keys(dateErrors).length > 0;

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
      banner_url: bannerUrl || null,
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
    setBannerUrl(tournament.banner_url || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{t('tournamentSettings.editTournament')}</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              {t('tournamentSettings.cancel')}
            </Button>
            <Button 
              variant="rift" 
              onClick={handleSave}
              disabled={updateTournament.isPending || hasValidationErrors || !name.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {updateTournament.isPending ? t('tournamentSettings.saving') : t('tournamentSettings.saveChanges')}
            </Button>
          </div>
        </div>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t('tournamentSettings.tournamentDetails')}
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t('tournamentSettings.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('tournamentSettings.tournamentName')}
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('tournamentSettings.game')}</p>
                <p className="font-medium">{tournament.game?.icon} {tournament.game?.name}</p>
                <p className="text-xs text-muted-foreground">{t('tournamentSettings.cannotChange')}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('tournamentSettings.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('tournamentSettings.tournamentDescription')}
                rows={3}
              />
            </div>
            
            {/* Banner Upload */}
            <TournamentBannerUpload
              value={bannerUrl}
              onChange={setBannerUrl}
              tournamentId={tournament.id}
            />
          </RiftCardContent>
        </RiftCard>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {t('tournamentSettings.schedule')}
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{t('tournamentSettings.startDate')}</Label>
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
                      {startDate ? format(startDate, "PPP") : t('tournamentSettings.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>{t('tournamentSettings.endDate')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground",
                        dateErrors.endDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : t('tournamentSettings.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateChange}
                      disabled={(date) => startDate ? date <= startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {dateErrors.endDate && (
                  <p className="text-xs text-destructive">{dateErrors.endDate}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>{t('tournamentSettings.registrationDeadline')}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !registrationDeadline && "text-muted-foreground",
                        dateErrors.registrationDeadline && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {registrationDeadline ? format(registrationDeadline, "PPP") : t('tournamentSettings.pickDate')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={registrationDeadline}
                      onSelect={handleRegistrationDeadlineChange}
                      disabled={(date) => startDate ? date >= startDate : false}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {dateErrors.registrationDeadline && (
                  <p className="text-xs text-destructive">{dateErrors.registrationDeadline}</p>
                )}
              </div>
            </div>
          </RiftCardContent>
        </RiftCard>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              {t('tournamentSettings.prizeFees')}
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prizePool">{t('tournamentSettings.prizePool')}</Label>
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
                <Label htmlFor="registrationFee">{t('tournamentSettings.registrationFee')}</Label>
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
              {t('tournamentSettings.capacity')}
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">{t('tournamentSettings.maxParticipants')}</Label>
              <Input
                id="maxParticipants"
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                min="2"
                max="256"
              />
              <p className="text-xs text-muted-foreground">
                {t('tournamentSettings.capacityRecommendation')}
              </p>
            </div>
          </RiftCardContent>
        </RiftCard>

        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('tournamentSettings.rules')}
            </RiftCardTitle>
          </RiftCardHeader>
          <RiftCardContent>
            <TournamentRulesBuilder
              value={rules}
              onChange={setRules}
              bracketType={tournament.bracket_type}
              isTeamBased={tournament.is_team_based}
              teamSize={tournament.team_size || 5}
            />
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
              {t('tournamentSettings.editingDisabled')} <strong>{tournament.status}</strong>.
            </div>
          )}
          {tournament.status === "cancelled" && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-sm p-3 flex items-center gap-2">
              <Ban className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">{t('tournamentSettings.tournamentCancelled')}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          {canEdit && (
            <Button variant="rift" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('tournamentSettings.editBtn')}
            </Button>
          )}
          
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Ban className="h-4 w-4" />
                  {t('tournamentSettings.cancelTournament')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {t('tournamentSettings.cancelTournamentTitle')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('tournamentSettings.cancelTournamentConfirm')} <strong>{tournament.name}</strong>? 
                    {t('tournamentSettings.cancelTournamentWarning')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('tournamentSettings.keepTournament')}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleCancelTournament}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {updateStatus.isPending ? t('tournamentSettings.cancelling') : t('tournamentSettings.yesCancelTournament')}
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
            {t('tournamentSettings.tournamentDetails')}
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.name')}</p>
              <p className="font-medium">{tournament.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.game')}</p>
              <p className="font-medium">{tournament.game?.icon} {tournament.game?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.bracketType')}</p>
              <p className="font-medium capitalize">{tournament.bracket_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.status')}</p>
              <p className="font-medium capitalize">{tournament.status}</p>
            </div>
          </div>
          {tournament.description && (
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.description')}</p>
              <p className="font-medium">{tournament.description}</p>
            </div>
          )}
        </RiftCardContent>
      </RiftCard>

      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            {t('tournamentSettings.schedule')}
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.startDate')}</p>
              <p className="font-medium">{format(new Date(tournament.start_date), "PPP p")}</p>
            </div>
            {tournament.end_date && (
              <div>
                <p className="text-sm text-muted-foreground">{t('tournamentSettings.endDate')}</p>
                <p className="font-medium">{format(new Date(tournament.end_date), "PPP p")}</p>
              </div>
            )}
            {tournament.registration_deadline && (
              <div>
                <p className="text-sm text-muted-foreground">{t('tournamentSettings.registrationDeadline')}</p>
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
            {t('tournamentSettings.prizeFees')}
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.prizePool')}</p>
              <p className="font-medium text-xl">${tournament.prize_pool.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('tournamentSettings.registrationFee')}</p>
              <p className="font-medium">${tournament.registration_fee}</p>
            </div>
          </div>
        </RiftCardContent>
      </RiftCard>

      <RiftCard>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {t('tournamentSettings.capacity')}
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div>
            <p className="text-sm text-muted-foreground">{t('tournamentSettings.maxParticipants')}</p>
            <p className="font-medium">{tournament.max_participants}</p>
          </div>
        </RiftCardContent>
      </RiftCard>

      {tournament.rules && (
        <RiftCard>
          <RiftCardHeader>
            <RiftCardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              {t('tournamentSettings.rules')}
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