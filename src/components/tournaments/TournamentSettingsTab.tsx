import { useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
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
import { PrizeDistributionEditor, PrizeDistribution } from "@/components/tournaments/PrizeDistributionEditor";
import { Settings, Calendar as CalendarIcon, DollarSign, Users, FileText, Save, X, Edit, Ban, AlertTriangle } from "lucide-react";
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
  const [prizeDistribution, setPrizeDistribution] = useState<PrizeDistribution>(
    tournament.prize_distribution || { first: 50, second: 30, third: 20 }
  );
  
  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setFormErrors(prev => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    clearFieldError("startDate");
    clearFieldError("endDate");
    clearFieldError("registrationDeadline");
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    clearFieldError("endDate");
  };

  const handleRegistrationDeadlineChange = (date: Date | undefined) => {
    setRegistrationDeadline(date);
    clearFieldError("registrationDeadline");
  };

  const hasValidationErrors = Object.keys(formErrors).length > 0;

  const canEdit = tournament.status === "draft" || tournament.status === "registration";
  const canCancel = tournament.status !== "cancelled" && tournament.status !== "completed";

  const handleCancelTournament = async () => {
    await updateStatus.mutateAsync({ id: tournament.id, status: "cancelled" });
  };

  const handleSave = async () => {
    const settingsSchema = z.object({
      name: z.string().trim()
        .min(3, t('tournamentSettings.validation.nameMin'))
        .max(100, t('tournamentSettings.validation.nameMax')),
      description: z.string().max(2000, t('tournamentSettings.validation.descriptionMax')).optional(),
      startDate: z.date({ required_error: t('tournamentSettings.validation.startDateRequired') }),
      prizePool: z.number().min(0, t('tournamentSettings.validation.prizePoolMin')),
      registrationFee: z.number().min(0, t('tournamentSettings.validation.registrationFeeMin')),
      maxParticipants: z.number()
        .int(t('tournamentSettings.validation.maxParticipantsInt'))
        .min(2, t('tournamentSettings.validation.maxParticipantsMin'))
        .max(256, t('tournamentSettings.validation.maxParticipantsMax')),
    });

    const parsed = settingsSchema.safeParse({
      name,
      description: description || undefined,
      startDate,
      prizePool: parseFloat(prizePool) || 0,
      registrationFee: parseFloat(registrationFee) || 0,
      maxParticipants: parseInt(maxParticipants) || 0,
    });

    const errors: Record<string, string> = {};

    if (!parsed.success) {
      parsed.error.errors.forEach(err => {
        const field = err.path[0] as string;
        if (!errors[field]) errors[field] = err.message;
      });
    }

    // Cross-field date validations
    if (startDate && endDate && endDate <= startDate) {
      errors.endDate = t('tournamentSettings.endDateError');
    }
    if (startDate && registrationDeadline && registrationDeadline >= startDate) {
      errors.registrationDeadline = t('tournamentSettings.regDeadlineError');
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
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
      prize_distribution: prizeDistribution,
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
    setPrizeDistribution(tournament.prize_distribution || { first: 50, second: 30, third: 20 });
    setFormErrors({});
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
              disabled={updateTournament.isPending}
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
                  onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
                  placeholder={t('tournamentSettings.tournamentName')}
                />
                {formErrors.name && <p className="text-xs text-destructive">{formErrors.name}</p>}
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
                onChange={(e) => { setDescription(e.target.value); clearFieldError("description"); }}
                placeholder={t('tournamentSettings.tournamentDescription')}
                rows={3}
              />
              {formErrors.description && <p className="text-xs text-destructive">{formErrors.description}</p>}
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
                        !startDate && "text-muted-foreground",
                        formErrors.startDate && "border-destructive"
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
                {formErrors.startDate && <p className="text-xs text-destructive">{formErrors.startDate}</p>}
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
                        formErrors.endDate && "border-destructive"
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
                {formErrors.endDate && (
                  <p className="text-xs text-destructive">{formErrors.endDate}</p>
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
                        formErrors.registrationDeadline && "border-destructive"
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
                {formErrors.registrationDeadline && (
                  <p className="text-xs text-destructive">{formErrors.registrationDeadline}</p>
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
                  onChange={(e) => { setPrizePool(e.target.value); clearFieldError("prizePool"); }}
                  min="0"
                  step="100"
                />
                {formErrors.prizePool && <p className="text-xs text-destructive">{formErrors.prizePool}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationFee">{t('tournamentSettings.registrationFee')}</Label>
                <Input
                  id="registrationFee"
                  type="number"
                  value={registrationFee}
                  onChange={(e) => { setRegistrationFee(e.target.value); clearFieldError("registrationFee"); }}
                  min="0"
                  step="1"
                />
                {formErrors.registrationFee && <p className="text-xs text-destructive">{formErrors.registrationFee}</p>}
                    </div>
                  </div>
                  
                  {/* Prize Distribution */}
                  <PrizeDistributionEditor
                    value={prizeDistribution}
                    onChange={setPrizeDistribution}
                    prizePool={parseFloat(prizePool) || 0}
                  />
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
                onChange={(e) => { setMaxParticipants(e.target.value); clearFieldError("maxParticipants"); }}
                min="2"
                max="256"
              />
              {formErrors.maxParticipants && <p className="text-xs text-destructive">{formErrors.maxParticipants}</p>}
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