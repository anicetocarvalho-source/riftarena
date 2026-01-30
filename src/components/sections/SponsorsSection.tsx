import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { 
  SiSamsung, 
  SiRedbull, 
  SiNike, 
  SiIntel, 
  SiMonster, 
  SiRazer 
} from "@icons-pack/react-simple-icons";

const sponsors = [
  { name: "Samsung", Icon: SiSamsung },
  { name: "Red Bull", Icon: SiRedbull },
  { name: "Nike", Icon: SiNike },
  { name: "Intel", Icon: SiIntel },
  { name: "Monster", Icon: SiMonster },
  { name: "Razer", Icon: SiRazer },
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
                <sponsor.Icon 
                  className="h-8 w-auto md:h-10 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors cursor-pointer"
                />
              </motion.div>
            ))}
          </div>
        </Link>
      </div>
    </section>
  );
}
