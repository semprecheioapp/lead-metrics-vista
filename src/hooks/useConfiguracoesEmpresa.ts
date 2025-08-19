import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useConfiguracoesEmpresa = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["configuracoes_empresa", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;

      const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (error) throw error;

      // Se não existir configuração, retornar valores padrão
      if (!data) {
        return {
          auto_resposta: true,
          mensagem_fora_horario: "Estamos fora do horário de atendimento. Em breve retornaremos seu contato.",
          prompt_sistema: "Você é um assistente virtual especializado em atendimento ao cliente.",
          api_whatsapp: "",
          webhook_url: "",
          horario_funcionamento: {
            inicio: "09:00",
            fim: "18:00",
            dias: ["segunda", "terca", "quarta", "quinta", "sexta"]
          },
          llm_provider: "openai",
          llm_enabled: false,
          reports_enabled: false,
          reports_frequency: "weekly",
          nome_remetente_padrao: "Atendente"
        };
      }

      return data;
    },
    enabled: !!empresaId,
  });

  const updateMutation = useMutation({
    mutationFn: async (configData: any) => {
      if (!empresaId) throw new Error("Empresa não identificada");

      // Verificar se já existe configuração
      const { data: existing } = await supabase
        .from("configuracoes_empresa")
        .select("id")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      const configToSave = {
        empresa_id: empresaId,
        auto_resposta: configData.autoResposta,
        mensagem_fora_horario: configData.mensagemForaHorario,
        prompt_sistema: configData.promptSistema,
        api_whatsapp: configData.apiWhatsapp,
        webhook_url: configData.webhookUrl,
        horario_funcionamento: {
          inicio: configData.horarioInicio,
          fim: configData.horarioFim,
          dias: configData.diasFuncionamento
        },
        llm_provider: configData.llmProvider || "openai",
        llm_enabled: configData.llmEnabled || false,
        reports_enabled: configData.reportsEnabled || false,
        reports_frequency: configData.reportsFrequency || "weekly",
        nome_remetente_padrao: configData.nomeRemetentePadrao || "Atendente"
      };

      if (existing) {
        // Atualizar configuração existente
        const { data, error } = await supabase
          .from("configuracoes_empresa")
          .update(configToSave)
          .eq("empresa_id", empresaId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Criar nova configuração
        const { data, error } = await supabase
          .from("configuracoes_empresa")
          .insert(configToSave)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["configuracoes_empresa", empresaId] });
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateConfig: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};