import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlayerTeam {
  id: string;
  name: string;
  tag: string;
  logo_url: string | null;
  role: string;
}

export const usePlayerTeams = (userId: string) => {
  return useQuery({
    queryKey: ["player-teams", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select(`
          role,
          team:teams(id, name, tag, logo_url)
        `)
        .eq("user_id", userId);

      if (error) throw error;
      return (data || [])
        .filter(d => d.team)
        .map(d => ({
          id: (d.team as any).id,
          name: (d.team as any).name,
          tag: (d.team as any).tag,
          logo_url: (d.team as any).logo_url,
          role: d.role,
        })) as PlayerTeam[];
    },
    enabled: !!userId,
  });
};
