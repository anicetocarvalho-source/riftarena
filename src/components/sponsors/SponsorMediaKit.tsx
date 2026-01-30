import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image, Video, Presentation } from "lucide-react";
import { toast } from "sonner";

const mediaAssets = [
  {
    icon: FileText,
    titleKey: "brandGuidelines",
    descriptionKey: "brandGuidelinesDesc",
    format: "PDF",
    size: "2.4 MB",
  },
  {
    icon: Image,
    titleKey: "logoAssets",
    descriptionKey: "logoAssetsDesc",
    format: "ZIP",
    size: "8.1 MB",
  },
  {
    icon: Video,
    titleKey: "promoVideos",
    descriptionKey: "promoVideosDesc",
    format: "MP4",
    size: "156 MB",
  },
  {
    icon: Presentation,
    titleKey: "partnershipDeck",
    descriptionKey: "partnershipDeckDesc",
    format: "PDF",
    size: "5.8 MB",
  },
];

export function SponsorMediaKit() {
  const { t } = useTranslation();

  const handleDownload = (asset: string) => {
    toast.info(t("sponsors.mediaKit.downloadStarting", { asset }));
    // In production, this would trigger actual file download
  };

  return (
    <section className="py-16 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <Badge variant="outline" className="mb-4">
          {t("sponsors.mediaKit.badge")}
        </Badge>
        <h2 className="font-display text-3xl font-bold uppercase tracking-wide mb-4">
          {t("sponsors.mediaKit.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {t("sponsors.mediaKit.description")}
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mediaAssets.map((asset, index) => (
          <motion.div
            key={asset.titleKey}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group p-6 rounded-sm border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
            onClick={() => handleDownload(t(`sponsors.mediaKit.${asset.titleKey}`))}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 rounded-sm bg-secondary group-hover:bg-primary/10 transition-colors">
                <asset.icon className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-display font-bold uppercase tracking-wide mb-1">
                  {t(`sponsors.mediaKit.${asset.titleKey}`)}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {t(`sponsors.mediaKit.${asset.descriptionKey}`)}
                </p>
                <div className="flex items-center justify-center gap-2 text-xs">
                  <Badge variant="outline" size="sm">
                    {asset.format}
                  </Badge>
                  <span className="text-muted-foreground">{asset.size}</span>
                </div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <Button
          variant="rift"
          size="lg"
          onClick={() => handleDownload(t("sponsors.mediaKit.fullKit"))}
        >
          <Download className="mr-2 h-4 w-4" />
          {t("sponsors.mediaKit.downloadAll")}
        </Button>
      </motion.div>
    </section>
  );
}
