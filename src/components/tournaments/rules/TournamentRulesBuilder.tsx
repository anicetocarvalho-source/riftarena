import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  FileText, 
  Sparkles, 
  ChevronDown,
  Trophy,
  Scale,
  Shield,
  Clock,
  AlertTriangle,
  Target,
  Users,
  Zap
} from "lucide-react";
import { RulesSection, TournamentRulesData, generateRulesMarkdown, parseRulesMarkdown, defaultRulesTemplate } from "./rulesTemplates";

interface TournamentRulesBuilderProps {
  value: string;
  onChange: (value: string) => void;
  bracketType: string;
  isTeamBased?: boolean;
  teamSize?: number;
}

export const TournamentRulesBuilder = ({
  value,
  onChange,
  bracketType,
  isTeamBased = false,
  teamSize = 5,
}: TournamentRulesBuilderProps) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"builder" | "raw">("builder");
  const [rulesData, setRulesData] = useState<TournamentRulesData>(() => {
    const parsed = parseRulesMarkdown(value);
    return parsed || defaultRulesTemplate(bracketType, isTeamBased, teamSize);
  });

  const handleSectionChange = (sectionKey: keyof TournamentRulesData, field: string, fieldValue: string) => {
    const updatedData = {
      ...rulesData,
      [sectionKey]: {
        ...rulesData[sectionKey],
        [field]: fieldValue,
      },
    };
    setRulesData(updatedData);
    onChange(generateRulesMarkdown(updatedData));
  };

  const handleApplyTemplate = () => {
    const template = defaultRulesTemplate(bracketType, isTeamBased, teamSize);
    setRulesData(template);
    onChange(generateRulesMarkdown(template));
  };

  const handleRawChange = (rawValue: string) => {
    onChange(rawValue);
    const parsed = parseRulesMarkdown(rawValue);
    if (parsed) {
      setRulesData(parsed);
    }
  };

  const sectionIcons: Record<keyof TournamentRulesData, React.ReactNode> = {
    format: <Target className="h-4 w-4" />,
    scoring: <Trophy className="h-4 w-4" />,
    tiebreakers: <Scale className="h-4 w-4" />,
    conduct: <Shield className="h-4 w-4" />,
    schedule: <Clock className="h-4 w-4" />,
    penalties: <AlertTriangle className="h-4 w-4" />,
  };

  const sectionColors: Record<keyof TournamentRulesData, string> = {
    format: "text-primary",
    scoring: "text-gold",
    tiebreakers: "text-diamond",
    conduct: "text-success",
    schedule: "text-info",
    penalties: "text-destructive",
  };

  return (
    <div className="space-y-4">
      {/* Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <span className="font-display font-semibold uppercase tracking-wide text-sm">
            {t('rulesBuilder.title', 'Regulamento do Torneio')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={mode === "builder" ? "rift" : "ghost"}
            size="sm"
            onClick={() => setMode("builder")}
          >
            <Zap className="h-4 w-4 mr-1" />
            {t('rulesBuilder.builderMode', 'Construtor')}
          </Button>
          <Button
            type="button"
            variant={mode === "raw" ? "rift" : "ghost"}
            size="sm"
            onClick={() => setMode("raw")}
          >
            <FileText className="h-4 w-4 mr-1" />
            {t('rulesBuilder.rawMode', 'Texto Livre')}
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === "builder" ? (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Apply Template Button */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-sm border border-border">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t('rulesBuilder.templateHint', 'Usar template profissional baseado no formato do torneio')}
                </span>
              </div>
              <Button
                type="button"
                variant="rift-outline"
                size="sm"
                onClick={handleApplyTemplate}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                {t('rulesBuilder.applyTemplate', 'Aplicar Template')}
              </Button>
            </div>

            {/* Rules Sections Accordion */}
            <Accordion type="multiple" defaultValue={["format", "scoring"]} className="space-y-2">
              {(Object.entries(rulesData) as [keyof TournamentRulesData, RulesSection][]).map(
                ([key, section]) => (
                  <AccordionItem
                    key={key}
                    value={key}
                    className="border border-border rounded-sm bg-card/50 px-4"
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-3">
                        <span className={sectionColors[key]}>{sectionIcons[key]}</span>
                        <span className="font-display font-semibold uppercase tracking-wide text-sm">
                          {t(`rulesBuilder.sections.${key}.title`, section.title)}
                        </span>
                        {section.content && (
                          <Badge variant="secondary" className="text-xs">
                            {t('rulesBuilder.filled', 'Preenchido')}
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3">
                        <p className="text-xs text-muted-foreground">
                          {t(`rulesBuilder.sections.${key}.description`, section.description)}
                        </p>
                        <Textarea
                          value={section.content}
                          onChange={(e) => handleSectionChange(key, "content", e.target.value)}
                          placeholder={t(`rulesBuilder.sections.${key}.placeholder`, section.placeholder)}
                          rows={4}
                          className="font-mono text-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              )}
            </Accordion>

            {/* Preview Badge */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {isTeamBased ? (
                  <><Users className="h-3 w-3 mr-1" /> {t('rulesBuilder.teamBased', 'Equipas de')} {teamSize}</>
                ) : (
                  <><Users className="h-3 w-3 mr-1" /> {t('rulesBuilder.individual', 'Individual')}</>
                )}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {bracketType === "single_elimination" && t('rulesBuilder.singleElim', 'Eliminatória Simples')}
                {bracketType === "double_elimination" && t('rulesBuilder.doubleElim', 'Eliminatória Dupla')}
                {bracketType === "round_robin" && t('rulesBuilder.roundRobin', 'Round Robin')}
              </Badge>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="raw"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Textarea
              value={value}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder={t('rulesBuilder.rawPlaceholder', 'Escreve as regras do torneio em formato livre...')}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {t('rulesBuilder.rawHint', 'Podes usar Markdown para formatação. Usa o modo Construtor para um formato estruturado.')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
