import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RiftLogo } from "@/components/brand/RiftLogo";
import { ChevronRight, Play, Users, Trophy, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="RIFT Arena"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        <div className="absolute inset-0 bg-gradient-rift" />
      </div>

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo & Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <RiftLogo size="xl" className="rift-glow-text" />
            <p className="mt-4 font-display text-xl uppercase tracking-[0.5em] text-muted-foreground">
              Enter the Rift
            </p>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-4xl font-bold uppercase tracking-wide sm:text-5xl lg:text-6xl"
          >
            Where Champions{" "}
            <span className="text-gradient-purple">Compete</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            The premier esports competition platform. Join elite tournaments, 
            climb the global rankings, and prove your dominance in the arena.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link to="/tournaments">
              <Button variant="rift" size="xl" className="pulse-purple">
                Join Tournament
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/rankings">
              <Button variant="rift-outline" size="xl">
                <Trophy className="mr-2 h-5 w-5" />
                View Rankings
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-20 grid grid-cols-3 gap-8 border-t border-border pt-10"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl font-bold">50K+</span>
              </div>
              <p className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">
                Players
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl font-bold">1.2K</span>
              </div>
              <p className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">
                Tournaments
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span className="font-display text-3xl font-bold">$2M+</span>
              </div>
              <p className="mt-1 text-sm uppercase tracking-wider text-muted-foreground">
                Prize Pool
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Scroll</span>
          <div className="h-8 w-px bg-gradient-to-b from-primary to-transparent" />
        </div>
      </motion.div>
    </section>
  );
}
