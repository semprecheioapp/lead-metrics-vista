import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface AddContactData {
  name: string;
  number: string;
}

export const useAddContact = () => {
  const { empresaData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: AddContactData) => {
      if (!empresaData?.id) {
        throw new Error("Empresa ID não encontrado");
      }

      // Verificar se o número já existe para essa empresa
      const { data: existingLead, error: checkError } = await supabase
        .from('novos_leads')
        .select('id')
        .eq('empresa_id', empresaData.id)
        .eq('number', contactData.number)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingLead) {
        throw new Error("Este número já existe na sua lista de contatos");
      }

      // Inserir novo lead
      const { data, error } = await supabase
        .from('novos_leads')
        .insert({
          name: contactData.name,
          number: contactData.number,
          empresa_id: empresaData.id,
          origem: 'whatsapp',
          etapa: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      // Invalidar cache para atualizar a lista
      queryClient.invalidateQueries({ queryKey: ["whatsapp_leads"] });
      
      toast({
        title: "Contato adicionado",
        description: "O contato foi criado com sucesso e está pronto para conversa",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao adicionar contato",
        description: error.message,
        variant: "destructive",
      });
    }
  });
};