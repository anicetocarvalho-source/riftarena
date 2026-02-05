 import { useTranslation } from "react-i18next";
 import { motion } from "framer-motion";
 import { 
   Target, 
   Trophy, 
   Scale, 
   Shield, 
   Clock, 
   AlertTriangle,
   ChevronDown
 } from "lucide-react";
 import {
   Accordion,
   AccordionContent,
   AccordionItem,
   AccordionTrigger,
 } from "@/components/ui/accordion";
 import { Badge } from "@/components/ui/badge";
 import { parseRulesMarkdown, TournamentRulesData } from "./rulesTemplates";
 
 interface TournamentRulesDisplayProps {
   rules: string;
 }
 
 const sectionConfig: Record<keyof TournamentRulesData, {
   icon: React.ElementType;
   colorClass: string;
   bgClass: string;
 }> = {
   format: {
     icon: Target,
     colorClass: "text-primary",
     bgClass: "bg-primary/10",
   },
   scoring: {
     icon: Trophy,
     colorClass: "text-gold",
     bgClass: "bg-gold/10",
   },
   tiebreakers: {
     icon: Scale,
     colorClass: "text-diamond",
     bgClass: "bg-diamond/10",
   },
   conduct: {
     icon: Shield,
     colorClass: "text-success",
     bgClass: "bg-success/10",
   },
   schedule: {
     icon: Clock,
     colorClass: "text-info",
     bgClass: "bg-info/10",
   },
   penalties: {
     icon: AlertTriangle,
     colorClass: "text-destructive",
     bgClass: "bg-destructive/10",
   },
 };
 
 const sectionOrder: (keyof TournamentRulesData)[] = [
   "format",
   "scoring", 
   "tiebreakers",
   "conduct",
   "schedule",
   "penalties",
 ];
 
 export const TournamentRulesDisplay = ({ rules }: TournamentRulesDisplayProps) => {
   const { t } = useTranslation();
   
   const parsedRules = parseRulesMarkdown(rules);
   
   if (!parsedRules) {
     // Fallback to plain text display
     return (
       <div className="prose prose-sm prose-invert max-w-none">
         <p className="whitespace-pre-wrap text-muted-foreground">{rules}</p>
       </div>
     );
   }
 
   // Get sections that have content
   const sectionsWithContent = sectionOrder.filter(
     (key) => parsedRules[key]?.content?.trim()
   );
 
   if (sectionsWithContent.length === 0) {
     return (
       <div className="prose prose-sm prose-invert max-w-none">
         <p className="whitespace-pre-wrap text-muted-foreground">{rules}</p>
       </div>
     );
   }
 
   // Open first two sections by default
   const defaultOpenSections = sectionsWithContent.slice(0, 2);
 
   return (
     <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="space-y-3"
     >
       <Accordion 
         type="multiple" 
         defaultValue={defaultOpenSections}
         className="space-y-2"
       >
         {sectionsWithContent.map((sectionKey, index) => {
           const section = parsedRules[sectionKey];
           const config = sectionConfig[sectionKey];
           const Icon = config.icon;
 
           return (
             <motion.div
               key={sectionKey}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: index * 0.05 }}
             >
               <AccordionItem
                 value={sectionKey}
                 className="border border-border rounded-sm bg-secondary/30 overflow-hidden"
               >
                 <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/50 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className={`flex h-8 w-8 items-center justify-center rounded-sm ${config.bgClass}`}>
                       <Icon className={`h-4 w-4 ${config.colorClass}`} />
                     </div>
                     <span className="font-display font-semibold uppercase tracking-wide text-sm">
                       {t(`rulesBuilder.sections.${sectionKey}.title`, section.title)}
                     </span>
                   </div>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                   <div className="pl-11">
                     <RulesContent content={section.content} />
                   </div>
                 </AccordionContent>
               </AccordionItem>
             </motion.div>
           );
         })}
       </Accordion>
 
       {/* Section count badge */}
       <div className="flex justify-center pt-2">
         <Badge variant="outline" className="text-xs text-muted-foreground">
           {sectionsWithContent.length} {t('rulesDisplay.sectionsTotal', 'secções do regulamento')}
         </Badge>
       </div>
     </motion.div>
   );
 };
 
 // Helper component to format rules content with better styling
 const RulesContent = ({ content }: { content: string }) => {
   // Split content into lines and format
   const lines = content.split('\n');
 
   return (
     <div className="space-y-2 text-sm">
       {lines.map((line, index) => {
         const trimmedLine = line.trim();
         
         if (!trimmedLine) return null;
 
         // Check if it's a bullet point
         if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
           return (
             <div key={index} className="flex items-start gap-2 text-muted-foreground">
               <span className="text-primary mt-0.5">•</span>
               <span>{trimmedLine.replace(/^[•\-]\s*/, '')}</span>
             </div>
           );
         }
 
         // Check if it's a numbered item
         const numberedMatch = trimmedLine.match(/^(\d+)\.\s*(.*)$/);
         if (numberedMatch) {
           return (
             <div key={index} className="flex items-start gap-2 text-muted-foreground">
               <Badge variant="secondary" className="text-xs min-w-[20px] justify-center mt-0.5">
                 {numberedMatch[1]}
               </Badge>
               <span>{numberedMatch[2]}</span>
             </div>
           );
         }
 
         // Check if it's a header/section (all caps or ends with :)
         if (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length > 3) {
           return (
             <h4 key={index} className="font-display font-semibold uppercase tracking-wide text-xs text-foreground mt-3 first:mt-0">
               {trimmedLine}
             </h4>
           );
         }
 
         if (trimmedLine.endsWith(':')) {
           return (
             <h4 key={index} className="font-medium text-foreground mt-3 first:mt-0">
               {trimmedLine}
             </h4>
           );
         }
 
         // Regular text
         return (
           <p key={index} className="text-muted-foreground">
             {trimmedLine}
           </p>
         );
       })}
     </div>
   );
 };