import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useFollowups = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const followupsQuery = useQuery({
    queryKey: ["followups", empresaId],
    queryFn: async () => {
      if (!empresaId) throw new Error("Empresa ID não encontrado");

      const { data, error } = await supabase
        .from("followups")
        .select("*")
        .eq("empresa_id", empresaId)
        .order("data_envio", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!empresaId,
  });

  const updateFollowupStatus = useMutation({
    mutationFn: async ({ id, status, erro_detalhes }: { 
      id: string; 
      status: 'agendado' | 'enviado' | 'erro';
      erro_detalhes?: string;
    }) => {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'enviado') {
        updateData.enviado_em = new Date().toISOString();
      }

      if (erro_detalhes) {
        updateData.erro_detalhes = erro_detalhes;
      }

      const { data, error } = await supabase
        .from("followups")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast.success("Status do follow-up atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar follow-up:", error);
      toast.error("Erro ao atualizar follow-up");
    }
  });

  const deleteFollowup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("followups")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast.success("Follow-up removido!");
    },
    onError: (error) => {
      console.error("Erro ao remover follow-up:", error);
      toast.error("Erro ao remover follow-up");
    }
  });

  return {
    followups: followupsQuery.data || [],
    isLoading: followupsQuery.isLoading,
    error: followupsQuery.error,
    updateFollowupStatus: updateFollowupStatus.mutate,
    deleteFollowup: deleteFollowup.mutate,
    isUpdating: updateFollowupStatus.isPending,
    isDeleting: deleteFollowup.isPending,
  };
};