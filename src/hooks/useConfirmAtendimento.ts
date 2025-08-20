import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { sendNPSWebhook } from '@/utils/webhooks';

interface ConfirmAtendimentoData {
  id: number;
  empresa_id: number;
  name: string;
  number: string;
  email?: string;
  data: string;
  hora: string;
  serviço?: string;
}

export function useConfirmAtendimento() {
  return useMutation({
    mutationFn: async (agendamento: ConfirmAtendimentoData) => {
      // Atualizar status no banco
      const { error: updateError } = await supabase
        .from('agendamentos')
        .update({ 
          compareceu: true,
          status: true 
        })
        .eq('id', agendamento.id);

      if (updateError) throw updateError;

      // Enviar webhook para NPS
      const webhookData = {
        empresa_id: agendamento.empresa_id,
        numero: agendamento.number,
        nome: agendamento.name,
        data_agendamento: agendamento.data,
        hora_agendamento: agendamento.hora,
        servico: agendamento.serviço || 'Serviço',
        email: agendamento.email
      };

      const response = await sendNPSWebhook(webhookData);
      
      if (response.success !== 'nps_pos_agenda_enviado') {
        throw new Error('Webhook não retornou sucesso esperado');
      }

      return response;
    },
    onSuccess: () => {
      toast({
        title: "Atendimento confirmado!",
        description: "Pesquisa NPS enviada para o cliente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao confirmar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    },
  });
}