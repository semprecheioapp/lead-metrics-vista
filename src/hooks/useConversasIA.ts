import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useConversasIA = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["conversas_ia", empresaId],
    queryFn: async () => {
      if (!empresaId) return {
        conversations: [],
        activeSessions: 0,
        averageMessages: 0,
        totalTokens: 0,
        averageTokensPerSession: 0,
        messagesBySession: new Map()
      };

      const { data, error } = await supabase
        .from("memoria_ai")
        .select("session_id, created_at, message, data_atual")
        .eq("empresa_id", empresaId)
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Organizar mensagens por sessão (número de telefone)
      const conversations = data || [];
      const messagesBySession = new Map();
      const uniqueSessions = new Set();

      conversations.forEach(row => {
        if (!row.session_id) return;
        
        uniqueSessions.add(row.session_id);

        if (!messagesBySession.has(row.session_id)) {
          messagesBySession.set(row.session_id, []);
        }

        // Usar o formato JSON correto da coluna message
        if (row.message && typeof row.message === 'object') {
          messagesBySession.get(row.session_id).push({
            type: (row.message as any).type,
            content: (row.message as any).content,
            additional_kwargs: (row.message as any).additional_kwargs || {},
            response_metadata: (row.message as any).response_metadata || {},
            timestamp: row.created_at,
            session_id: row.session_id
          });
        }
      });

      // Calcular métricas
      const totalMessages = Array.from(messagesBySession.values()).reduce((sum, messages) => sum + messages.length, 0);
      const averageMessages = uniqueSessions.size > 0 ? Math.round(totalMessages / uniqueSessions.size) : 0;

      // Sessões ativas (últimas 24 horas)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      const activeSessions = conversations.filter(c => 
        c.created_at && new Date(c.created_at) > oneDayAgo
      ).length;

      return {
        conversations: Array.from(messagesBySession.entries()).map(([sessionId, messages]) => ({
          session_id: sessionId,
          messages: messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          message_count: messages.length
        })),
        activeSessions,
        averageMessages,
        totalTokens: 0, // Não temos mais tokens_used na nova estrutura
        averageTokensPerSession: 0,
        messagesBySession
      };
    },
    enabled: !!empresaId,
  });
};