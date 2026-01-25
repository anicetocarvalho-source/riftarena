import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, Trophy, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Elite Tournaments",
    description: "Compete in professionally organized tournaments with cash prizes and sponsor rewards.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Rankings",
    description: "Track your ELO rating across games with our advanced ranking algorithm.",
  },
  {
    icon: Shield,
    title: "Fair Play",
    description: "Our anti-cheat systems and admin validation ensure competitive integrity.",
  },
  {
    icon: Zap,
    title: "Instant Matchmaking",
    description: "Find matches quickly with players at your skill level, anytime.",
  },
];

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-rift opacity-50" />
      
      <div className="container relative">
        <div className="mx-auto max-w-4xl">
          {/* Features Grid */}
          <div className="grid gap-6 sm:grid-cols-2 mb-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-4 p-6 rounded-sm border border-border bg-card/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
              Ready to <span className="text-gradient-purple">Compete</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Join thousands of players competing in the most prestigious esports tournaments. 
              Your journey to the top starts here.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="rift" size="xl">
                Create Account
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="rift-outline" size="xl">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
