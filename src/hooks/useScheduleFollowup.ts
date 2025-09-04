import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ScheduleFollowupData {
  leadId: string; // session_id (telefone)
  date: Date;
  message: string;
  leadName?: string;
}

export const useScheduleFollowup = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const scheduleFollowup = useMutation({
    mutationFn: async ({ leadId, date, message, leadName }: ScheduleFollowupData) => {
      if (!empresaId) throw new Error("Empresa ID não encontrado");

      // Buscar dados do lead pelo telefone se não foi fornecido nome
      let finalLeadName = leadName;
      if (!finalLeadName) {
        const { data: lead } = await supabase
          .from("novos_leads")
          .select("name")
          .eq("number", leadId)
          .eq("empresa_id", empresaId)
          .maybeSingle();
        
        finalLeadName = lead?.name || `Lead ${leadId.slice(-4)}`;
      }

      // Inserir diretamente na tabela de followups
      const { data, error } = await supabase
        .from("followups")
        .insert({
          empresa_id: empresaId,
          lead_nome: finalLeadName,
          lead_telefone: leadId,
          mensagem: message,
          data_envio: date.toISOString(),
          status: 'agendado'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-chats"] });
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      toast.success("Follow-up agendado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao agendar follow-up:", error);
      toast.error("Erro ao agendar follow-up. Tente novamente.");
    },
  });

  return {
    scheduleFollowup: scheduleFollowup.mutate,
    isScheduling: scheduleFollowup.isPending,
  };
};