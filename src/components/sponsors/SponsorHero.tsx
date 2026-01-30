import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function SponsorHero() {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-50" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Badge variant="default" className="mb-6">
            {t("sponsors.hero.badge")}
          </Badge>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide mb-6">
            {t("sponsors.hero.title")}
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t("sponsors.hero.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="rift"
              size="lg"
              onClick={() => {
                window.location.href = "mailto:sponsors@riftarena.com?subject=Partnership%20Inquiry";
                toast.success(t("sponsors.hero.emailOpening"));
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("sponsors.hero.cta")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document.getElementById("tiers")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("sponsors.hero.viewTiers")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 grid grid-cols-3 gap-8"
          >
            {[
              { value: "500K+", label: t("sponsors.hero.stats.reach") },
              { value: "98%", label: t("sponsors.hero.stats.satisfaction") },
              { value: "45+", label: t("sponsors.hero.stats.partners") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
