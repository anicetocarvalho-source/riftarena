import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { 
  SiSamsung, 
  SiRedbull, 
  SiIntel, 
  SiRazer, 
  SiMonster, 
  SiNike 
} from "@icons-pack/react-simple-icons";
import { ComponentType } from "react";

interface Sponsor {
  name: string;
  Icon: ComponentType<{ className?: string }>;
  tier: "platinum" | "gold" | "silver";
}

const sponsors: Sponsor[] = [
  { name: "Samsung", Icon: SiSamsung, tier: "platinum" },
  { name: "Red Bull", Icon: SiRedbull, tier: "platinum" },
  { name: "Intel", Icon: SiIntel, tier: "gold" },
  { name: "Razer", Icon: SiRazer, tier: "gold" },
  { name: "Monster", Icon: SiMonster, tier: "silver" },
  { name: "Nike", Icon: SiNike, tier: "silver" },
];

export function CurrentSponsorsGrid() {
  const { t } = useTranslation();

  return (
    <section className="py-16 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge variant="outline" className="mb-4">
          {t("sponsors.currentPartners.badge")}
        </Badge>
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
          {t("sponsors.currentPartners.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("sponsors.currentPartners.description")}
        </p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {sponsors.map((sponsor, index) => (
          <motion.div
            key={sponsor.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group flex flex-col items-center justify-center p-6 rounded-sm border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <sponsor.Icon className="h-12 w-auto text-muted-foreground group-hover:text-foreground transition-colors mb-3" />
            <Badge variant={sponsor.tier} size="sm">
              {t(`sponsors.${sponsor.tier}`)}
            </Badge>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
