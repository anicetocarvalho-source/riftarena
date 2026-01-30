import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const sponsors = [
  { name: "Samsung", logo: "SAMSUNG" },
  { name: "Red Bull", logo: "REDBULL" },
  { name: "Nike", logo: "NIKE" },
  { name: "Intel", logo: "INTEL" },
  { name: "Monster", logo: "MONSTER" },
  { name: "Razer", logo: "RAZER" },
];

export function SponsorsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-16 border-y border-border bg-secondary/30">
      <div className="container">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8"
        >
          {t('sponsors.trustedBy')}
        </motion.p>

        <Link to="/sponsors">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <span className="font-display text-xl md:text-2xl font-bold tracking-[0.2em] text-muted-foreground/50 group-hover:text-muted-foreground transition-colors cursor-pointer">
                  {sponsor.logo}
                </span>
              </motion.div>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
}
