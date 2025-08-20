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

      const response = await supabase.functions.invoke('delete-lead-with-conversations', {
        body: {
          phone_number: phoneNumber,
          empresa_id: empresaId
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.data;
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
        variant: "success",
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

      const results = await Promise.all(
        phoneNumbers.map(phoneNumber =>
          supabase.functions.invoke('delete-lead-with-conversations', {
            body: {
              phone_number: phoneNumber,
              empresa_id: empresaId
            }
          })
        )
      );

      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error(`${errors.length} contatos não puderam ser excluídos`);
      }

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
        variant: "success",
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