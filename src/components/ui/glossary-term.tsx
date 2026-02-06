import { forwardRef } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type GlossaryTermKey = 
  | "elo"
  | "bracket"
  | "seed"
  | "winRate"
  | "winStreak"
  | "peakElo"
  | "kFactor"
  | "singleElimination"
  | "doubleElimination"
  | "roundRobin"
  | "swiss"
  | "bo1"
  | "bo3"
  | "bo5";

interface TermDefinition {
  title: string;
  description: string;
}

const glossary: Record<GlossaryTermKey, TermDefinition> = {
  elo: {
    title: "ELO Rating",
    description: "Sistema de pontuação que mede a habilidade relativa dos jogadores. Ganhas pontos ao vencer oponentes mais fortes e perdes menos contra adversários mais fracos.",
  },
  bracket: {
    title: "Bracket (Chave)",
    description: "Estrutura visual que mostra os confrontos eliminatórios de um torneio. Os vencedores avançam até restar apenas um campeão.",
  },
  seed: {
    title: "Seed (Cabeça de Série)",
    description: "Posição inicial de um jogador/equipa no bracket, baseada no seu ranking. Seeds mais altos enfrentam seeds mais baixos nas primeiras rondas.",
  },
  winRate: {
    title: "Win Rate (Taxa de Vitória)",
    description: "Percentagem de partidas ganhas em relação ao total de partidas jogadas. Calculado como: (Vitórias ÷ Total de Partidas) × 100.",
  },
  winStreak: {
    title: "Win Streak (Série de Vitórias)",
    description: "Número consecutivo de vitórias sem perder. Séries longas indicam consistência e bom momento competitivo.",
  },
  peakElo: {
    title: "Peak ELO (ELO Máximo)",
    description: "O valor mais alto de ELO que o jogador já alcançou. Representa o seu melhor desempenho histórico.",
  },
  kFactor: {
    title: "K-Factor",
    description: "Determina quanto ELO podes ganhar ou perder por partida. Valores mais altos significam mudanças mais rápidas no rating.",
  },
  singleElimination: {
    title: "Eliminação Simples",
    description: "Formato onde uma derrota elimina o participante. Mais rápido, mas menos tolerante a erros.",
  },
  doubleElimination: {
    title: "Eliminação Dupla",
    description: "Formato com duas chaves: Winners e Losers. Precisas de perder duas vezes para ser eliminado.",
  },
  roundRobin: {
    title: "Round Robin (Todos contra Todos)",
    description: "Cada participante enfrenta todos os outros. O ranking final é baseado no número total de vitórias.",
  },
  swiss: {
    title: "Sistema Suíço",
    description: "Participantes com resultados semelhantes enfrentam-se. Combina menos partidas que Round Robin mas mais justiça que eliminação.",
  },
  bo1: {
    title: "Best of 1 (Melhor de 1)",
    description: "Formato de partida única. O vencedor é decidido num só jogo.",
  },
  bo3: {
    title: "Best of 3 (Melhor de 3)",
    description: "Ganha quem vencer 2 jogos primeiro. Reduz o impacto da sorte e permite adaptação.",
  },
  bo5: {
    title: "Best of 5 (Melhor de 5)",
    description: "Ganha quem vencer 3 jogos primeiro. Usado em finais importantes para maior consistência.",
  },
};

interface GlossaryTermProps {
  term: GlossaryTermKey;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  iconClassName?: string;
}

const GlossaryTermTrigger = forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    showIcon?: boolean;
    iconClassName?: string;
    termTitle: string;
  }
>(({ children, showIcon = true, iconClassName, termTitle, className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "inline-flex items-center gap-1 cursor-help border-b border-dotted border-muted-foreground/50 hover:border-primary transition-colors",
      className
    )}
    {...props}
  >
    {children || termTitle}
    {showIcon && (
      <HelpCircle className={cn("h-3 w-3 text-muted-foreground", iconClassName)} />
    )}
  </span>
));
GlossaryTermTrigger.displayName = "GlossaryTermTrigger";

export function GlossaryTerm({ 
  term, 
  children, 
  showIcon = true,
  className,
  iconClassName,
}: GlossaryTermProps) {
  const definition = glossary[term];
  
  if (!definition) {
    return <span className={className}>{children}</span>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <GlossaryTermTrigger
            showIcon={showIcon}
            className={className}
            iconClassName={iconClassName}
            termTitle={definition.title}
          >
            {children}
          </GlossaryTermTrigger>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-xs bg-popover border-border"
        >
          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-foreground">
              {definition.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {definition.description}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Helper to get just the definition text
export function getGlossaryDefinition(term: GlossaryTermKey): TermDefinition | undefined {
  return glossary[term];
}
