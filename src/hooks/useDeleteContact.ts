import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface DeleteContactParams {
  phoneNumber: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useDeleteContact = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const deleteContactMutation = useMutation({
    mutationFn: async ({ phoneNumber }: { phoneNumber: string }) => {
      if (!empresaId) {
        throw new Error("Empresa ID não encontrado");
      }

      // Use direct database operations instead of Edge Function
      // 1. Delete from novos_leads
      const { error: leadsError } = await supabase
        .from('novos_leads')
        .delete()
        .eq('number', phoneNumber)
        .eq('empresa_id', empresaId);

      if (leadsError) {
        console.error('Error deleting from novos_leads:', leadsError);
        throw new Error(`Failed to delete lead: ${leadsError.message}`);
      }

      // 2. Delete from memoria_ai
      const { error: memoriaError } = await supabase
        .from('memoria_ai')
        .delete()
        .eq('session_id', phoneNumber)
        .eq('empresa_id', empresaId);

      if (memoriaError) {
        console.error('Error deleting from memoria_ai:', memoriaError);
        // Don't throw here - it's ok if memoria_ai doesn't exist
      }

      return { success: true, phone_number: phoneNumber };
    },
    onSuccess: () => {
      // Invalidate all related caches
      queryClient.invalidateQueries({ queryKey: ["whatsapp_leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["recent_leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_conversations"] });
      queryClient.invalidateQueries({ queryKey: ["lead_by_phone"] });
      
      toast({
        title: "Contato excluído",
        description: "O contato e todas as suas conversas foram removidos com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      console.error("Erro ao excluir contato:", error);
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir o contato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    deleteContact: deleteContactMutation.mutate,
    deleteContactAsync: deleteContactMutation.mutateAsync,
    isDeleting: deleteContactMutation.isPending,
    error: deleteContactMutation.error,
  };
};

// Hook para exclusão em lote
export const useBulkDeleteContacts = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ phoneNumbers }: { phoneNumbers: string[] }) => {
      if (!empresaId) {
        throw new Error("Empresa ID não encontrado");
      }

      // Use direct database operations instead of Edge Function
      const results = await Promise.all(
        phoneNumbers.map(async (phoneNumber) => {
          // 1. Delete from novos_leads
          const { error: leadsError } = await supabase
            .from('novos_leads')
            .delete()
            .eq('number', phoneNumber)
            .eq('empresa_id', empresaId);

          if (leadsError) {
            throw new Error(`Failed to delete lead ${phoneNumber}: ${leadsError.message}`);
          }

          // 2. Delete from memoria_ai
          const { error: memoriaError } = await supabase
            .from('memoria_ai')
            .delete()
            .eq('session_id', phoneNumber)
            .eq('empresa_id', empresaId);

          // Don't fail if memoria_ai doesn't exist
          return { success: true, phone_number: phoneNumber };
        })
      );

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp_leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["recent_leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead_conversations"] });
      
      toast({
        title: "Contatos excluídos",
        description: "Todos os contatos selecionados foram removidos com sucesso.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Não foi possível excluir alguns contatos.",
        variant: "destructive",
      });
    },
  });

  return {
    bulkDelete: bulkDeleteMutation.mutate,
    bulkDeleteAsync: bulkDeleteMutation.mutateAsync,
    isDeleting: bulkDeleteMutation.isPending,
    error: bulkDeleteMutation.error,
  };
};