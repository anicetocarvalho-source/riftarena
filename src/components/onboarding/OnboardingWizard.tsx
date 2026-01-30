import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { 
  ChevronRight, ChevronLeft, X, Gamepad2, Trophy, 
  Users, Star, Sparkles, Target, Shield, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface OnboardingWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface Game {
  id: string;
  name: string;
  icon: string;
}

const TOTAL_STEPS = 4;

export function OnboardingWizard({ onComplete, onSkip }: OnboardingWizardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  // Fetch games
  const { data: games } = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase.from("games").select("*");
      if (error) throw error;
      return data as Game[];
    },
  });

  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
      // Save step progress
      if (user) {
        supabase
          .from("profiles")
          .update({ onboarding_step: currentStep + 1 })
          .eq("id", user.id)
          .then(() => {});
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    try {
      await supabase
        .from("profiles")
        .update({ 
          onboarding_completed: true,
          onboarding_step: TOTAL_STEPS 
        })
        .eq("id", user.id);
      
      toast.success(t('onboarding.messages.welcomeSuccess'));
      onComplete();
    } catch (error) {
      toast.error(t('onboarding.messages.completeError'));
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", user.id);
      onSkip();
    } catch (error) {
      onSkip();
    }
  };

  const toggleGame = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  const steps = [
    // Step 0: Welcome
    {
      title: t('onboarding.welcome.title'),
      subtitle: t('onboarding.welcome.subtitle'),
      content: (
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <Sparkles className="h-16 w-16 text-primary-foreground" />
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
              />
            </div>
          </motion.div>
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              {t('onboarding.welcome.description')}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {t('onboarding.welcome.duration')}
            </p>
          </div>
        </div>
      ),
    },
    // Step 1: Platform Features
    {
      title: t('onboarding.features.title'),
      subtitle: t('onboarding.features.subtitle'),
      content: (
        <div className="grid gap-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold">{t('onboarding.features.tournaments')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.features.tournamentsDesc')}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-success/10 text-success">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold">{t('onboarding.features.ranking')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.features.rankingDesc')}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-warning/10 text-warning">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display font-semibold">{t('onboarding.features.teams')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('onboarding.features.teamsDesc')}
              </p>
            </div>
          </motion.div>
        </div>
      ),
    },
    // Step 2: Select Games
    {
      title: t('onboarding.games.title'),
      subtitle: t('onboarding.games.subtitle'),
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {games?.map((game) => (
              <motion.button
                key={game.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={() => toggleGame(game.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                  selectedGames.includes(game.id)
                    ? "border-primary bg-primary/10"
                    : "border-border bg-secondary/30 hover:border-primary/50"
                )}
              >
                <span className="text-2xl">{game.icon}</span>
                <span className="font-display text-sm">{game.name}</span>
                {selectedGames.includes(game.id) && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <Star className="h-4 w-4 text-primary fill-primary" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">
            {t('onboarding.games.changeNote')}
          </p>
        </div>
      ),
    },
    // Step 3: Ready to Start
    {
      title: t('onboarding.ready.title'),
      subtitle: t('onboarding.ready.subtitle'),
      content: (
        <div className="space-y-6 text-center">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-success to-success/50 flex items-center justify-center">
                <Zap className="h-12 w-12 text-success-foreground" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-success/20"
              />
            </div>
          </motion.div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('onboarding.ready.nextSteps')}
            </p>
            
            <div className="grid gap-2 text-left">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm">{t('onboarding.ready.completeProfile')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Trophy className="h-5 w-5 text-warning" />
                <span className="text-sm">{t('onboarding.ready.exploreTournaments')}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                <Users className="h-5 w-5 text-success" />
                <span className="text-sm">{t('onboarding.ready.joinTeam')}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <RiftCard glow className="w-full max-w-lg">
        <RiftCardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                {t('onboarding.step', { current: currentStep + 1, total: TOTAL_STEPS })}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-1 mb-6" />

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-8"
            >
              <h2 className="font-display text-2xl font-bold mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {steps[currentStep].subtitle}
              </p>
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={cn(currentStep === 0 && "invisible")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('onboarding.navigation.previous')}
            </Button>

            {currentStep < TOTAL_STEPS - 1 ? (
              <Button variant="rift" onClick={handleNext}>
                {t('onboarding.navigation.next')}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button 
                variant="rift" 
                onClick={handleComplete}
                disabled={isCompleting}
              >
                {isCompleting ? t('onboarding.navigation.saving') : t('onboarding.navigation.start')}
                <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          {/* Skip link */}
          <div className="text-center mt-4">
            <button 
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('onboarding.navigation.skip')}
            </button>
          </div>
        </RiftCardContent>
      </RiftCard>
    </motion.div>
  );
}
