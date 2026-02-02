import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Crown, Swords, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAchievementSound } from "@/hooks/useAchievementSound";
import { RivalOvertakeData } from "@/hooks/useRivalOvertakeCelebration";

interface RivalOvertakeCelebrationProps {
  data: RivalOvertakeData;
  onDismiss: () => void;
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

export function RivalOvertakeCelebration({ data, onDismiss }: RivalOvertakeCelebrationProps) {
  const { t } = useTranslation();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showContent, setShowContent] = useState(false);
  const { playAchievementSound } = useAchievementSound();

  // Generate confetti pieces
  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    for (let i = 0; i < 40; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.3,
        duration: 2 + Math.random() * 1.5,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 5 + Math.random() * 6,
        rotation: Math.random() * 360,
      });
    }
    setConfetti(pieces);

    // Show main content after initial burst and play sound
    const timer = setTimeout(() => {
      setShowContent(true);
      playAchievementSound();
    }, 200);
    return () => clearTimeout(timer);
  }, [playAchievementSound]);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm overflow-hidden"
      onClick={onDismiss}
    >
      {/* Close button */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors z-20"
      >
        <X className="h-5 w-5 text-muted-foreground" />
      </button>

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
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute w-[500px] h-[500px] bg-success/30 rounded-full blur-[100px]"
      />

      {/* Main Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 text-center px-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Crown Icon */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="mb-4"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success/30 to-success/10 border-2 border-success/50"
              >
                <Crown className="h-10 w-10 text-success" />
              </motion.div>
            </motion.div>

            {/* Overtake Badge */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/40 mb-4"
            >
              <Swords className="h-4 w-4 text-success" />
              <span className="text-sm font-display uppercase tracking-wider text-success">
                {t('rankings.rivalOvertaken', 'Rival Ultrapassado!')}
              </span>
            </motion.div>

            {/* Main Message */}
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-display text-3xl md:text-4xl font-bold mb-3"
            >
              {t('rankings.youPassed', 'Ultrapassaste')}
              <br />
              <span className="text-primary">{data.rivalName}</span>
            </motion.h2>

            {/* Position info */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-6"
            >
              <div className="inline-block p-4 rounded-lg bg-card border border-border">
                <div className="flex items-center justify-center gap-4">
                  <TrendingUp className="h-5 w-5 text-success" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {t('rankings.newPosition', 'Nova Posição')}
                    </p>
                    <p className="font-display text-2xl font-bold text-success">
                      #{data.newPosition}
                    </p>
                  </div>
                  {data.gameName && (
                    <>
                      <div className="h-8 w-px bg-border" />
                      <div className="text-left">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">
                          {t('rankings.game', 'Jogo')}
                        </p>
                        <p className="font-display text-lg font-semibold">
                          {data.gameName}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                variant="rift"
                size="lg"
                onClick={onDismiss}
                className="px-8"
              >
                {t('common.continue', 'Continuar')}
              </Button>
            </motion.div>

            {/* Motivational tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-sm text-muted-foreground"
            >
              {t('rankings.keepClimbing', 'Continua a subir no ranking!')}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
