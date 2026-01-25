import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamLogoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const uploadLogo = useMutation({
    mutationFn: async ({ teamId, file }: { teamId: string; file: File }) => {
      setUploading(true);
      
      const fileExt = file.name.split(".").pop();
      const filePath = `${teamId}/logo.${fileExt}`;

      // Delete existing logo if any
      const { data: existingFiles } = await supabase.storage
        .from("team-logos")
        .list(teamId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from("team-logos")
          .remove(existingFiles.map(f => `${teamId}/${f.name}`));
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("team-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("team-logos")
        .getPublicUrl(filePath);

      // Update team record with logo URL
      const { error: updateError } = await supabase
        .from("teams")
        .update({ logo_url: `${publicUrl}?t=${Date.now()}` })
        .eq("id", teamId);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["team", variables.teamId] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      toast({ title: "Team logo updated!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error uploading logo", 
        description: error.message, 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      setUploading(false);
    },
  });

  return { uploadLogo, uploading };
};
