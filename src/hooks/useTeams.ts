import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Team, TeamMember, TeamInvite, CreateTeamData } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

export const useTeams = () => {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          captain:profiles!teams_captain_id_fkey(id, username, avatar_url)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Team[];
    },
  });
};

export const useTeam = (id: string) => {
  return useQuery({
    queryKey: ["team", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select(`
          *,
          captain:profiles!teams_captain_id_fkey(id, username, avatar_url)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      return data as Team;
    },
    enabled: !!id,
  });
};

export const useTeamMembers = (teamId: string) => {
  return useQuery({
    queryKey: ["team-members", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq("team_id", teamId)
        .order("joined_at");
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
};

export const useUserTeams = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-teams", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          team:teams(
            *,
            captain:profiles!teams_captain_id_fkey(id, username, avatar_url)
          )
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data.map(d => d.team).filter(Boolean) as Team[];
    },
    enabled: !!user,
  });
};

export const useUserInvites = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ["user-invites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("team_invites")
        .select(`
          *,
          team:teams(
            *,
            captain:profiles!teams_captain_id_fkey(id, username, avatar_url)
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "pending");
      
      if (error) throw error;
      return data as TeamInvite[];
    },
    enabled: !!user,
  });
};

export const useTeamInvites = (teamId: string) => {
  return useQuery({
    queryKey: ["team-invites", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invites")
        .select(`
          *,
          user:profiles(id, username, avatar_url)
        `)
        .eq("team_id", teamId)
        .eq("status", "pending");
      
      if (error) throw error;
      return data as TeamInvite[];
    },
    enabled: !!teamId,
  });
};

export const useCreateTeam = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      if (!user) throw new Error("Not authenticated");
      
      const { data: team, error } = await supabase
        .from("teams")
        .insert({
          ...data,
          captain_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("Team tag is already taken");
        }
        throw error;
      }
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      toast({ title: "Team created successfully!" });
    },
    onError: (error) => {
      toast({ title: "Error creating team", description: error.message, variant: "destructive" });
    },
  });
};

export const useUpdateTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Team> & { id: string }) => {
      const { data: team, error } = await supabase
        .from("teams")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return team;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["team", variables.id] });
      toast({ title: "Team updated!" });
    },
    onError: (error) => {
      toast({ title: "Error updating team", description: error.message, variant: "destructive" });
    },
  });
};

export const useInviteToTeam = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ teamId, username }: { teamId: string; username: string }) => {
      // Find user by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();
      
      if (profileError) throw profileError;
      if (!profile) throw new Error("User not found");
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from("team_members")
        .select("id")
        .eq("team_id", teamId)
        .eq("user_id", profile.id)
        .maybeSingle();
      
      if (existingMember) throw new Error("User is already a team member");
      
      const { data, error } = await supabase
        .from("team_invites")
        .insert({
          team_id: teamId,
          user_id: profile.id,
          status: "pending",
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          throw new Error("User already has a pending invite");
        }
        throw error;
      }
      return { invite: data, teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-invites", data.teamId] });
      toast({ title: "Invite sent!" });
    },
    onError: (error) => {
      toast({ title: "Error sending invite", description: error.message, variant: "destructive" });
    },
  });
};

export const useRespondToInvite = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ inviteId, teamId, accept }: { inviteId: string; teamId: string; accept: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      
      if (accept) {
        // Add user to team
        const { error: memberError } = await supabase
          .from("team_members")
          .insert({
            team_id: teamId,
            user_id: user.id,
            role: "member",
          });
        
        if (memberError) throw memberError;
      }
      
      // Update invite status
      const { error } = await supabase
        .from("team_invites")
        .update({ status: accept ? "accepted" : "declined" })
        .eq("id", inviteId);
      
      if (error) throw error;
      return { teamId, accept };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-invites"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-members", data.teamId] });
      toast({ title: data.accept ? "You joined the team!" : "Invite declined" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ memberId, teamId }: { memberId: string; teamId: string }) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);
      
      if (error) throw error;
      return { teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-members", data.teamId] });
      toast({ title: "Member removed" });
    },
    onError: (error) => {
      toast({ title: "Error removing member", description: error.message, variant: "destructive" });
    },
  });
};

export const useLeaveTeam = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (teamId: string) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return { teamId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team-members", data.teamId] });
      toast({ title: "You left the team" });
    },
    onError: (error) => {
      toast({ title: "Error leaving team", description: error.message, variant: "destructive" });
    },
  });
};
