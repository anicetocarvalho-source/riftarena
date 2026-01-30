import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SponsorHero } from "@/components/sponsors/SponsorHero";
import { SponsorTierComparison } from "@/components/sponsors/SponsorTierComparison";
import { SponsorCaseStudies } from "@/components/sponsors/SponsorCaseStudies";
import { SponsorMediaKit } from "@/components/sponsors/SponsorMediaKit";
import { CurrentSponsorsGrid } from "@/components/sponsors/CurrentSponsorsGrid";

const Sponsors = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-20">
        <SponsorHero />
        <div className="container">
          <div id="tiers">
            <SponsorTierComparison />
          </div>
          <SponsorCaseStudies />
          <CurrentSponsorsGrid />
          <SponsorMediaKit />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sponsors;
