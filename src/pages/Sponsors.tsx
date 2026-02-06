import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SponsorHero } from "@/components/sponsors/SponsorHero";
import { SponsorTierComparison } from "@/components/sponsors/SponsorTierComparison";
import { SponsorCaseStudies } from "@/components/sponsors/SponsorCaseStudies";
import { SponsorMediaKit } from "@/components/sponsors/SponsorMediaKit";
import { CurrentSponsorsGrid } from "@/components/sponsors/CurrentSponsorsGrid";
import { SEOHead } from "@/components/seo/SEOHead";

const Sponsors = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead
        title="Sponsors & Partners"
        description="Partner with RIFT Arena to reach thousands of competitive gamers. Explore sponsorship tiers, case studies, and media kits."
        canonical="https://riftarena.lovable.app/sponsors"
      />
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
