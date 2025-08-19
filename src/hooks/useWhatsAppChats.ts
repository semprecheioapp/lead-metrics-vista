import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface WhatsAppChat {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  lastSeen?: string;
  unreadCount: number;
  isOnline: boolean;
  isStarred: boolean;
  lastMessageStatus?: 'sent' | 'delivered' | 'read';
}

export const useWhatsAppChats = () => {
  return useQuery({
    queryKey: ["whatsapp_chats"],
    queryFn: async (): Promise<WhatsAppChat[]> => {
      // Por enquanto retornamos dados mock
      // Em produção, isso viria do Supabase
      return [
        {
          id: "1",
          name: "João Silva",
          lastMessage: "Olá, gostaria de saber mais sobre o produto",
          lastMessageTime: new Date().toISOString(),
          unreadCount: 2,
          isOnline: true,
          isStarred: false,
          lastMessageStatus: 'delivered'
        },
        {
          id: "2", 
          name: "Maria Santos",
          lastMessage: "Obrigada pelas informações!",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          unreadCount: 0,
          isOnline: false,
          isStarred: true,
          lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          lastMessageStatus: 'read'
        },
        {
          id: "3",
          name: "Pedro Costa", 
          lastMessage: "Quando posso fazer o agendamento?",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          unreadCount: 1,
          isOnline: false,
          isStarred: false,
          lastSeen: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
          lastMessageStatus: 'sent'
        },
        {
          id: "4",
          name: "Ana Rodrigues",
          lastMessage: "Perfeito! Muito obrigada pela atenção",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          unreadCount: 0,
          isOnline: true,
          isStarred: false,
          lastMessageStatus: 'read'
        },
        {
          id: "5",
          name: "Carlos Mendes",
          lastMessage: "Vocês atendem no sábado?",
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
          unreadCount: 3,
          isOnline: false,
          isStarred: true,
          lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          lastMessageStatus: 'delivered'
        }
      ];
    },
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
};