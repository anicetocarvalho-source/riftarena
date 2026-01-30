import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const tiers = [
  {
    name: "Silver",
    price: "$5,000",
    priceNote: "per quarter",
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
    name: "Gold",
    price: "$15,000",
    priceNote: "per quarter",
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
    name: "Platinum",
    price: "$40,000",
    priceNote: "per quarter",
    features: {
      logoPlacement: true,
      socialMentions: "Unlimited",
      tournamentSponsorship: "Unlimited",
      dashboardAccess: true,
      customBranding: true,
      exclusiveEvents: true,
      coHosting: true,
      prioritySupport: true,
    },
  },
];

const featureLabels = {
  logoPlacement: "Logo on homepage & streams",
  socialMentions: "Social media mentions",
  tournamentSponsorship: "Tournament sponsorship",
  dashboardAccess: "Analytics dashboard",
  customBranding: "Custom tournament branding",
  exclusiveEvents: "Exclusive partner events",
  coHosting: "Co-hosting opportunities",
  prioritySupport: "Priority support",
};

export function SponsorTierComparison() {
  const { t } = useTranslation();

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-primary" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/30" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
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
            key={tier.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`relative p-6 rounded-sm border ${
              tier.popular
                ? "border-primary bg-primary/5 rift-border-glow"
                : "border-border bg-card"
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
                variant={tier.name.toLowerCase() as "platinum" | "gold" | "silver"}
                className="mb-3"
              >
                {t(`sponsors.${tier.name.toLowerCase()}`)}
              </Badge>
              <div className="font-display text-3xl font-bold">{tier.price}</div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {tier.priceNote}
              </p>
            </div>

            <div className="space-y-3 border-t border-border pt-6">
              {Object.entries(tier.features).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-muted-foreground">
                    {featureLabels[key as keyof typeof featureLabels]}
                  </span>
                  {renderFeatureValue(value)}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
