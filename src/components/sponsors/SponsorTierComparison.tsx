import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnershipContactForm } from "./PartnershipContactForm";

const tiers = [
  {
    nameKey: "silver",
    features: {
      logoPlacement: true,
      socialMentions: "2/month",
      tournamentSponsorship: "1 regional",
      dashboardAccess: true,
      customBranding: false,
      exclusiveEvents: false,
      coHosting: false,
      prioritySupport: false,
    },
  },
  {
    nameKey: "gold",
    popular: true,
    features: {
      logoPlacement: true,
      socialMentions: "4/month",
      tournamentSponsorship: "3 regional",
      dashboardAccess: true,
      customBranding: true,
      exclusiveEvents: true,
      coHosting: false,
      prioritySupport: false,
    },
  },
  {
    nameKey: "platinum",
    features: {
      logoPlacement: true,
      socialMentions: "unlimited",
      tournamentSponsorship: "unlimited",
      dashboardAccess: true,
      customBranding: true,
      exclusiveEvents: true,
      coHosting: true,
      prioritySupport: true,
    },
  },
];

const featureKeys = [
  "logoPlacement",
  "socialMentions",
  "tournamentSponsorship",
  "dashboardAccess",
  "customBranding",
  "exclusiveEvents",
  "coHosting",
  "prioritySupport",
] as const;

export function SponsorTierComparison() {
  const { t } = useTranslation();

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-primary transition-all duration-300 group-hover:scale-125 group-hover:text-primary group-hover:drop-shadow-[0_0_8px_hsl(262_100%_62%/0.6)]" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/30 transition-opacity duration-300 group-hover:opacity-50" />
      );
    }
    // Translate special values
    if (value === "unlimited") {
      return <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">{t("sponsors.tiers.unlimited")}</span>;
    }
    return <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">{value}</span>;
  };

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge variant="outline" className="mb-4">
          {t("sponsors.tiers.badge")}
        </Badge>
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
          {t("sponsors.tiers.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("sponsors.tiers.description")}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.nameKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ 
              y: -8, 
              scale: 1.02,
              transition: { duration: 0.2, ease: "easeOut" }
            }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`group relative p-6 rounded-sm border flex flex-col cursor-pointer transition-shadow duration-300 ${
              tier.popular
                ? "border-primary bg-primary/5 rift-border-glow hover:shadow-[0_20px_40px_-15px_hsl(262_100%_62%/0.3)]"
                : "border-border bg-card hover:border-primary/50 hover:shadow-[0_15px_30px_-10px_hsl(0_0%_0%/0.5)]"
            }`}
          >
            {tier.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="default" className="uppercase text-xs">
                  {t("sponsors.tiers.mostPopular")}
                </Badge>
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <Badge
                variant={tier.nameKey as "platinum" | "gold" | "silver"}
                className="mb-3"
              >
                {t(`sponsors.${tier.nameKey}`)}
              </Badge>
              <div className="font-display text-3xl font-bold">
                {t(`sponsors.tiers.pricing.${tier.nameKey}.price`)}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {t(`sponsors.tiers.pricing.${tier.nameKey}.period`)}
              </p>
            </div>

            <div className="space-y-3 border-t border-border pt-6">
              {featureKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {t(`sponsors.tiers.features.${key}`)}
                  </span>
                  {renderFeatureValue(tier.features[key])}
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-border mt-auto">
              <PartnershipContactForm defaultTier={tier.nameKey}>
                <Button 
                  variant={tier.popular ? "rift" : "outline"} 
                  className="w-full group"
                >
                  {t("sponsors.tiers.cta")}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </PartnershipContactForm>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
