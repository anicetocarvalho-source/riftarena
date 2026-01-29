import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { RiftCard, RiftCardContent, RiftCardHeader, RiftCardTitle } from "@/components/ui/rift-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  useSponsors, 
  useSponsorStats, 
  useSponsoredTournaments, 
  useUnassignedTournaments,
  useAssignSponsor,
  useRemoveSponsor,
  usePromotableUsers,
  usePromoteToSponsor,
  useRemoveSponsorRole
} from "@/hooks/useSponsorManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Shield, DollarSign, Trophy, Users, TrendingUp, 
  Loader2, Link2, Unlink, Calendar, Award, UserPlus, UserMinus
} from "lucide-react";

const AdminSponsors = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: sponsors, isLoading: sponsorsLoading } = useSponsors();
  const { data: stats } = useSponsorStats();
  const { data: sponsoredTournaments } = useSponsoredTournaments();
  const { data: unassignedTournaments } = useUnassignedTournaments();
  const { data: promotableUsers } = usePromotableUsers();
  const assignSponsor = useAssignSponsor();
  const removeSponsor = useRemoveSponsor();
  const promoteToSponsor = usePromoteToSponsor();
  const removeSponsorRole = useRemoveSponsorRole();

  const [selectedSponsor, setSelectedSponsor] = useState<string>("");
  const [selectedTournament, setSelectedTournament] = useState<string>("");
  const [selectedUserToPromote, setSelectedUserToPromote] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [addSponsorDialogOpen, setAddSponsorDialogOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, authLoading, navigate]);

  const getSponsorStats = (sponsorId: string) => {
    return stats?.find(s => s.sponsorId === sponsorId) || {
      tournamentsSponsored: 0,
      totalPrizePool: 0,
      totalParticipants: 0,
    };
  };

  const handleAssignSponsor = async () => {
    if (!selectedSponsor || !selectedTournament) return;
    await assignSponsor.mutateAsync({ 
      tournamentId: selectedTournament, 
      sponsorId: selectedSponsor 
    });
    setAssignDialogOpen(false);
    setSelectedSponsor("");
    setSelectedTournament("");
  };

  const handleRemoveSponsor = async (tournamentId: string) => {
    await removeSponsor.mutateAsync(tournamentId);
  };

  const handlePromoteToSponsor = async () => {
    if (!selectedUserToPromote) return;
    await promoteToSponsor.mutateAsync(selectedUserToPromote);
    setAddSponsorDialogOpen(false);
    setSelectedUserToPromote("");
  };

  const handleRemoveSponsorRole = async (userId: string) => {
    await removeSponsorRole.mutateAsync(userId);
  };

  if (authLoading || sponsorsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  // Calculate totals
  const totalSponsors = sponsors?.length || 0;
  const totalSponsoredTournaments = sponsoredTournaments?.length || 0;
  const totalPrizePool = stats?.reduce((sum, s) => sum + s.totalPrizePool, 0) || 0;
  const availableTournaments = unassignedTournaments?.length || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="diamond" className="gap-1">
                    <Shield className="h-3 w-3" />
                    Admin Only
                  </Badge>
                </div>
                <h1 className="font-display text-4xl font-bold uppercase tracking-wide mb-4">
                  Sponsor Management
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  Gere sponsors, parcerias e atribui patrocinadores a torneios.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Add New Sponsor Dialog */}
                <Dialog open={addSponsorDialogOpen} onOpenChange={setAddSponsorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="rift" className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Add New Sponsor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Sponsor</DialogTitle>
                      <DialogDescription>
                        Promove um utilizador existente a sponsor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Select User</label>
                        <Select value={selectedUserToPromote} onValueChange={setSelectedUserToPromote}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a user to promote..." />
                          </SelectTrigger>
                          <SelectContent>
                            {promotableUsers?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <span>{user.username}</span>
                                  {user.country && (
                                    <span className="text-xs text-muted-foreground">({user.country})</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {promotableUsers?.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          Todos os utilizadores já são sponsors.
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setAddSponsorDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="rift" 
                        onClick={handlePromoteToSponsor}
                        disabled={!selectedUserToPromote || promoteToSponsor.isPending}
                      >
                        {promoteToSponsor.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Promote to Sponsor
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Assign Sponsor to Tournament Dialog */}
                <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="rift-outline" className="gap-2" disabled={!unassignedTournaments?.length || !sponsors?.length}>
                      <Link2 className="h-4 w-4" />
                      Assign to Tournament
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Assign Sponsor to Tournament</DialogTitle>
                      <DialogDescription>
                        Associa um sponsor a um torneio disponível.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sponsor</label>
                        <Select value={selectedSponsor} onValueChange={setSelectedSponsor}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a sponsor..." />
                          </SelectTrigger>
                          <SelectContent>
                            {sponsors?.map((sponsor) => (
                              <SelectItem key={sponsor.user_id} value={sponsor.user_id}>
                                {sponsor.profile?.username || "Unknown"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tournament</label>
                        <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a tournament..." />
                          </SelectTrigger>
                          <SelectContent>
                            {unassignedTournaments?.map((tournament) => (
                              <SelectItem key={tournament.id} value={tournament.id}>
                                {tournament.game?.icon} {tournament.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setAssignDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        variant="rift" 
                        onClick={handleAssignSponsor}
                        disabled={!selectedSponsor || !selectedTournament || assignSponsor.isPending}
                      >
                        {assignSponsor.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                        Assign
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Overview Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8"
          >
            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-primary/10 text-primary">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{totalSponsors}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Sponsors</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-success/10 text-success">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{totalSponsoredTournaments}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Sponsored Tournaments</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-warning/10 text-warning">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">${totalPrizePool.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Prize Pool</p>
                </div>
              </RiftCardContent>
            </RiftCard>

            <RiftCard>
              <RiftCardContent className="flex items-center gap-4 py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-muted text-muted-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-3xl font-display font-bold">{availableTournaments}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Available Tournaments</p>
                </div>
              </RiftCardContent>
            </RiftCard>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Sponsors List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Registered Sponsors
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {sponsors && sponsors.length > 0 ? (
                    <div className="space-y-4">
                      {sponsors.map((sponsor) => {
                        const sponsorStats = getSponsorStats(sponsor.user_id);
                        return (
                          <div 
                            key={sponsor.id} 
                            className="flex items-center justify-between p-4 rounded-sm bg-secondary/50 hover:bg-secondary/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={sponsor.profile?.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {sponsor.profile?.username?.charAt(0).toUpperCase() || "S"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{sponsor.profile?.username || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">
                                  {sponsor.profile?.country || "Unknown location"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="font-display font-bold">{sponsorStats.tournamentsSponsored}</p>
                                  <p className="text-xs text-muted-foreground">Tournaments</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-display font-bold text-success">
                                    ${sponsorStats.totalPrizePool.toLocaleString()}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Prize Pool</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveSponsorRole(sponsor.user_id)}
                                disabled={removeSponsorRole.isPending}
                                title="Remove sponsor role"
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <DollarSign className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No sponsors registered yet.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1 mb-4">
                        Click "Add New Sponsor" to promote a user.
                      </p>
                      <Button 
                        variant="rift-outline" 
                        size="sm"
                        onClick={() => setAddSponsorDialogOpen(true)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add New Sponsor
                      </Button>
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>

            {/* Active Partnerships */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <RiftCard className="h-full">
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Active Partnerships
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  {sponsoredTournaments && sponsoredTournaments.length > 0 ? (
                    <div className="space-y-3">
                      {sponsoredTournaments.slice(0, 8).map((tournament) => {
                        const sponsor = sponsors?.find(s => s.user_id === tournament.sponsor_id);
                        return (
                          <div 
                            key={tournament.id} 
                            className="flex items-center justify-between p-3 rounded-sm bg-secondary/50"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-background text-xl shrink-0">
                                {tournament.game?.icon || "🎮"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium truncate">{tournament.name}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{sponsor?.profile?.username || "Unknown"}</span>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs">
                                    {tournament.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-display font-bold text-success">
                                ${Number(tournament.prize_pool).toLocaleString()}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveSponsor(tournament.id)}
                                disabled={removeSponsor.isPending}
                              >
                                <Unlink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Link2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        No active partnerships.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Assign sponsors to tournaments to create partnerships.
                      </p>
                    </div>
                  )}
                </RiftCardContent>
              </RiftCard>
            </motion.div>
          </div>

          {/* Available Tournaments for Sponsorship */}
          {unassignedTournaments && unassignedTournaments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <RiftCard>
                <RiftCardHeader>
                  <RiftCardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Tournaments Available for Sponsorship
                  </RiftCardTitle>
                </RiftCardHeader>
                <RiftCardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tournament</TableHead>
                        <TableHead>Game</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Prize Pool</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedTournaments.map((tournament) => (
                        <TableRow key={tournament.id}>
                          <TableCell className="font-medium">{tournament.name}</TableCell>
                          <TableCell>
                            <span className="mr-2">{tournament.game?.icon}</span>
                            {tournament.game?.name}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{tournament.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(tournament.start_date).toLocaleDateString("pt-PT")}
                          </TableCell>
                          <TableCell className="font-display font-bold">
                            ${Number(tournament.prize_pool).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="rift-outline" size="sm" disabled={!sponsors?.length}>
                                  <Link2 className="h-4 w-4 mr-2" />
                                  Assign
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Assign Sponsor</DialogTitle>
                                  <DialogDescription>
                                    Seleciona um sponsor para o torneio "{tournament.name}".
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Select 
                                    value={selectedSponsor} 
                                    onValueChange={setSelectedSponsor}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a sponsor..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {sponsors?.map((sponsor) => (
                                        <SelectItem key={sponsor.user_id} value={sponsor.user_id}>
                                          {sponsor.profile?.username || "Unknown"}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                  <Button 
                                    variant="rift" 
                                    onClick={async () => {
                                      if (selectedSponsor) {
                                        await assignSponsor.mutateAsync({ 
                                          tournamentId: tournament.id, 
                                          sponsorId: selectedSponsor 
                                        });
                                        setSelectedSponsor("");
                                      }
                                    }}
                                    disabled={!selectedSponsor || assignSponsor.isPending}
                                  >
                                    {assignSponsor.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    Assign Sponsor
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

export default AdminSponsors;
