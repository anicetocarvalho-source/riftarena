import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TeamMemberHistory {
  id: string;
  team_id: string;
  user_id: string;
  action: "joined" | "left" | "removed" | "promoted" | "demoted";
  role: string | null;
  performed_by: string | null;
  created_at: string;
  user?: { id: string; username: string; avatar_url: string | null };
}

export const useTeamHistory = (teamId: string) => {
  return useQuery({
    queryKey: ["team-history", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_member_history")
        .select(`
          *,
          user:profiles!team_member_history_user_id_fkey(id, username, avatar_url)
        `)
        .eq("team_id", teamId)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as TeamMemberHistory[];
    },
    enabled: !!teamId,
  });
};
