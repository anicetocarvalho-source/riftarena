 import { useParams, useNavigate } from "react-router-dom";
 import { useTranslation } from "react-i18next";
 import { motion } from "framer-motion";
 import { Navbar } from "@/components/layout/Navbar";
 import { Footer } from "@/components/layout/Footer";
 import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
 import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { useTournament, useTournamentMatches, useTournamentRegistrations } from "@/hooks/useTournaments";
 import { 
   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area
 } from "recharts";
 import { 
   Trophy, Users, Calendar, TrendingUp, 
   Loader2, BarChart3, PieChartIcon, Activity, ArrowLeft, CheckCircle, Clock, XCircle
 } from "lucide-react";
 import { format, differenceInDays, parseISO } from "date-fns";
 
 const CHART_COLORS = {
   primary: "hsl(var(--primary))",
   gold: "hsl(var(--gold))",
   diamond: "hsl(var(--diamond))",
   success: "hsl(var(--success))",
   warning: "hsl(var(--warning))",
   destructive: "hsl(var(--destructive))",
   muted: "hsl(var(--muted-foreground))",
 };
 
 const PIE_COLORS = [CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.destructive];
 
 const TournamentStats = () => {
   const { t } = useTranslation();
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   
   const { data: tournament, isLoading: tournamentLoading } = useTournament(id || "");
   const { data: registrations } = useTournamentRegistrations(id || "");
   const { data: matches } = useTournamentMatches(id || "");
 
   if (tournamentLoading) {
     return (
       <div className="min-h-screen bg-background flex items-center justify-center">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
       </div>
     );
   }
 
   if (!tournament) {
     return (
       <div className="min-h-screen bg-background text-foreground">
         <Navbar />
         <main className="pt-24 pb-16">
           <div className="container text-center">
             <h1 className="text-2xl font-bold mb-4">{t('tournamentDetail.notFound')}</h1>
             <Button variant="rift" onClick={() => navigate("/tournaments")}>
               {t('tournamentDetail.browseTournaments')}
             </Button>
           </div>
         </main>
         <Footer />
       </div>
     );
   }
 
   // Calculate statistics
   const totalRegistrations = registrations?.length || 0;
   const confirmedCount = registrations?.filter(r => r.status === "confirmed").length || 0;
   const pendingCount = registrations?.filter(r => r.status === "pending").length || 0;
   const rejectedCount = registrations?.filter(r => r.status === "rejected").length || 0;
   
   const totalMatches = matches?.length || 0;
   const completedMatches = matches?.filter(m => m.status === "completed").length || 0;
   const pendingMatches = matches?.filter(m => m.status === "pending").length || 0;
   const inProgressMatches = matches?.filter(m => m.status === "in_progress").length || 0;
   
   const fillRate = tournament.max_participants > 0 
     ? Math.round((confirmedCount / tournament.max_participants) * 100) 
     : 0;
 
   // Registration status data for pie chart
   const registrationStatusData = [
     { name: t('tournamentStats.confirmed'), value: confirmedCount, color: CHART_COLORS.success },
     { name: t('tournamentStats.pending'), value: pendingCount, color: CHART_COLORS.warning },
     { name: t('tournamentStats.rejected'), value: rejectedCount, color: CHART_COLORS.destructive },
   ].filter(d => d.value > 0);
 
   // Match status data for pie chart
   const matchStatusData = [
     { name: t('tournamentStats.completed'), value: completedMatches, color: CHART_COLORS.success },
     { name: t('tournamentStats.inProgress'), value: inProgressMatches, color: CHART_COLORS.warning },
     { name: t('tournamentStats.pendingMatches'), value: pendingMatches, color: CHART_COLORS.muted },
   ].filter(d => d.value > 0);
 
   // Matches by round for bar chart
   const rounds = [...new Set(matches?.map(m => m.round) || [])].sort((a, b) => a - b);
   const matchesByRound = rounds.map(round => {
     const roundMatches = matches?.filter(m => m.round === round) || [];
     const completed = roundMatches.filter(m => m.status === "completed").length;
     const total = roundMatches.length;
     return {
       round: `R${round}`,
       fullName: getRoundName(round, rounds.length),
       total,
       completed,
       remaining: total - completed,
     };
   });
 
   function getRoundName(round: number, totalRounds: number) {
     if (round === totalRounds) return t('tournamentDetail.finals');
     if (round === totalRounds - 1) return t('tournamentDetail.semiFinals');
     if (round === totalRounds - 2) return t('tournamentDetail.quarterFinals');
     return `${t('playerProfile.round')} ${round}`;
   }
 
   // Registrations over time (simulated based on created_at)
   const registrationTimeline = (() => {
     if (!registrations || registrations.length === 0) return [];
     
     const sorted = [...registrations].sort((a, b) => 
       new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
     );
     
     const timeline: { date: string; count: number; cumulative: number }[] = [];
     let cumulative = 0;
     
     const dateMap = new Map<string, number>();
     sorted.forEach(reg => {
       const date = format(new Date(reg.created_at), "dd/MM");
       dateMap.set(date, (dateMap.get(date) || 0) + 1);
     });
     
     dateMap.forEach((count, date) => {
       cumulative += count;
       timeline.push({ date, count, cumulative });
     });
     
     return timeline;
   })();
 
   // Top performers (players with most wins in completed matches)
   const playerWins = new Map<string, { id: string; name: string; wins: number }>();
   matches?.forEach(match => {
     if (match.status === "completed" && match.winner_id) {
       const winner = match.participant1_id === match.winner_id 
         ? match.participant1 
         : match.participant2;
       if (winner) {
         const existing = playerWins.get(winner.id) || { id: winner.id, name: winner.username, wins: 0 };
         existing.wins += 1;
         playerWins.set(winner.id, existing);
       }
     }
   });
   const topPerformers = [...playerWins.values()]
     .sort((a, b) => b.wins - a.wins)
     .slice(0, 5);
 
   // Days until start / since start
   const startDate = new Date(tournament.start_date);
   const now = new Date();
   const daysUntilStart = differenceInDays(startDate, now);
 
   return (
     <div className="min-h-screen bg-background text-foreground">
       <Navbar />
       <main className="pt-24 pb-16">
         <div className="container">
           {/* Breadcrumbs */}
           <PageBreadcrumbs 
             items={[
               { label: t('breadcrumbs.tournaments'), href: "/tournaments" },
               { label: tournament.name, href: `/tournaments/${tournament.id}` },
               { label: t('tournamentStats.title') }
             ]}
             className="mb-6"
           />
 
           {/* Header */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="mb-8"
           >
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
               <div>
                 <div className="flex items-center gap-3 mb-2">
                   <BarChart3 className="h-8 w-8 text-primary" />
                   <h1 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-wide">
                     {t('tournamentStats.title')}
                   </h1>
                 </div>
                 <p className="text-muted-foreground flex items-center gap-2">
                   <span className="text-lg">{tournament.game?.icon}</span>
                   {tournament.name}
                 </p>
               </div>
               <Button variant="rift-outline" onClick={() => navigate(`/tournaments/${tournament.id}`)}>
                 <ArrowLeft className="mr-2 h-4 w-4" />
                 {t('tournamentStats.backToTournament')}
               </Button>
             </div>
           </motion.div>
 
           {/* Key Metrics */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
           >
             <RiftCard glow>
               <RiftCardContent className="py-4">
                 <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10">
                     <Users className="h-6 w-6 text-primary" />
                   </div>
                   <div>
                     <p className="text-2xl font-display font-bold">{confirmedCount}/{tournament.max_participants}</p>
                     <p className="text-xs text-muted-foreground">{t('tournamentStats.confirmedParticipants')}</p>
                   </div>
                 </div>
                 <div className="mt-3">
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-muted-foreground">{t('tournamentStats.fillRate')}</span>
                     <span className="text-primary font-medium">{fillRate}%</span>
                   </div>
                   <div className="h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-500"
                       style={{ width: `${fillRate}%` }}
                     />
                   </div>
                 </div>
               </RiftCardContent>
             </RiftCard>
 
             <RiftCard>
               <RiftCardContent className="py-4">
                 <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-gold/10">
                     <Trophy className="h-6 w-6 text-gold" />
                   </div>
                   <div>
                     <p className="text-2xl font-display font-bold">{completedMatches}/{totalMatches}</p>
                     <p className="text-xs text-muted-foreground">{t('tournamentStats.matchesCompleted')}</p>
                   </div>
                 </div>
                 <div className="mt-3">
                   <div className="flex justify-between text-xs mb-1">
                     <span className="text-muted-foreground">{t('tournamentStats.progress')}</span>
                     <span className="text-gold font-medium">
                       {totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0}%
                     </span>
                   </div>
                   <div className="h-2 bg-secondary rounded-full overflow-hidden">
                     <div 
                       className="h-full bg-gold transition-all duration-500"
                       style={{ width: totalMatches > 0 ? `${(completedMatches / totalMatches) * 100}%` : '0%' }}
                     />
                   </div>
                 </div>
               </RiftCardContent>
             </RiftCard>
 
             <RiftCard>
               <RiftCardContent className="py-4">
                 <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-diamond/10">
                     <TrendingUp className="h-6 w-6 text-diamond" />
                   </div>
                   <div>
                     <p className="text-2xl font-display font-bold">${tournament.prize_pool.toLocaleString()}</p>
                     <p className="text-xs text-muted-foreground">{t('tournamentStats.prizePool')}</p>
                   </div>
                 </div>
                 {tournament.registration_fee > 0 && (
                   <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                     <Badge variant="secondary">${tournament.registration_fee} {t('tournamentStats.entryFee')}</Badge>
                   </div>
                 )}
               </RiftCardContent>
             </RiftCard>
 
             <RiftCard>
               <RiftCardContent className="py-4">
                 <div className="flex items-center gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-info/10">
                     <Calendar className="h-6 w-6 text-info" />
                   </div>
                   <div>
                     <p className="text-2xl font-display font-bold">
                       {daysUntilStart > 0 ? daysUntilStart : Math.abs(daysUntilStart)}
                     </p>
                     <p className="text-xs text-muted-foreground">
                       {daysUntilStart > 0 
                         ? t('tournamentStats.daysUntilStart') 
                         : t('tournamentStats.daysSinceStart')}
                     </p>
                   </div>
                 </div>
                 <div className="mt-3 text-xs text-muted-foreground">
                   {format(startDate, "PPP")}
                 </div>
               </RiftCardContent>
             </RiftCard>
           </motion.div>
 
           {/* Charts Grid */}
           <div className="grid gap-6 lg:grid-cols-2 mb-8">
             {/* Registration Status Pie */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
             >
               <RiftCard>
                 <RiftCardHeader>
                   <RiftCardTitle className="flex items-center gap-2">
                     <PieChartIcon className="h-5 w-5 text-primary" />
                     {t('tournamentStats.registrationStatus')}
                   </RiftCardTitle>
                 </RiftCardHeader>
                 <RiftCardContent>
                   {registrationStatusData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={250}>
                       <PieChart>
                         <Pie
                           data={registrationStatusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={90}
                           paddingAngle={4}
                           dataKey="value"
                           label={({ name, value }) => `${name}: ${value}`}
                           labelLine={false}
                         >
                           {registrationStatusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: 'hsl(var(--card))', 
                             border: '1px solid hsl(var(--border))',
                             borderRadius: '4px'
                           }}
                         />
                         <Legend />
                       </PieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                       {t('tournamentStats.noRegistrations')}
                     </div>
                   )}
                   <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-success mb-1">
                         <CheckCircle className="h-4 w-4" />
                         <span className="font-bold">{confirmedCount}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.confirmed')}</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-warning mb-1">
                         <Clock className="h-4 w-4" />
                         <span className="font-bold">{pendingCount}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.pending')}</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-destructive mb-1">
                         <XCircle className="h-4 w-4" />
                         <span className="font-bold">{rejectedCount}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.rejected')}</p>
                     </div>
                   </div>
                 </RiftCardContent>
               </RiftCard>
             </motion.div>
 
             {/* Match Progress Pie */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.25 }}
             >
               <RiftCard>
                 <RiftCardHeader>
                   <RiftCardTitle className="flex items-center gap-2">
                     <Activity className="h-5 w-5 text-gold" />
                     {t('tournamentStats.matchProgress')}
                   </RiftCardTitle>
                 </RiftCardHeader>
                 <RiftCardContent>
                   {matchStatusData.length > 0 ? (
                     <ResponsiveContainer width="100%" height={250}>
                       <PieChart>
                         <Pie
                           data={matchStatusData}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={90}
                           paddingAngle={4}
                           dataKey="value"
                           label={({ name, value }) => `${name}: ${value}`}
                           labelLine={false}
                         >
                           {matchStatusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: 'hsl(var(--card))', 
                             border: '1px solid hsl(var(--border))',
                             borderRadius: '4px'
                           }}
                         />
                         <Legend />
                       </PieChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                       {t('tournamentStats.noMatches')}
                     </div>
                   )}
                   <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-success mb-1">
                         <CheckCircle className="h-4 w-4" />
                         <span className="font-bold">{completedMatches}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.completed')}</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-warning mb-1">
                         <Activity className="h-4 w-4" />
                         <span className="font-bold">{inProgressMatches}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.inProgress')}</p>
                     </div>
                     <div className="text-center">
                       <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                         <Clock className="h-4 w-4" />
                         <span className="font-bold">{pendingMatches}</span>
                       </div>
                       <p className="text-xs text-muted-foreground">{t('tournamentStats.pendingMatches')}</p>
                     </div>
                   </div>
                 </RiftCardContent>
               </RiftCard>
             </motion.div>
 
             {/* Matches by Round Bar Chart */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
             >
               <RiftCard>
                 <RiftCardHeader>
                   <RiftCardTitle className="flex items-center gap-2">
                     <BarChart3 className="h-5 w-5 text-diamond" />
                     {t('tournamentStats.matchesByRound')}
                   </RiftCardTitle>
                 </RiftCardHeader>
                 <RiftCardContent>
                   {matchesByRound.length > 0 ? (
                     <ResponsiveContainer width="100%" height={250}>
                       <BarChart data={matchesByRound}>
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis 
                           dataKey="round" 
                           tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                           axisLine={{ stroke: 'hsl(var(--border))' }}
                         />
                         <YAxis 
                           tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                           axisLine={{ stroke: 'hsl(var(--border))' }}
                         />
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: 'hsl(var(--card))', 
                             border: '1px solid hsl(var(--border))',
                             borderRadius: '4px'
                           }}
                           formatter={(value, name) => [
                             value, 
                             name === 'completed' ? t('tournamentStats.completed') : t('tournamentStats.remaining')
                           ]}
                         />
                         <Legend />
                         <Bar 
                           dataKey="completed" 
                           name={t('tournamentStats.completed')}
                           fill={CHART_COLORS.success} 
                           radius={[4, 4, 0, 0]}
                         />
                         <Bar 
                           dataKey="remaining" 
                           name={t('tournamentStats.remaining')}
                           fill={CHART_COLORS.muted} 
                           radius={[4, 4, 0, 0]}
                         />
                       </BarChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                       {t('tournamentStats.noMatches')}
                     </div>
                   )}
                 </RiftCardContent>
               </RiftCard>
             </motion.div>
 
             {/* Registration Timeline */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.35 }}
             >
               <RiftCard>
                 <RiftCardHeader>
                   <RiftCardTitle className="flex items-center gap-2">
                     <TrendingUp className="h-5 w-5 text-success" />
                     {t('tournamentStats.registrationTimeline')}
                   </RiftCardTitle>
                 </RiftCardHeader>
                 <RiftCardContent>
                   {registrationTimeline.length > 0 ? (
                     <ResponsiveContainer width="100%" height={250}>
                       <AreaChart data={registrationTimeline}>
                         <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                         <XAxis 
                           dataKey="date" 
                           tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                           axisLine={{ stroke: 'hsl(var(--border))' }}
                         />
                         <YAxis 
                           tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                           axisLine={{ stroke: 'hsl(var(--border))' }}
                         />
                         <Tooltip 
                           contentStyle={{ 
                             backgroundColor: 'hsl(var(--card))', 
                             border: '1px solid hsl(var(--border))',
                             borderRadius: '4px'
                           }}
                           formatter={(value, name) => [
                             value, 
                             name === 'cumulative' ? t('tournamentStats.total') : t('tournamentStats.newRegistrations')
                           ]}
                         />
                         <Area 
                           type="monotone" 
                           dataKey="cumulative" 
                           name={t('tournamentStats.total')}
                           stroke={CHART_COLORS.primary} 
                           fill={CHART_COLORS.primary}
                           fillOpacity={0.2}
                         />
                       </AreaChart>
                     </ResponsiveContainer>
                   ) : (
                     <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                       {t('tournamentStats.noRegistrations')}
                     </div>
                   )}
                 </RiftCardContent>
               </RiftCard>
             </motion.div>
           </div>
 
           {/* Top Performers */}
           {topPerformers.length > 0 && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
             >
               <RiftCard>
                 <RiftCardHeader>
                   <RiftCardTitle className="flex items-center gap-2">
                     <Trophy className="h-5 w-5 text-gold" />
                     {t('tournamentStats.topPerformers')}
                   </RiftCardTitle>
                 </RiftCardHeader>
                 <RiftCardContent>
                   <div className="grid gap-3 md:grid-cols-5">
                     {topPerformers.map((player, index) => (
                       <div 
                         key={player.id}
                         className="flex items-center gap-3 p-3 rounded-sm bg-secondary/30 border border-border"
                       >
                         <div className={`flex h-8 w-8 items-center justify-center rounded-sm font-bold text-sm ${
                           index === 0 ? 'bg-gold/20 text-gold' :
                           index === 1 ? 'bg-muted text-muted-foreground' :
                           index === 2 ? 'bg-orange-500/20 text-orange-400' :
                           'bg-secondary text-muted-foreground'
                         }`}>
                           #{index + 1}
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="font-medium text-sm truncate">{player.name}</p>
                           <p className="text-xs text-muted-foreground">
                             {player.wins} {t('tournamentStats.wins')}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </RiftCardContent>
               </RiftCard>
             </motion.div>
           )}
         </div>
       </main>
       <Footer />
     </div>
   );
 };
 
 export default TournamentStats;