import { useMemo } from "react";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { 
  ChartContainer, 
  ChartTooltip
} from "@/components/ui/chart";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  TooltipProps
} from "recharts";
import { getRankTier } from "@/hooks/useRankings";

interface EloHistoryEntry {
  id: string;
  match_id: string;
  user_id: string;
  elo_before: number;
  elo_after: number;
  elo_change: number;
  created_at: string;
}

interface EloProgressionChartProps {
  eloHistory: EloHistoryEntry[];
  currentElo: number;
  peakElo: number;
  className?: string;
}

interface ChartDataPoint {
  index: number;
  elo: number;
  change: number;
  date: string;
  fullDate: string;
  isWin: boolean;
  tier: string;
  tierIcon: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload as ChartDataPoint;
  const changeColor = data.change > 0 ? "text-success" : data.change < 0 ? "text-destructive" : "text-muted-foreground";
  const ChangeIcon = data.change > 0 ? TrendingUp : data.change < 0 ? TrendingDown : Minus;
  
  return (
    <div className="bg-card border border-border rounded-md shadow-lg p-3 min-w-[180px]">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-xs text-muted-foreground">{data.fullDate}</span>
        <Badge variant="outline" className="text-xs">
          {data.tierIcon} {data.tier}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-display text-xl font-bold">{data.elo}</span>
        <span className={cn("flex items-center gap-1 text-sm font-medium", changeColor)}>
          <ChangeIcon className="h-3 w-3" />
          {data.change > 0 ? "+" : ""}{data.change}
        </span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        Match #{data.index} • {data.isWin ? "Victory" : "Defeat"}
      </div>
    </div>
  );
};

export const EloProgressionChart = ({ 
  eloHistory, 
  currentElo, 
  peakElo,
  className 
}: EloProgressionChartProps) => {
  const chartData = useMemo(() => {
    if (!eloHistory || eloHistory.length === 0) return [];
    
    // Reverse to show chronological order (oldest first)
    return eloHistory
      .slice()
      .reverse()
      .map((entry, index) => {
        const tier = getRankTier(entry.elo_after);
        return {
          index: index + 1,
          elo: entry.elo_after,
          change: entry.elo_change,
          date: format(new Date(entry.created_at), "MMM d"),
          fullDate: format(new Date(entry.created_at), "MMM d, yyyy 'at' HH:mm"),
          isWin: entry.elo_change > 0,
          tier: tier.name,
          tierIcon: tier.icon,
        };
      });
  }, [eloHistory]);

  const stats = useMemo(() => {
    if (chartData.length === 0) return null;
    
    const changes = chartData.map(d => d.change);
    const wins = changes.filter(c => c > 0).length;
    const losses = changes.filter(c => c < 0).length;
    const totalChange = changes.reduce((a, b) => a + b, 0);
    const avgChange = Math.round(totalChange / changes.length);
    const minElo = Math.min(...chartData.map(d => d.elo));
    const maxElo = Math.max(...chartData.map(d => d.elo));
    
    return { wins, losses, totalChange, avgChange, minElo, maxElo };
  }, [chartData]);

  const chartConfig = {
    elo: {
      label: "ELO Rating",
      color: "hsl(var(--primary))",
    },
  };

  // Calculate Y axis domain with padding
  const yDomain = useMemo(() => {
    if (!stats) return [1150, 1250];
    const padding = 50;
    return [
      Math.floor((stats.minElo - padding) / 50) * 50,
      Math.ceil((stats.maxElo + padding) / 50) * 50
    ];
  }, [stats]);

  // Reference lines for rank tiers
  const rankTiers = [
    { value: 1200, label: "Bronze", color: "hsl(var(--muted-foreground))" },
    { value: 1400, label: "Silver", color: "hsl(200, 15%, 60%)" },
    { value: 1600, label: "Gold", color: "hsl(45, 93%, 47%)" },
    { value: 1800, label: "Platinum", color: "hsl(152, 76%, 36%)" },
    { value: 2000, label: "Diamond", color: "hsl(188, 78%, 41%)" },
  ].filter(tier => tier.value >= yDomain[0] && tier.value <= yDomain[1]);

  if (!eloHistory || eloHistory.length === 0) {
    return (
      <RiftCard className={className}>
        <RiftCardHeader>
          <RiftCardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            ELO Progression
          </RiftCardTitle>
        </RiftCardHeader>
        <RiftCardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No match history yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
              Complete matches in tournaments to see your ELO progression over time
            </p>
          </div>
        </RiftCardContent>
      </RiftCard>
    );
  }

  const currentTier = getRankTier(currentElo);

  return (
    <RiftCard className={className}>
      <RiftCardHeader>
        <div className="flex items-center justify-between">
          <RiftCardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            ELO Progression
          </RiftCardTitle>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-display font-bold">{currentElo}</span>
                <Badge variant="outline" className={cn("font-display", currentTier.color)}>
                  {currentTier.icon} {currentTier.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Peak: {peakElo} • {chartData.length} matches tracked
              </p>
            </div>
          </div>
        </div>
      </RiftCardHeader>
      <RiftCardContent>
        {/* Stats Summary */}
        {stats && (
          <div className="grid grid-cols-4 gap-4 mb-6 p-4 rounded-md bg-secondary/30 border border-border">
            <div className="text-center">
              <p className="text-lg font-display font-bold text-success">{stats.wins}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Wins</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold text-destructive">{stats.losses}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Losses</p>
            </div>
            <div className="text-center">
              <p className={cn(
                "text-lg font-display font-bold",
                stats.totalChange > 0 ? "text-success" : stats.totalChange < 0 ? "text-destructive" : "text-muted-foreground"
              )}>
                {stats.totalChange > 0 ? "+" : ""}{stats.totalChange}
              </p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Net Change</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-display font-bold">{stats.maxElo}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Peak</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eloGradientEnhanced" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--border))" 
                opacity={0.5}
                vertical={false}
              />
              
              {/* Rank tier reference lines */}
              {rankTiers.map(tier => (
                <ReferenceLine
                  key={tier.label}
                  y={tier.value}
                  stroke={tier.color}
                  strokeDasharray="5 5"
                  strokeOpacity={0.4}
                  label={{
                    value: tier.label,
                    position: "right",
                    fill: tier.color,
                    fontSize: 10,
                    opacity: 0.7
                  }}
                />
              ))}
              
              {/* Peak ELO reference line */}
              {peakElo > currentElo && (
                <ReferenceLine
                  y={peakElo}
                  stroke="hsl(var(--warning))"
                  strokeDasharray="3 3"
                  strokeOpacity={0.6}
                  label={{
                    value: `Peak: ${peakElo}`,
                    position: "insideTopRight",
                    fill: "hsl(var(--warning))",
                    fontSize: 10,
                  }}
                />
              )}
              
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickMargin={10}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={yDomain}
                tickFormatter={(value) => value.toString()}
                width={45}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="elo"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                fill="url(#eloGradientEnhanced)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const isWin = payload.change > 0;
                  const color = isWin ? "hsl(var(--success))" : "hsl(var(--destructive))";
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={color}
                      stroke="hsl(var(--card))"
                      strokeWidth={2}
                    />
                  );
                }}
                activeDot={{
                  r: 6,
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 2,
                  fill: "hsl(var(--card))"
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span>Victory</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive" />
            <span>Defeat</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-muted-foreground/40" />
            <span>Rank Thresholds</span>
          </div>
        </div>
      </RiftCardContent>
    </RiftCard>
  );
};
