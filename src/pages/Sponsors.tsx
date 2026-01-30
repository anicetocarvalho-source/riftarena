import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, TrendingUp, Users, Trophy, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
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
  id: string;
  name: string;
  Icon: ComponentType<{ className?: string }>;
  tier: string;
  activeCampaigns: number;
  descriptionKey: string;
  stats: { impressions: string; tournaments: number; engagement: string };
}

const sponsors: Sponsor[] = [
  {
    id: "1",
    name: "Samsung",
    Icon: SiSamsung,
    tier: "Platinum",
    activeCampaigns: 3,
    descriptionKey: "Official mobile device partner of RIFT Championship Series.",
    stats: { impressions: "2.4M", tournaments: 12, engagement: "18%" },
  },
  {
    id: "2",
    name: "Red Bull",
    Icon: SiRedbull,
    tier: "Platinum",
    activeCampaigns: 2,
    descriptionKey: "Energy partner fueling champions across all RIFT tournaments.",
    stats: { impressions: "1.8M", tournaments: 8, engagement: "22%" },
  },
  {
    id: "3",
    name: "Intel",
    Icon: SiIntel,
    tier: "Gold",
    activeCampaigns: 1,
    descriptionKey: "Technology partner powering the RIFT gaming infrastructure.",
    stats: { impressions: "950K", tournaments: 5, engagement: "15%" },
  },
  {
    id: "4",
    name: "Razer",
    Icon: SiRazer,
    tier: "Gold",
    activeCampaigns: 2,
    descriptionKey: "Official gaming peripherals partner for RIFT pro players.",
    stats: { impressions: "780K", tournaments: 6, engagement: "21%" },
  },
  {
    id: "5",
    name: "Monster Energy",
    Icon: SiMonster,
    tier: "Silver",
    activeCampaigns: 1,
    descriptionKey: "Energy drink partner for select regional tournaments.",
    stats: { impressions: "420K", tournaments: 3, engagement: "16%" },
  },
  {
    id: "6",
    name: "Nike",
    Icon: SiNike,
    tier: "Silver",
    activeCampaigns: 1,
    descriptionKey: "Apparel partner for RIFT team merchandise.",
    stats: { impressions: "380K", tournaments: 2, engagement: "19%" },
  },
];

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Platinum": return "platinum";
    case "Gold": return "gold";
    case "Silver": return "silver";
    default: return "outline";
  }
};

const Sponsors = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Badge variant="default" className="mb-4">{t('sponsors.badge')}</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              {t('sponsors.title')}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {t('sponsors.description')}
            </p>
          </motion.div>

          {/* Become a Sponsor CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-8 rounded-sm border border-primary/30 bg-primary/5 rift-border-glow"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wide mb-2">
                  {t('sponsors.partnerWithRift')}
                </h2>
                <p className="text-muted-foreground">
                  {t('sponsors.partnerDescription')}
                </p>
              </div>
              <Button 
                variant="rift" 
                size="lg"
                onClick={() => {
                  window.location.href = "mailto:sponsors@riftarena.com?subject=Partnership%20Inquiry";
                  toast.success("Opening email client...");
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                {t('sponsors.contactPartnership')}
              </Button>
            </div>
          </motion.div>

          {/* Sponsors Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <RiftCard className="h-full">
                  <RiftCardContent>
                    {/* Sponsor Header */}
                    <div className="flex items-center justify-between mb-4">
                      <sponsor.Icon className="h-8 w-auto text-muted-foreground" />
                      <Badge variant={getTierColor(sponsor.tier) as any}>
                        {t(`sponsors.${sponsor.tier.toLowerCase()}`)}
                      </Badge>
                    </div>

                    <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-2">
                      {sponsor.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {sponsor.descriptionKey}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-border mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.impressions}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">{t('sponsors.impressions')}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Trophy className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.tournaments}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">{t('sponsors.tournaments')}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Users className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.engagement}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">{t('sponsors.engagement')}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" size="sm">
                        {sponsor.activeCampaigns} {sponsor.activeCampaigns > 1 
                          ? t('sponsors.activeCampaigns') 
                          : t('sponsors.activeCampaign')}
                      </Badge>
                      <Link to={`/tournaments?sponsor=${sponsor.name.toLowerCase()}`}>
                        <Button variant="rift-ghost" size="sm">
                          {t('sponsors.viewTournaments')}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </RiftCardContent>
                </RiftCard>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
