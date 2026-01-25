import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useUserRegistration = (tournamentId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-registration", tournamentId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId && !!user,
  });
};

export const useTeamRegistration = (tournamentId: string, teamId?: string) => {
  return useQuery({
    queryKey: ["team-registration", tournamentId, teamId],
    queryFn: async () => {
      if (!teamId) return null;
      
      const { data, error } = await supabase
        .from("tournament_registrations")
        .select("*")
        .eq("tournament_id", tournamentId)
        .eq("team_id", teamId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!tournamentId && !!teamId,
  });
};

export const useRegistrationCount = (tournamentId: string) => {
  return useQuery({
    queryKey: ["registration-count", tournamentId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("tournament_registrations")
        .select("*", { count: "exact", head: true })
        .eq("tournament_id", tournamentId)
        .in("status", ["pending", "confirmed"]);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!tournamentId,
  });
};

export const useRegisterForTournament = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tournamentId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data, error } = await supabase
        .from("tournament_registrations")
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("You are already registered for this tournament");
        }
        throw error;
      }
      return data;
    },
    onSuccess: (_, tournamentId) => {
      queryClient.invalidateQueries({ queryKey: ["user-registration", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["registration-count", tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations", tournamentId] });
      toast({ title: "Registration submitted!", description: "Awaiting organizer approval." });
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });
};

export const useRegisterTeamForTournament = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ tournamentId, teamId }: { tournamentId: string; teamId: string }) => {
      const { data, error } = await supabase
        .from("tournament_registrations")
        .insert({
          tournament_id: tournamentId,
          team_id: teamId,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("This team is already registered for this tournament");
        }
        throw error;
      }
      return { registration: data, tournamentId, teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-registration", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["registration-count", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations", data.tournamentId] });
      toast({ title: "Team registration submitted!", description: "Awaiting organizer approval." });
    },
    onError: (error) => {
      toast({ title: "Team registration failed", description: error.message, variant: "destructive" });
    },
  });
};

export const useCancelRegistration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ registrationId, tournamentId }: { registrationId: string; tournamentId: string }) => {
      const { error } = await supabase
        .from("tournament_registrations")
        .delete()
        .eq("id", registrationId);
      
      if (error) throw error;
      return { tournamentId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-registration", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["team-registration", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["registration-count", data.tournamentId] });
      queryClient.invalidateQueries({ queryKey: ["tournament-registrations", data.tournamentId] });
      toast({ title: "Registration cancelled" });
    },
    onError: (error) => {
      toast({ title: "Failed to cancel", description: error.message, variant: "destructive" });
    },
  });
};
