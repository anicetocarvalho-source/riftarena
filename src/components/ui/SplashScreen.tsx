import { motion } from "framer-motion";
import logoSvg from "@/assets/rift-arena-logo.svg";

interface SplashScreenProps {
  isLoading?: boolean;
}

export function SplashScreen({ isLoading = true }: SplashScreenProps) {
  if (!isLoading) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-rift" />
      
      {/* Animated logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10"
      >
        <motion.img
          src={logoSvg}
          alt="RIFT Arena"
          className="h-48 w-auto md:h-64"
          animate={{
            filter: [
              "drop-shadow(0 0 20px hsl(262 100% 62% / 0.3))",
              "drop-shadow(0 0 40px hsl(262 100% 62% / 0.6))",
              "drop-shadow(0 0 20px hsl(262 100% 62% / 0.3))",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 mt-12 w-48"
      >
        <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/60"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center font-display text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          Loading
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
