import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateGameData {
  name: string;
  icon: string;
  description?: string;
}

interface UpdateGameData {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export const useCreateGame = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateGameData) => {
      const { data: game, error } = await supabase
        .from("games")
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return game;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating game", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
};

export const useUpdateGame = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateGameData) => {
      const { data: game, error } = await supabase
        .from("games")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return game;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game updated successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating game", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
};

export const useDeleteGame = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("games")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast({ title: "Game deleted successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error deleting game", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
};
