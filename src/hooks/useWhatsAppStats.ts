import { useQuery } from "@tanstack/react-query";

export interface WhatsAppStats {
  activeChats: number;
  messagesToday: number;
  avgResponseTime: string;
  totalContacts: number;
  conversionRate: number;
  messagesThisWeek: number;
}

export const useWhatsAppStats = () => {
  return useQuery({
    queryKey: ["whatsapp_stats"],
    queryFn: async (): Promise<WhatsAppStats> => {
      // Simular dados estatísticos
      // Em produção, isso viria do Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        activeChats: 8,
        messagesToday: 24,
        avgResponseTime: "2m",
        totalContacts: 156,
        conversionRate: 18.5,
        messagesThisWeek: 142
      };
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};