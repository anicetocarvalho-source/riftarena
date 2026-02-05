import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGames, useCreateTournament } from "@/hooks/useTournaments";
import { TournamentRulesBuilder } from "@/components/tournaments/rules";
import { TournamentBannerUpload } from "@/components/tournaments/TournamentBannerUpload";
import { PrizeDistributionEditor, PrizeDistribution } from "@/components/tournaments/PrizeDistributionEditor";
import { ArrowLeft, Trophy, Calendar, DollarSign, Users, Loader2, FileText } from "lucide-react";
import { z } from "zod";

// Schema is defined inside the component to access translations

const CreateTournament = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: games, isLoading: gamesLoading } = useGames();
  const createTournament = useCreateTournament();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const createTournamentSchema = z.object({
    name: z.string().trim()
      .min(1, t('createTournament.validation.nameRequired'))
      .min(3, t('createTournament.validation.nameMin'))
      .max(100, t('createTournament.validation.nameMax')),
    game_id: z.string().min(1, t('createTournament.validation.gameRequired')),
    description: z.string().max(2000, t('createTournament.validation.descriptionMax')),
    start_date: z.string().min(1, t('createTournament.validation.startDateRequired')),
    end_date: z.string(),
    registration_deadline: z.string(),
    prize_pool: z.number().min(0, t('createTournament.validation.prizePoolMin')),
    registration_fee: z.number().min(0, t('createTournament.validation.registrationFeeMin')),
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    game_id: "",
    prize_pool: 0,
    max_participants: 64,
    registration_fee: 0,
    registration_deadline: "",
    start_date: "",
    end_date: "",
    rules: "",
    bracket_type: "single_elimination",
    is_team_based: false,
    team_size: 5,
    banner_url: "",
    prize_distribution: { first: 50, second: 30, third: 20 } as PrizeDistribution,
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isOrganizer && !isAdmin)) {
    navigate("/dashboard");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    // Validate required fields
    const validation = createTournamentSchema.safeParse({
      name: formData.name,
      game_id: formData.game_id,
      description: formData.description,
      start_date: formData.start_date,
      end_date: formData.end_date,
      registration_deadline: formData.registration_deadline,
      prize_pool: Number(formData.prize_pool),
      registration_fee: Number(formData.registration_fee),
    });

    const fieldErrors: Record<string, string> = {};

    if (!validation.success) {
      validation.error.errors.forEach((err) => {
        const field = err.path[0] as string;
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
    }

    // Additional date cross-validations
    if (formData.end_date && formData.start_date && new Date(formData.end_date) <= new Date(formData.start_date)) {
      if (!fieldErrors.end_date) fieldErrors.end_date = t('createTournament.validation.endDateAfterStart');
    }
    if (formData.registration_deadline && formData.start_date && new Date(formData.registration_deadline) >= new Date(formData.start_date)) {
      if (!fieldErrors.registration_deadline) fieldErrors.registration_deadline = t('createTournament.validation.deadlineBeforeStart');
    }

    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors(fieldErrors);
      return;
    }
    
    try {
      const tournament = await createTournament.mutateAsync({
        ...formData,
        prize_pool: Number(formData.prize_pool),
        max_participants: Number(formData.max_participants),
        registration_fee: Number(formData.registration_fee),
        registration_deadline: formData.registration_deadline || undefined,
        end_date: formData.end_date || undefined,
        banner_url: formData.banner_url || undefined,
        prize_distribution: formData.prize_distribution,
      });
      navigate(`/tournaments/manage/${tournament.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string, value: string | number | PrizeDistribution) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('createTournament.backToDashboard')}
            </Button>
            <Badge variant="default" className="mb-4">{t('createTournament.badge')}</Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide mb-2">
              {t('createTournament.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('createTournament.subtitle')}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    {t('createTournament.basicInfo')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('createTournament.tournamentName')} *</Label>
                      <Input
                        id="name"
                        placeholder={t('createTournament.tournamentNamePlaceholder')}
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                      />
                      {formErrors.name && (
                        <p className="text-xs text-destructive">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="game">{t('createTournament.game')} *</Label>
                      <Select
                        value={formData.game_id}
                        onValueChange={(value) => handleChange("game_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={gamesLoading ? t('createTournament.loadingGames') : t('createTournament.selectGame')} />
                        </SelectTrigger>
                        <SelectContent>
                          {games?.map((game) => (
                            <SelectItem key={game.id} value={game.id}>
                              {game.icon} {game.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.game_id && (
                        <p className="text-xs text-destructive">{formErrors.game_id}</p>
                      )}
                    </div>
                  </div>
                  {/* Banner Upload */}
                  <TournamentBannerUpload
                    value={formData.banner_url}
                    onChange={(url) => handleChange("banner_url", url)}
                  />
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('createTournament.description')}</Label>
                    <Textarea
                      id="description"
                      placeholder={t('createTournament.descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={3}
                      maxLength={2000}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-destructive">{formErrors.description}</p>
                    )}
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Tournament Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {t('createTournament.tournamentSettings')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="max_participants">{t('createTournament.maxParticipants')} *</Label>
                      <Select
                        value={String(formData.max_participants)}
                        onValueChange={(value) => handleChange("max_participants", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[8, 16, 32, 64, 128, 256].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {t('createTournament.participants')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bracket_type">{t('createTournament.bracketType')} *</Label>
                      <Select
                        value={formData.bracket_type}
                        onValueChange={(value) => handleChange("bracket_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single_elimination">{t('createTournament.singleElimination')}</SelectItem>
                          <SelectItem value="double_elimination">{t('createTournament.doubleElimination')}</SelectItem>
                          <SelectItem value="round_robin">{t('createTournament.roundRobin')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Prize & Fees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    {t('createTournament.prizeFees')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="prize_pool">{t('createTournament.prizePool')}</Label>
                      <Input
                        id="prize_pool"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.prize_pool}
                        onChange={(e) => handleChange("prize_pool", e.target.value)}
                      />
                      {formErrors.prize_pool && (
                        <p className="text-xs text-destructive">{formErrors.prize_pool}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration_fee">{t('createTournament.registrationFee')}</Label>
                      <Input
                        id="registration_fee"
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formData.registration_fee}
                        onChange={(e) => handleChange("registration_fee", e.target.value)}
                      />
                      {formErrors.registration_fee && (
                        <p className="text-xs text-destructive">{formErrors.registration_fee}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Prize Distribution */}
                  <PrizeDistributionEditor
                    value={formData.prize_distribution}
                    onChange={(value) => handleChange("prize_distribution", value)}
                    prizePool={Number(formData.prize_pool)}
                  />
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    {t('createTournament.schedule')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="start_date">{t('createTournament.startDate')} *</Label>
                      <Input
                        id="start_date"
                        type="datetime-local"
                        value={formData.start_date}
                        onChange={(e) => handleChange("start_date", e.target.value)}
                      />
                      {formErrors.start_date && (
                        <p className="text-xs text-destructive">{formErrors.start_date}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">{t('createTournament.endDate')}</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => handleChange("end_date", e.target.value)}
                      />
                      {formErrors.end_date && (
                        <p className="text-xs text-destructive">{formErrors.end_date}</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="registration_deadline">{t('createTournament.registrationDeadline')}</Label>
                      <Input
                        id="registration_deadline"
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) => handleChange("registration_deadline", e.target.value)}
                      />
                      {formErrors.registration_deadline && (
                        <p className="text-xs text-destructive">{formErrors.registration_deadline}</p>
                      )}
                    </div>
                  </div>
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-8"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    {t('createTournament.rulesGuidelines')}
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <TournamentRulesBuilder
                    value={formData.rules}
                    onChange={(value) => handleChange("rules", value)}
                    bracketType={formData.bracket_type}
                    isTeamBased={formData.is_team_based}
                    teamSize={formData.team_size}
                  />
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button
                type="button"
                variant="rift-outline"
                onClick={() => navigate("/dashboard")}
              >
                {t('createTournament.cancel')}
              </Button>
              <Button
                type="submit"
                variant="rift"
                disabled={createTournament.isPending}
              >
                {createTournament.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('createTournament.creating')}
                  </>
                ) : (
                  <>
                    <Trophy className="mr-2 h-4 w-4" />
                    {t('createTournament.create')}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateTournament;
