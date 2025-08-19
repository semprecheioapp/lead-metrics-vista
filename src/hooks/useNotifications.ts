import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";

export interface Notification {
  id: number;
  empresa_id: number;
  tipo: 'lead_urgente' | 'followup_atrasado' | 'oportunidade' | 'meta_performance' | 'problema_critico';
  titulo: string;
  mensagem: string;
  lida: boolean;
  urgencia: 'baixa' | 'media' | 'alta' | 'critica';
  dados_contexto?: any;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationConfig {
  id?: number;
  empresa_id: number;
  tipos_ativos: {
    lead_urgente: boolean;
    followup_atrasado: boolean;
    oportunidade: boolean;
    meta_performance: boolean;
    problema_critico: boolean;
  };
  canais_preferidos: {
    dashboard: boolean;
    email: boolean;
    whatsapp: boolean;
    push: boolean;
  };
  horarios_permitidos: {
    inicio: string;
    fim: string;
    dias_semana: number[];
  };
  limites_por_tipo: {
    lead_urgente: number;
    followup_atrasado: number;
    oportunidade: number;
    meta_performance: number;
    problema_critico: number;
  };
  configuracoes_personalizadas?: any;
}

export const useNotifications = () => {
  const { data: empresa } = useCompany();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['notifications', empresa?.id],
    queryFn: async () => {
      if (!empresa?.id) return [];
      
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('empresa_id', empresa.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!empresa?.id,
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', empresa?.id] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!empresa?.id) return;
      
      const { error } = await supabase
        .from('notificacoes')
        .update({ 
          lida: true, 
          read_at: new Date().toISOString() 
        })
        .eq('empresa_id', empresa.id)
        .eq('lida', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', empresa?.id] });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notificacoes')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', empresa?.id] });
    },
  });

  const unreadCount = notifications.filter(n => !n.lida).length;
  const urgentCount = notifications.filter(n => !n.lida && (n.urgencia === 'alta' || n.urgencia === 'critica')).length;

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    urgentCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export const useNotificationConfig = () => {
  const { data: empresa } = useCompany();
  const queryClient = useQueryClient();

  const {
    data: config,
    isLoading,
    error
  } = useQuery({
    queryKey: ['notification-config', empresa?.id],
    queryFn: async () => {
      if (!empresa?.id) return null;
      
      const { data, error } = await supabase
        .from('configuracoes_notificacoes')
        .select('*')
        .eq('empresa_id', empresa.id)
        .maybeSingle();

      if (error) throw error;
      return data ? {
        ...data,
        tipos_ativos: data.tipos_ativos as NotificationConfig['tipos_ativos'],
        canais_preferidos: data.canais_preferidos as NotificationConfig['canais_preferidos'],
        horarios_permitidos: data.horarios_permitidos as NotificationConfig['horarios_permitidos'],
        limites_por_tipo: data.limites_por_tipo as NotificationConfig['limites_por_tipo'],
      } as NotificationConfig : null;
    },
    enabled: !!empresa?.id,
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: Partial<NotificationConfig>) => {
      if (!empresa?.id) throw new Error('Empresa não encontrada');

      const updateData = {
        tipos_ativos: newConfig.tipos_ativos,
        canais_preferidos: newConfig.canais_preferidos,
        horarios_permitidos: newConfig.horarios_permitidos,
        limites_por_tipo: newConfig.limites_por_tipo,
        configuracoes_personalizadas: newConfig.configuracoes_personalizadas,
      };

      if (config?.id) {
        const { error } = await supabase
          .from('configuracoes_notificacoes')
          .update(updateData)
          .eq('id', config.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('configuracoes_notificacoes')
          .insert({
            empresa_id: empresa.id,
            ...updateData
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-config', empresa?.id] });
    },
  });

  return {
    config,
    isLoading,
    error,
    updateConfig,
    isUpdating: updateConfig.isPending,
  };
};