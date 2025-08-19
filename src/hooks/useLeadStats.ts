import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LeadStats {
  totalMessages: number;
  daysSinceLastContact: number;
  status: string;
  stage: number;
  isFavorite: boolean;
  unreadCount: number;
}

export const useLeadStats = (phoneNumber: string) => {
  const { empresaData } = useAuth();

  return useQuery({
    queryKey: ["lead_stats", phoneNumber, empresaData?.id],
    queryFn: async (): Promise<LeadStats> => {
      if (!empresaData?.id || !phoneNumber) {
        throw new Error("Dados necessários não encontrados");
      }

      // Buscar total de mensagens
      const { data: messageCount } = await supabase
        .from('memoria_ai')
        .select('id', { count: 'exact' })
        .eq('empresa_id', empresaData.id)
        .eq('session_id', phoneNumber);

      // Buscar última mensagem para calcular dias
      const { data: lastMessage } = await supabase
        .from('memoria_ai')
        .select('created_at')
        .eq('empresa_id', empresaData.id)
        .eq('session_id', phoneNumber)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Buscar dados do lead
      const { data: leadData } = await supabase
        .from('novos_leads')
        .select('etapa, qualificacao')
        .eq('empresa_id', empresaData.id)
        .eq('number', phoneNumber)
        .single();

      // Calcular dias desde último contato
      const daysSince = lastMessage 
        ? Math.floor((new Date().getTime() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        totalMessages: messageCount?.length || 0,
        daysSinceLastContact: daysSince,
        status: leadData?.qualificacao || 'new',
        stage: leadData?.etapa || 1,
        isFavorite: false, // Por enquanto fixo
        unreadCount: 0 // Será calculado depois
      };
    },
    enabled: !!empresaData?.id && !!phoneNumber,
  });
};