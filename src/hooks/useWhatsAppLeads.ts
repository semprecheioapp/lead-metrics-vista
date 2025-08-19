import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface WhatsAppLead {
  session_id: string; // telefone
  name: string;
  telefone: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  isStarred: boolean;
}

export const useWhatsAppLeads = () => {
  const { empresaData } = useAuth();

  return useQuery({
    queryKey: ["whatsapp_leads", empresaData?.id],
    queryFn: async (): Promise<WhatsAppLead[]> => {
      if (!empresaData?.id) {
        throw new Error("Empresa ID não encontrado");
      }

      // Buscar sessões únicas da memoria_ai com última mensagem
      const { data: memoriaData, error: memoriaError } = await supabase
        .from('memoria_ai')
        .select('session_id, message, created_at')
        .eq('empresa_id', empresaData.id)
        .order('created_at', { ascending: false });

      if (memoriaError) {
        console.error('Erro ao buscar memória:', memoriaError);
        throw memoriaError;
      }

      // Agrupar por session_id e pegar a última mensagem de cada
      const sessionsMap = new Map<string, any>();
      
      memoriaData?.forEach(item => {
        if (!sessionsMap.has(item.session_id)) {
          sessionsMap.set(item.session_id, {
            session_id: item.session_id,
            lastMessage: item.message,
            lastMessageTime: item.created_at,
            messageCount: 1
          });
        } else {
          const existing = sessionsMap.get(item.session_id);
          existing.messageCount += 1;
        }
      });

      const sessions = Array.from(sessionsMap.values());

      // Buscar informações dos leads para obter nomes
      const sessionIds = sessions.map(s => s.session_id);
      const { data: leadsData } = await supabase
        .from('novos_leads')
        .select('number, name')
        .eq('empresa_id', empresaData.id)
        .in('number', sessionIds);

      // Combinar dados
      const leads: WhatsAppLead[] = sessions.map(session => {
        const lead = leadsData?.find(l => l.number === session.session_id);
        
        // Extrair texto da mensagem (pode ser string ou objeto)
        let messageText = '';
        if (typeof session.lastMessage === 'string') {
          messageText = session.lastMessage;
        } else if (session.lastMessage?.content) {
          messageText = session.lastMessage.content;
        } else if (session.lastMessage?.message) {
          messageText = session.lastMessage.message;
        } else {
          messageText = 'Mensagem...';
        }

        // Determinar se há mensagens não lidas (última mensagem é do cliente)
        const isUnread = session.lastMessage && 
          typeof session.lastMessage === 'object' && 
          session.lastMessage.type === 'human';

        return {
          session_id: session.session_id,
          name: lead?.name || `Lead ${session.session_id.slice(-4)}`,
          telefone: session.session_id,
          lastMessage: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          lastMessageTime: session.lastMessageTime,
          unreadCount: isUnread ? 1 : 0,
          isOnline: Math.random() > 0.7, // 30% de chance de estar online
          isStarred: false
        };
      });

      return leads.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
    },
    enabled: !!empresaData?.id,
    refetchInterval: 5000, // Atualizar a cada 5 segundos
  });
};