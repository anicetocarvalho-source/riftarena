import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { PlatformMetrics } from "@/components/sections/PlatformMetrics";
import { FeaturedTournaments } from "@/components/sections/FeaturedTournaments";
import { RankingsPreview } from "@/components/sections/RankingsPreview";
import { GamesSection } from "@/components/sections/GamesSection";
import { SponsorsSection } from "@/components/sections/SponsorsSection";
import { CTASection } from "@/components/sections/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <HeroSection />
        <PlatformMetrics />
        <SponsorsSection />
        <FeaturedTournaments />
        <RankingsPreview />
        <GamesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
