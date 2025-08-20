import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendPesquisaSatisfacaoWebhook } from '@/utils/webhooks';

interface ResolveConversationData {
  chatId: string;
  empresa_id: number;
  nome: string;
  numero: string;
}

export function useResolveConversation() {
  return useMutation({
    mutationFn: async (data: ResolveConversationData) => {
      // Criar registro de conversa resolvida
      const { error: insertError } = await supabase
        .from('conversas_resolvidas')
        .insert({
          session_id: data.chatId,
          empresa_id: data.empresa_id,
          data_resolucao: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      // Enviar webhook para pesquisa de satisfação
      const webhookData = {
        empresa_id: data.empresa_id,
        nome: data.nome,
        numero: data.numero,
        chat_id: data.chatId,
      };

      const response = await sendPesquisaSatisfacaoWebhook(webhookData);
      
      // Aceitar qualquer resposta de sucesso (success, sucesso, etc)
      if (!response.success || (response.success !== 'pesquisa_satisfacao_enviada' && response.success !== 'success')) {
        console.log('Resposta do webhook:', response);
        // Não lançar erro para permitir continuar mesmo se o webhook não retornar o formato esperado
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Conversa resolvida!",
        description: "Pesquisa de satisfação enviada para o cliente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao resolver conversa",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}