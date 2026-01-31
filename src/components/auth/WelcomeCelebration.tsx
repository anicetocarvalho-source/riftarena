import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles, Trophy, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAchievementSound } from "@/hooks/useAchievementSound";

interface WelcomeCelebrationProps {
  username: string;
  onContinue: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

const CONFETTI_COLORS = [
  "hsl(262, 100%, 62%)", // Primary purple
  "hsl(262, 100%, 72%)", // Lighter purple
  "hsl(45, 100%, 60%)",  // Gold
  "hsl(142, 71%, 45%)",  // Success green
  "hsl(0, 0%, 100%)",    // White
];

export function WelcomeCelebration({ username, onContinue }: WelcomeCelebrationProps) {
  const { t } = useTranslation();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showContent, setShowContent] = useState(false);
  const { playAchievementSound } = useAchievementSound();

  // Generate confetti pieces
  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
      });
    }
    setConfetti(pieces);

    // Show main content after initial confetti burst and play sound
    const timer = setTimeout(() => {
      setShowContent(true);
      playAchievementSound();
    }, 300);
    return () => clearTimeout(timer);
  }, [playAchievementSound]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm overflow-hidden"
    >
      {/* Confetti Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{ 
              y: -20, 
              x: `${piece.x}vw`,
              rotate: 0,
              opacity: 1 
            }}
            animate={{ 
              y: "110vh",
              rotate: piece.rotation + 720,
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: piece.duration,
              delay: piece.delay,
              ease: "linear",
            }}
            className="absolute top-0"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            }}
          />
        ))}
      </div>

      {/* Radial Glow Background */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute w-[600px] h-[600px] bg-primary/30 rounded-full blur-[120px]"
      />

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 text-center px-6 max-w-md"
          >
            {/* Animated Stars */}
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -left-4"
              >
                <Star className="h-6 w-6 text-warning fill-warning" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-6"
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>

              {/* Welcome Badge */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/40 mb-4"
              >
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-display uppercase tracking-wider text-primary">
                  {t('auth.newPlayer')}
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-display text-4xl md:text-5xl font-bold mb-2 rift-glow-text"
              >
                {t('auth.welcomeToRift')}
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground"
              >
                {username}
              </motion.p>
            </div>

            {/* Bronze Rank Preview */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="mb-8"
            >
              <div className="inline-block p-6 rounded-lg bg-card border border-border relative overflow-hidden">
                {/* Animated scan effect */}
                <div className="absolute inset-0 rift-scan" />
                
                <div className="relative z-10">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 font-display">
                    {t('auth.yourStartingRank')}
                  </p>
                  
                  {/* Bronze Badge */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.div
                      animate={{ 
                        boxShadow: [
                          "0 0 20px hsl(30, 60%, 50%, 0.3)",
                          "0 0 40px hsl(30, 60%, 50%, 0.5)",
                          "0 0 20px hsl(30, 60%, 50%, 0.3)",
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-full rank-bronze flex items-center justify-center"
                    >
                      <Trophy className="h-10 w-10 text-white drop-shadow-lg" />
                    </motion.div>
                  </div>
                  
                  <h3 className="font-display text-2xl font-bold text-[hsl(30,60%,50%)] mb-1">
                    Bronze
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    1000 ELO
                  </p>
                  
                  {/* Progress hint */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {t('auth.nextRank')}: <span className="text-[hsl(0,0%,60%)]">Silver</span> (1200 ELO)
                    </p>
                    <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "0%" }}
                        className="h-full rank-bronze"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button
                variant="rift"
                size="lg"
                onClick={onContinue}
                className="px-8 pulse-purple"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {t('auth.startJourney')}
              </Button>
            </motion.div>

            {/* Motivational tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-6 text-sm text-muted-foreground italic"
            >
              {t('auth.climbRanks')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
