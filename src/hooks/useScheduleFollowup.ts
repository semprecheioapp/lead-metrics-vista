import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ScheduleFollowupData {
  leadId: string; // session_id (telefone)
  date: Date;
  message: string;
}

export const useScheduleFollowup = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const scheduleFollowup = useMutation({
    mutationFn: async ({ leadId, date, message }: ScheduleFollowupData) => {
      if (!empresaId) throw new Error("Empresa ID não encontrado");

      // Buscar dados do lead pelo telefone (session_id)
      const { data: lead, error: leadError } = await supabase
        .from("novos_leads")
        .select("*")
        .eq("number", leadId)
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (leadError) throw leadError;
      if (!lead) {
        console.log("Lead não encontrado na tabela novos_leads, usando dados do WhatsApp");
      }

      // Chamar edge function para processar o agendamento
      const { data, error } = await supabase.functions.invoke('schedule-followup', {
        body: {
          leadId,
          empresaId,
          scheduledDate: date.toISOString(),
          message,
          leadData: {
            name: lead?.name || `Lead ${leadId.slice(-4)}`,
            number: leadId
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp-chats"] });
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