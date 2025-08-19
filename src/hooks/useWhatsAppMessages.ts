import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: string;
  fromMe: boolean;
  status?: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
}

// Mock data - em produção viria do Supabase
const mockMessages: Record<string, WhatsAppMessage[]> = {
  "1": [
    {
      id: "1",
      content: "Olá! Como posso ajudá-lo hoje?",
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      fromMe: true,
      status: 'read',
      type: 'text'
    },
    {
      id: "2", 
      content: "Olá, gostaria de saber mais sobre o produto",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      fromMe: false,
      type: 'text'
    },
    {
      id: "3",
      content: "Estou interessado em conhecer os planos disponíveis",
      timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      fromMe: false,
      type: 'text'
    }
  ],
  "2": [
    {
      id: "4",
      content: "Oi Maria! Obrigado pelo interesse em nossos serviços.",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      fromMe: true,
      status: 'read',
      type: 'text'
    },
    {
      id: "5",
      content: "Obrigada pelas informações!",
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      fromMe: false,
      type: 'text'
    }
  ],
  "3": [
    {
      id: "6",
      content: "Olá Pedro! Nossos horários de agendamento são de segunda a sexta, das 8h às 18h.",
      timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      fromMe: true,
      status: 'delivered',
      type: 'text'
    },
    {
      id: "7",
      content: "Quando posso fazer o agendamento?",
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      fromMe: false,
      type: 'text'
    }
  ]
};

export const useWhatsAppMessages = (chatId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["whatsapp_messages", chatId],
    queryFn: async (): Promise<WhatsAppMessage[]> => {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockMessages[chatId] || [];
    },
    enabled: !!chatId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      // Simular envio de mensagem
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date().toISOString(),
        fromMe: true,
        status: 'sent',
        type: 'text'
      };

      return newMessage;
    },
    onSuccess: (newMessage) => {
      // Atualizar cache local
      queryClient.setQueryData(
        ["whatsapp_messages", chatId],
        (oldMessages: WhatsAppMessage[] = []) => [...oldMessages, newMessage]
      );

      // Simular mudança de status após delay
      setTimeout(() => {
        queryClient.setQueryData(
          ["whatsapp_messages", chatId],
          (oldMessages: WhatsAppMessage[] = []) => 
            oldMessages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'delivered' as const }
                : msg
            )
        );
      }, 2000);

      setTimeout(() => {
        queryClient.setQueryData(
          ["whatsapp_messages", chatId],
          (oldMessages: WhatsAppMessage[] = []) => 
            oldMessages.map(msg => 
              msg.id === newMessage.id 
                ? { ...msg, status: 'read' as const }
                : msg
            )
        );
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao enviar mensagem:', error);
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSending: sendMessageMutation.isPending,
  };
};