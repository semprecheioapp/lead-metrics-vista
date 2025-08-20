import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface ResolveConversationData {
  chatId: string;
  empresa_id: number;
  nome: string;
  numero: string;
}

export function useResolveConversation() {
  return useMutation({
    mutationFn: async (data: ResolveConversationData) => {
      // Simplificar: apenas enviar webhook direto
      const webhookData = {
        empresa_id: data.empresa_id,
        nome: data.nome,
        numero: data.numero,
        chat_id: data.chatId,
      };

      const response = await fetch('https://wb.semprecheioapp.com.br/webhook/pesquisa_satisfacao_dashmbk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`);
      }

      return await response.json();
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