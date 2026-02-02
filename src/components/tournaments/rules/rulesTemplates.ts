export interface RulesSection {
  title: string;
  description: string;
  placeholder: string;
  content: string;
}

export interface TournamentRulesData {
  format: RulesSection;
  scoring: RulesSection;
  tiebreakers: RulesSection;
  conduct: RulesSection;
  schedule: RulesSection;
  penalties: RulesSection;
}

export const defaultRulesTemplate = (
  bracketType: string,
  isTeamBased: boolean,
  teamSize: number
): TournamentRulesData => {
  const formatContent = generateFormatContent(bracketType, isTeamBased, teamSize);
  const scoringContent = generateScoringContent(bracketType);
  const tiebreakersContent = generateTiebreakersContent(bracketType);
  const conductContent = generateConductContent();
  const scheduleContent = generateScheduleContent();
  const penaltiesContent = generatePenaltiesContent();

  return {
    format: {
      title: "Formato da Competição",
      description: "Define a estrutura de brackets, número de rondas e critérios de qualificação.",
      placeholder: "Ex: Bracket de eliminatória simples com 64 participantes...",
      content: formatContent,
    },
    scoring: {
      title: "Sistema de Pontuação",
      description: "Explica como os pontos são atribuídos e como os resultados são determinados.",
      placeholder: "Ex: Best-of-3 para fases iniciais, Best-of-5 para finais...",
      content: scoringContent,
    },
    tiebreakers: {
      title: "Critérios de Desempate",
      description: "Define como os empates são resolvidos em cada fase da competição.",
      placeholder: "Ex: 1º Head-to-head, 2º Diferença de pontos, 3º Partida extra...",
      content: tiebreakersContent,
    },
    conduct: {
      title: "Código de Conduta",
      description: "Regras de comportamento, fair play e integridade competitiva.",
      placeholder: "Ex: É proibido o uso de linguagem ofensiva, exploits ou cheats...",
      content: conductContent,
    },
    schedule: {
      title: "Horários e Prazos",
      description: "Define janelas de jogo, tolerância de atrasos e reagendamentos.",
      placeholder: "Ex: Check-in obrigatório 15 minutos antes do início...",
      content: scheduleContent,
    },
    penalties: {
      title: "Penalizações",
      description: "Consequências para violações de regras e comportamento antidesportivo.",
      placeholder: "Ex: Primeira infração: Aviso. Segunda infração: Loss técnico...",
      content: penaltiesContent,
    },
  };
};

const generateFormatContent = (bracketType: string, isTeamBased: boolean, teamSize: number): string => {
  const participantType = isTeamBased ? `equipas de ${teamSize} jogadores` : "jogadores individuais";
  
  const bracketFormats: Record<string, string> = {
    single_elimination: `• Formato: Eliminatória Simples
• Participantes: ${participantType}
• Cada derrota resulta em eliminação imediata
• O bracket será gerado automaticamente com seeding aleatório
• Byes serão atribuídos quando necessário para completar a estrutura`,
    
    double_elimination: `• Formato: Eliminatória Dupla
• Participantes: ${participantType}
• Winners Bracket: Jogadores sem derrotas
• Losers Bracket: Jogadores com 1 derrota
• Duas derrotas resultam em eliminação
• Grand Finals: Vencedor do Winners vs Vencedor do Losers
• Reset de bracket se o jogador do Losers vencer a primeira partida das Grand Finals`,
    
    round_robin: `• Formato: Round Robin (Todos contra Todos)
• Participantes: ${participantType}
• Cada participante enfrenta todos os outros uma vez
• Classificação por vitórias totais
• Top 4/8 avançam para playoffs (eliminatória simples)`,
  };

  return bracketFormats[bracketType] || bracketFormats.single_elimination;
};

const generateScoringContent = (bracketType: string): string => {
  const baseScoring = `• Fases Iniciais: Best-of-1 (Bo1)
• Quartas de Final: Best-of-3 (Bo3)
• Semifinais: Best-of-3 (Bo3)
• Final: Best-of-5 (Bo5)`;

  if (bracketType === "round_robin") {
    return `• Vitória: 3 pontos
• Empate: 1 ponto (se aplicável)
• Derrota: 0 pontos
• W.O. (Walkover) contra: -1 ponto

${baseScoring}`;
  }

  return baseScoring;
};

const generateTiebreakersContent = (bracketType: string): string => {
  if (bracketType === "round_robin") {
    return `Em caso de empate na classificação:

1. Confronto Direto (Head-to-Head)
   - Resultado entre os jogadores empatados
   
2. Diferença de Rondas/Mapas
   - Rondas/mapas ganhos menos perdidos
   
3. Rondas/Mapas Totais Ganhos
   - Maior número total de vitórias
   
4. Mini-Bracket de Desempate
   - Best-of-1 entre os empatados
   
5. Coin Flip (última instância)
   - Apenas se todas as opções acima forem inconclusivas`;
  }

  return `Em caso de empate numa série:

1. Ronda/Mapa Decisivo
   - Jogado no mapa/modo padrão do torneio
   
2. Overtime
   - Seguir regras de overtime do jogo
   
3. Regra do Golden Goal/Round
   - Primeiro a pontuar vence (se aplicável)`;
};

const generateConductContent = (): string => {
  return `OBRIGATÓRIO:
• Respeitar todos os participantes, staff e espectadores
• Manter fair play e integridade competitiva
• Reportar bugs ou exploits imediatamente aos admins
• Usar apenas equipamento e software aprovados

PROIBIDO:
• Linguagem ofensiva, discriminatória ou assédio
• Uso de cheats, hacks, macros ou software não autorizado
• Exploração de bugs ou glitches conhecidos
• Stream sniping ou qualquer forma de trapaça
• Combinação de resultados ou match-fixing
• Impersonação de outros jogadores
• Partilha de contas

COMUNICAÇÃO:
• Discord oficial do torneio é obrigatório
• Responder a mensagens dos admins em 15 minutos
• Manter linguagem apropriada em todos os canais`;
};

const generateScheduleContent = (): string => {
  return `CHECK-IN:
• Check-in abre 30 minutos antes do torneio
• Check-in fecha 5 minutos antes do início
• Falha no check-in resulta em desqualificação

JANELAS DE JOGO:
• Jogadores têm 10 minutos para se conectar após convocação
• 5 minutos de tolerância para problemas técnicos
• Pausas máximas de 5 minutos por jogador/equipa

REAGENDAMENTOS:
• Pedidos de reagendamento até 24h antes
• Ambas as partes devem concordar
• Sujeito a aprovação da organização

ATRASOS:
• 0-5 min: Aviso
• 5-10 min: Perda do primeiro mapa/ronda
• 10-15 min: Perda da partida (W.O.)
• +15 min: Desqualificação`;
};

const generatePenaltiesContent = (): string => {
  return `SISTEMA DE PENALIZAÇÕES:

Nível 1 - Aviso Verbal:
• Primeira infração menor
• Linguagem inapropriada leve
• Atraso até 5 minutos

Nível 2 - Aviso Oficial:
• Segunda infração menor
• Primeira infração moderada
• Registado no histórico do jogador

Nível 3 - Perda de Ronda/Mapa:
• Terceira infração menor
• Segunda infração moderada
• Atraso entre 5-10 minutos

Nível 4 - Perda de Partida (W.O.):
• Infrações graves
• Atraso superior a 10 minutos
• Abandono de partida

Nível 5 - Desqualificação:
• Uso confirmado de cheats
• Comportamento violento ou ameaças
• Combinação de resultados
• Múltiplas infrações acumuladas

Nível 6 - Ban Permanente:
• Reincidência após desqualificação
• Infrações criminais
• Danos à integridade da plataforma

APELOS:
• Recurso até 24h após a decisão
• Enviar para: [email da organização]
• Decisão final é irrevogável`;
};

export const generateRulesMarkdown = (data: TournamentRulesData): string => {
  const sections: string[] = [];

  Object.entries(data).forEach(([key, section]) => {
    if (section.content.trim()) {
      sections.push(`## ${section.title}\n\n${section.content}`);
    }
  });

  return sections.join("\n\n---\n\n");
};

export const parseRulesMarkdown = (markdown: string): TournamentRulesData | null => {
  if (!markdown || markdown.trim().length === 0) {
    return null;
  }

  const template = defaultRulesTemplate("single_elimination", false, 5);
  
  // Try to parse existing markdown sections
  const sectionPatterns: Record<keyof TournamentRulesData, RegExp> = {
    format: /##\s*(Formato|Format)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
    scoring: /##\s*(Pontuação|Scoring|Sistema)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
    tiebreakers: /##\s*(Desempate|Tiebreaker|Critérios)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
    conduct: /##\s*(Conduta|Conduct|Código)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
    schedule: /##\s*(Horários|Schedule|Prazos)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
    penalties: /##\s*(Penalizações|Penalties|Infrações)[^\n]*\n\n?([\s\S]*?)(?=\n---|\n##|$)/i,
  };

  let foundAny = false;

  Object.entries(sectionPatterns).forEach(([key, pattern]) => {
    const match = markdown.match(pattern);
    if (match && match[2]) {
      template[key as keyof TournamentRulesData].content = match[2].trim();
      foundAny = true;
    }
  });

  // If no structured sections found, put all content in format section
  if (!foundAny && markdown.trim()) {
    template.format.content = markdown.trim();
  }

  return template;
};
