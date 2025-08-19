
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useLeadTags = (leadId: number) => {
  const { empresaData } = useAuth();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ["lead_tags", leadId, empresaData?.id],
    queryFn: async () => {
      if (!empresaData?.id) return [];

      const { data, error } = await supabase
        .from('novos_leads')
        .select('tags')
        .eq('id', leadId)
        .eq('empresa_id', empresaData.id)
        .single();

      if (error) throw error;
      
      // Garantir que as tags sejam sempre strings
      const tags = data.tags || [];
      return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
    },
    enabled: !!empresaData?.id && !!leadId,
  });

  const updateTagsMutation = useMutation({
    mutationFn: async (newTags: string[]) => {
      if (!empresaData?.id) throw new Error("Empresa não encontrada");

      const { error } = await supabase
        .from('novos_leads')
        .update({ tags: newTags })
        .eq('id', leadId)
        .eq('empresa_id', empresaData.id);

      if (error) throw error;
      return newTags;
    },
    onSuccess: (newTags) => {
      queryClient.setQueryData(["lead_tags", leadId, empresaData?.id], newTags);
      queryClient.invalidateQueries({ queryKey: ["novos_leads"] });
      toast.success("Tags atualizadas com sucesso!");
    },
    onError: (error) => {
      console.error('Erro ao atualizar tags:', error);
      toast.error("Erro ao atualizar tags");
    },
  });

  return {
    tags,
    isLoading,
    updateTags: updateTagsMutation.mutate,
    isUpdating: updateTagsMutation.isPending,
  };
};
