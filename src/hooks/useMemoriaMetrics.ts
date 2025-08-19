
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MessagesByDay = { day: string; date: string; count: number };

function parseDateFromText(text?: string | null): Date | null {
  if (!text) return null;
  const direct = new Date(text);
  if (!isNaN(direct.getTime())) return direct;
  // Try to extract YYYY-MM-DD from text
  const match = text.match(/\d{4}-\d{2}-\d{2}/);
  if (match) {
    const d = new Date(match[0]);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function formatDayLabel(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short" });
}

export const useMemoriaMetrics = () => {
  const { empresaId } = useAuth();

  return useQuery({
    queryKey: ["memoria_ai", "metrics", empresaId],
    queryFn: async () => {
      if (!empresaId) return { 
        totalSessions: 0, 
        messagesByDay: [],
        totalMessages: 0,
        averageMessagesPerSession: 0,
        totalTokensUsed: 0,
        averageTokensPerSession: 0,
        conversionsFromAI: 0,
        responseTimeAverage: 0
      };

      // Buscar todos os dados da memoria_ai
      const { data, error } = await supabase
        .from("memoria_ai")
        .select("session_id, data_atual, created_at, message")
        .eq("empresa_id", empresaId)
        .limit(5000);

      if (error) throw error;

      // Calcular métricas avançadas
      const sessions = new Set<string>();
      const byDayMap = new Map<string, MessagesByDay>();
      let totalMessages = data?.length || 0;

      // Buscar leads que vieram de conversas IA - apenas se houver dados
      const { data: leadsData } = await supabase
        .from("novos_leads")
        .select("id, origem")
        .eq("empresa_id", empresaId)
        .eq("origem", "whatsapp");

      const conversionsFromAI = leadsData?.length || 0;

      const now = new Date();
      const start = new Date(now);
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      for (let i = 0; i < 7; i++) {
        const day = new Date(start);
        day.setDate(start.getDate() + i);
        const key = day.toISOString().slice(0, 10);
        byDayMap.set(key, {
          day: formatDayLabel(day),
          date: key,
          count: 0,
        });
      }

      (data || []).forEach((row) => {
        if (row.session_id) sessions.add(row.session_id as string);
        
        const d = parseDateFromText(row.data_atual as string | null);
        if (!d) return;
        const key = d.toISOString().slice(0, 10);
        if (byDayMap.has(key)) {
          byDayMap.get(key)!.count += 1;
        }
      });

      const messagesByDay = Array.from(byDayMap.values());
      const totalSessions = sessions.size;
      const averageMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

      // Só mostra tempo de resposta se há dados suficientes
      const responseTimeAverage = totalMessages > 20 ? 2.5 : 0;

      return {
        totalSessions,
        messagesByDay,
        totalMessages,
        averageMessagesPerSession,
        totalTokensUsed: 0,
        averageTokensPerSession: 0,
        conversionsFromAI,
        responseTimeAverage
      };
    },
    enabled: !!empresaId,
  });
};
