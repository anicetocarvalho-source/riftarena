import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { RiftCard, RiftCardContent } from "@/components/ui/rift-card";
import { Button } from "@/components/ui/button";
import { ChevronRight, ExternalLink, TrendingUp, Users, Trophy } from "lucide-react";

const sponsors = [
  {
    id: "1",
    name: "Samsung",
    logo: "SAMSUNG",
    tier: "Platinum",
    activeCampaigns: 3,
    description: "Official mobile device partner of RIFT Championship Series.",
    stats: { impressions: "2.4M", tournaments: 12, engagement: "18%" },
  },
  {
    id: "2",
    name: "Red Bull",
    logo: "REDBULL",
    tier: "Platinum",
    activeCampaigns: 2,
    description: "Energy partner fueling champions across all RIFT tournaments.",
    stats: { impressions: "1.8M", tournaments: 8, engagement: "22%" },
  },
  {
    id: "3",
    name: "Intel",
    logo: "INTEL",
    tier: "Gold",
    activeCampaigns: 1,
    description: "Technology partner powering the RIFT gaming infrastructure.",
    stats: { impressions: "950K", tournaments: 5, engagement: "15%" },
  },
  {
    id: "4",
    name: "Razer",
    logo: "RAZER",
    tier: "Gold",
    activeCampaigns: 2,
    description: "Official gaming peripherals partner for RIFT pro players.",
    stats: { impressions: "780K", tournaments: 6, engagement: "21%" },
  },
  {
    id: "5",
    name: "Monster Energy",
    logo: "MONSTER",
    tier: "Silver",
    activeCampaigns: 1,
    description: "Energy drink partner for select regional tournaments.",
    stats: { impressions: "420K", tournaments: 3, engagement: "16%" },
  },
  {
    id: "6",
    name: "Nike",
    logo: "NIKE",
    tier: "Silver",
    activeCampaigns: 1,
    description: "Apparel partner for RIFT team merchandise.",
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
            <Badge variant="default" className="mb-4">Brand Partners</Badge>
            <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
              Sponsors
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Our partners power the competitive esports ecosystem. 
              Learn about the brands supporting RIFT tournaments and players.
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
                  Partner with RIFT
                </h2>
                <p className="text-muted-foreground">
                  Reach millions of engaged esports fans. Get brand visibility across tournaments, 
                  rankings, and live streams.
                </p>
              </div>
              <Button variant="rift" size="lg">
                Become a Sponsor
                <ExternalLink className="ml-2 h-4 w-4" />
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
                      <span className="font-display text-2xl font-bold tracking-[0.15em] text-muted-foreground">
                        {sponsor.logo}
                      </span>
                      <Badge variant={getTierColor(sponsor.tier) as any}>
                        {sponsor.tier}
                      </Badge>
                    </div>

                    <h2 className="font-display text-lg font-bold uppercase tracking-wide mb-2">
                      {sponsor.name}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {sponsor.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 py-4 border-y border-border mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <TrendingUp className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.impressions}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">Impressions</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Trophy className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.tournaments}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">Tournaments</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-primary">
                          <Users className="h-3 w-3" />
                          <span className="font-display text-sm font-bold">{sponsor.stats.engagement}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground uppercase">Engagement</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" size="sm">
                        {sponsor.activeCampaigns} Active Campaign{sponsor.activeCampaigns > 1 ? 's' : ''}
                      </Badge>
                      <Button variant="rift-ghost" size="sm">
                        Details
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
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
