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
import { ArrowLeft, Trophy, Calendar, DollarSign, Users, Loader2 } from "lucide-react";

const CreateTournament = () => {
  const { t } = useTranslation();
  const { user, isOrganizer, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: games, isLoading: gamesLoading } = useGames();
  const createTournament = useCreateTournament();

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
    
    try {
      const tournament = await createTournament.mutateAsync({
        ...formData,
        prize_pool: Number(formData.prize_pool),
        max_participants: Number(formData.max_participants),
        registration_fee: Number(formData.registration_fee),
        registration_deadline: formData.registration_deadline || undefined,
        end_date: formData.end_date || undefined,
      });
      navigate(`/tournaments/manage/${tournament.id}`);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="game">{t('createTournament.game')} *</Label>
                      <Select
                        value={formData.game_id}
                        onValueChange={(value) => handleChange("game_id", value)}
                        required
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
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">{t('createTournament.description')}</Label>
                    <Textarea
                      id="description"
                      placeholder={t('createTournament.descriptionPlaceholder')}
                      value={formData.description}
                      onChange={(e) => handleChange("description", e.target.value)}
                      rows={3}
                    />
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
                    </div>
                  </div>
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end_date">{t('createTournament.endDate')}</Label>
                      <Input
                        id="end_date"
                        type="datetime-local"
                        value={formData.end_date}
                        onChange={(e) => handleChange("end_date", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="registration_deadline">{t('createTournament.registrationDeadline')}</Label>
                      <Input
                        id="registration_deadline"
                        type="datetime-local"
                        value={formData.registration_deadline}
                        onChange={(e) => handleChange("registration_deadline", e.target.value)}
                      />
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
                  <RiftCardTitle>{t('createTournament.rulesGuidelines')}</RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <div className="space-y-2">
                    <Label htmlFor="rules">{t('createTournament.rules')}</Label>
                    <Textarea
                      id="rules"
                      placeholder={t('createTournament.rulesPlaceholder')}
                      value={formData.rules}
                      onChange={(e) => handleChange("rules", e.target.value)}
                      rows={6}
                    />
                  </div>
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
                disabled={createTournament.isPending || !formData.name || !formData.game_id || !formData.start_date}
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
