import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { TrendingUp, Users, Eye, Quote } from "lucide-react";
import { 
  SiSamsung, 
  SiRedbull, 
  SiRazer 
} from "@icons-pack/react-simple-icons";
import { ComponentType } from "react";

interface CaseStudy {
  id: string;
  brand: string;
  Icon: ComponentType<{ className?: string }>;
  tier: string;
  quote: string;
  author: string;
  role: string;
  results: {
    label: string;
    value: string;
    icon: typeof TrendingUp;
  }[];
}

const caseStudies: CaseStudy[] = [
  {
    id: "samsung",
    brand: "Samsung",
    Icon: SiSamsung,
    tier: "Platinum",
    quote: "RIFT has become our primary channel for reaching the competitive gaming community. The engagement metrics exceeded our expectations.",
    author: "Maria Santos",
    role: "Head of Gaming Partnerships",
    results: [
      { label: "Brand Impressions", value: "2.4M+", icon: Eye },
      { label: "Community Reach", value: "180K", icon: Users },
      { label: "Engagement Rate", value: "+340%", icon: TrendingUp },
    ],
  },
  {
    id: "redbull",
    brand: "Red Bull",
    Icon: SiRedbull,
    tier: "Platinum",
    quote: "The tournament co-hosting feature allowed us to create authentic brand experiences that resonate with esports fans.",
    author: "João Costa",
    role: "Esports Marketing Manager",
    results: [
      { label: "Event Attendance", value: "45K+", icon: Users },
      { label: "Stream Views", value: "1.8M", icon: Eye },
      { label: "Social Mentions", value: "+520%", icon: TrendingUp },
    ],
  },
  {
    id: "razer",
    brand: "Razer",
    Icon: SiRazer,
    tier: "Gold",
    quote: "The analytics dashboard gives us real-time insights into campaign performance. It's become essential for our esports strategy.",
    author: "Ana Ferreira",
    role: "Digital Marketing Lead",
    results: [
      { label: "Product Awareness", value: "+280%", icon: TrendingUp },
      { label: "Click-through Rate", value: "4.2%", icon: Eye },
      { label: "New Customers", value: "12K+", icon: Users },
    ],
  },
];

export function SponsorCaseStudies() {
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
          {t("sponsors.caseStudies.badge")}
        </Badge>
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
          {t("sponsors.caseStudies.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("sponsors.caseStudies.description")}
        </p>
      </motion.div>

      <div className="grid gap-8">
        {caseStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <RiftCard>
              <RiftCardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left: Quote & Brand */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <study.Icon className="h-10 w-auto text-muted-foreground" />
                      <Badge variant={study.tier.toLowerCase() as "platinum" | "gold"}>
                        {t(`sponsors.${study.tier.toLowerCase()}`)}
                      </Badge>
                    </div>

                    <div className="relative">
                      <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                      <blockquote className="pl-6 text-lg italic text-foreground/90">
                        "{study.quote}"
                      </blockquote>
                    </div>

                    <div className="pl-6">
                      <p className="font-display font-bold">{study.author}</p>
                      <p className="text-sm text-muted-foreground">{study.role}</p>
                    </div>
                  </div>

                  {/* Right: Results */}
                  <div className="flex flex-col justify-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                      {t("sponsors.caseStudies.results")}
                    </p>
                    <div className="grid gap-4">
                      {study.results.map((result) => (
                        <div
                          key={result.label}
                          className="flex items-center gap-4 p-4 rounded-sm bg-secondary/50 border border-border"
                        >
                          <div className="p-2 rounded-sm bg-primary/10">
                            <result.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-display text-xl font-bold">
                              {result.value}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase">
                              {result.label}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
