import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformMetrics } from "@/components/sections/PlatformMetrics";
import { FeaturedTournaments } from "@/components/sections/FeaturedTournaments";
import { RankingsPreview } from "@/components/sections/RankingsPreview";
import { GamesSection } from "@/components/sections/GamesSection";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { CTASection } from "@/components/sections/CTASection";
import { SEOHead } from "@/components/seo/SEOHead";
import { buildWebsiteJsonLd, buildOrganizationJsonLd } from "@/components/seo/tournamentJsonLd";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Enter the Rift"
        description="The premier esports competition platform. Join elite tournaments, climb global rankings, and compete with the best players in Free Fire, PUBG Mobile, and Call of Duty Mobile."
        canonical="https://riftarena.lovable.app/"
        jsonLd={buildWebsiteJsonLd()}
      />
      <Navbar />
      <main>
        <HeroSection />
        <PlatformMetrics />
        <RankingsPreview />
        <SponsorsSection />
        <FeaturedTournaments />
        <GamesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
