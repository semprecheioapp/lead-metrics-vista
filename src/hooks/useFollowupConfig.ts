import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type FollowupConfig = {
  tempo_abandono_dias: number;
  template_followup: string;
  auto_followup_enabled: boolean;
};

export const useFollowupConfig = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["followup_config", empresaId],
    queryFn: async () => {
      if (!empresaId) return null;

      const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      if (error) throw error;

      // Valores padrão se não existir configuração
      const defaultConfig: FollowupConfig = {
        tempo_abandono_dias: 3,
        template_followup: "Olá {nome}, notamos que você demonstrou interesse em nossos produtos. Podemos ajudá-lo a dar continuidade?",
        auto_followup_enabled: false
      };

      if (!data) return defaultConfig;

      // Extrair configurações de follow-up do campo horario_funcionamento ou criar novo campo
      const followupData = data.horario_funcionamento as any;
      
      return {
        tempo_abandono_dias: followupData?.tempo_abandono_dias ?? defaultConfig.tempo_abandono_dias,
        template_followup: followupData?.template_followup ?? defaultConfig.template_followup,
        auto_followup_enabled: followupData?.auto_followup_enabled ?? defaultConfig.auto_followup_enabled
      };
    },
    enabled: !!empresaId,
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<FollowupConfig>) => {
      if (!empresaId) throw new Error("Empresa ID não encontrado");

      // Primeiro, buscar configuração atual
      const { data: currentConfig } = await supabase
        .from("configuracoes_empresa")
        .select("*")
        .eq("empresa_id", empresaId)
        .maybeSingle();

      const currentFollowupConfig = currentConfig?.horario_funcionamento as any || {};
      
      const updatedFollowupConfig = {
        ...currentFollowupConfig,
        ...newConfig
      };

      if (currentConfig) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from("configuracoes_empresa")
          .update({
            horario_funcionamento: updatedFollowupConfig,
            updated_at: new Date().toISOString()
          })
          .eq("empresa_id", empresaId);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from("configuracoes_empresa")
          .insert({
            empresa_id: empresaId,
            horario_funcionamento: updatedFollowupConfig
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followup_config", empresaId] });
    },
  });

  return {
    config,
    isLoading,
    error,
    updateConfig: updateConfig.mutate,
    isUpdating: updateConfig.isPending,
  };
};