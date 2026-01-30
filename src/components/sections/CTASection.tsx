import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Trophy, BarChart3, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function CTASection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Trophy,
      titleKey: "cta.features.eliteTournaments",
      descKey: "cta.features.eliteTournamentsDesc",
    },
    {
      icon: BarChart3,
      titleKey: "cta.features.realTimeRankings",
      descKey: "cta.features.realTimeRankingsDesc",
    },
    {
      icon: Shield,
      titleKey: "cta.features.fairPlay",
      descKey: "cta.features.fairPlayDesc",
    },
    {
      icon: Zap,
      titleKey: "cta.features.instantMatchmaking",
      descKey: "cta.features.instantMatchmakingDesc",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-rift opacity-50" />
      
      <div className="container relative">
        <div className="mx-auto max-w-4xl">
          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.titleKey}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-sm border border-border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(feature.descKey)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
              {t('cta.ready')} <span className="text-gradient-purple">{t('cta.compete')}</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {t('cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button variant="rift" size="xl">
                  {t('cta.createAccount')}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/games">
                <Button variant="rift-outline" size="xl">
                  {t('cta.viewGames')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
