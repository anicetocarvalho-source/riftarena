import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SponsorWithProfile {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    country: string | null;
  } | null;
}

interface SponsorStats {
  sponsorId: string;
  tournamentsSponsored: number;
  totalPrizePool: number;
  totalParticipants: number;
}

export const useSponsors = () => {
  return useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => {
      // First get sponsor role users
      const { data: sponsorRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("role", "sponsor")
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;
      if (!sponsorRoles || sponsorRoles.length === 0) return [];

      // Then get their profiles
      const userIds = sponsorRoles.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, country")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      return sponsorRoles.map(role => ({
        ...role,
        profile: profiles?.find(p => p.id === role.user_id) || null
      })) as SponsorWithProfile[];
    },
  });
};

export const useSponsorStats = () => {
  return useQuery({
    queryKey: ["sponsor-stats"],
    queryFn: async () => {
      const { data: tournaments, error } = await supabase
        .from("tournaments")
        .select("sponsor_id, prize_pool, max_participants")
        .not("sponsor_id", "is", null);

      if (error) throw error;

      // Aggregate stats per sponsor
      const statsMap = new Map<string, SponsorStats>();
      
      tournaments?.forEach(t => {
        if (!t.sponsor_id) return;
        
        const existing = statsMap.get(t.sponsor_id) || {
          sponsorId: t.sponsor_id,
          tournamentsSponsored: 0,
          totalPrizePool: 0,
          totalParticipants: 0,
        };
        
        existing.tournamentsSponsored++;
        existing.totalPrizePool += Number(t.prize_pool) || 0;
        existing.totalParticipants += t.max_participants || 0;
        
        statsMap.set(t.sponsor_id, existing);
      });

      return Array.from(statsMap.values());
    },
  });
};

export const useSponsoredTournaments = (sponsorId?: string) => {
  return useQuery({
    queryKey: ["sponsored-tournaments", sponsorId],
    queryFn: async () => {
      let query = supabase
        .from("tournaments")
        .select(`
          id,
          name,
          status,
          prize_pool,
          start_date,
          sponsor_id,
          game:games(name, icon)
        `)
        .not("sponsor_id", "is", null)
        .order("start_date", { ascending: false });

      if (sponsorId) {
        query = query.eq("sponsor_id", sponsorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: sponsorId !== undefined || true,
  });
};

export const useUnassignedTournaments = () => {
  return useQuery({
    queryKey: ["unassigned-tournaments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tournaments")
        .select(`
          id,
          name,
          status,
          prize_pool,
          start_date,
          game:games(name, icon)
        `)
        .is("sponsor_id", null)
        .in("status", ["draft", "registration"])
        .order("start_date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useAssignSponsor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tournamentId, sponsorId }: { tournamentId: string; sponsorId: string }) => {
      const { error } = await supabase
        .from("tournaments")
        .update({ sponsor_id: sponsorId })
        .eq("id", tournamentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sponsored-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast({ title: "Sponsor assigned successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error assigning sponsor", description: error.message, variant: "destructive" });
    },
  });
};

export const useRemoveSponsor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      const { error } = await supabase
        .from("tournaments")
        .update({ sponsor_id: null })
        .eq("id", tournamentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      queryClient.invalidateQueries({ queryKey: ["sponsor-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sponsored-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-tournaments"] });
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast({ title: "Sponsor removed from tournament" });
    },
    onError: (error) => {
      toast({ title: "Error removing sponsor", description: error.message, variant: "destructive" });
    },
  });
};
