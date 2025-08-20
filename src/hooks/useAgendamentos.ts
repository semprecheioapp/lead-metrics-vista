import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Agendamento {
  id: number;
  name: string | null;
  number: string | null;
  email: string | null;
  data: string | null;
  hora: string | null;
  serviço: string | null;
  status: boolean | null;
  compareceu: boolean | null;
  lembrete_enviado: boolean | null;
  lembrete_enviado_2: boolean | null;
  created_at: string | null;
  empresa_id: number | null;
}

// Hook principal agora filtra por empresa e só executa quando a empresa estiver carregada
export const useAgendamentos = (empresaId?: number) => {
  return useQuery({
    queryKey: ["agendamentos", empresaId],
    enabled: !!empresaId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("empresa_id", empresaId as number)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Agendamento[];
    },
  });
};

export const useCreateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: Omit<Agendamento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .insert([agendamento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Agendamento criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar agendamento:", error);
      toast.error("Erro ao criar agendamento");
    },
  });
};

export const useUpdateAgendamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Agendamento> & { id: number }) => {
      const { data, error } = await supabase
        .from("agendamentos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Agendamento atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar agendamento:", error);
      toast.error("Erro ao atualizar agendamento");
    },
  });
};

export const useConfirmarAtendimentoComWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agendamento: Agendamento) => {
      // 1. Atualizar o agendamento como compareceu
      const { data: updatedAgendamento, error: updateError } = await supabase
        .from("agendamentos")
        .update({ 
          compareceu: true,
          status: true 
        })
        .eq("id", agendamento.id)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. Enviar webhook NPS
      const webhookData = {
        empresa_id: agendamento.empresa_id!,
        numero: agendamento.number || '',
        nome: agendamento.name || 'Cliente',
        data_agendamento: agendamento.data || '',
        hora_agendamento: agendamento.hora || '',
        servico: agendamento.serviço || 'Serviço',
        email: agendamento.email
      };

      try {
        const response = await fetch('https://wb.semprecheioapp.com.br/webhook/nps_pos_agendamento', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (!response.ok) {
          console.error('Erro no webhook NPS:', response.status);
        }
      } catch (webhookError) {
        console.error('Erro ao enviar webhook:', webhookError);
        // Não lançar erro para não interromper o fluxo principal
      }

      return updatedAgendamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agendamentos"], exact: false });
      toast.success("Atendimento confirmado! Pesquisa NPS enviada.");
    },
    onError: (error) => {
      console.error("Erro ao confirmar atendimento:", error);
      toast.error("Erro ao confirmar atendimento");
    },
  });
};