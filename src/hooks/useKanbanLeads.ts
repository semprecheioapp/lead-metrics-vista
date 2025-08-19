
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface KanbanLead {
  id: number;
  name: string;
  number: string;
  qualificacao?: string;
  created_at: string;
  pipeline_id?: number;
  kanban_coluna_id: number;
  posicao_kanban: number;
  etapa: number;
}

export function useKanbanLeads(pipelineId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kanban-leads", pipelineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('novos_leads')
        .select('id, name, number, qualificacao, created_at, pipeline_id, kanban_coluna_id, posicao_kanban, etapa')
        .eq('pipeline_id', pipelineId)
        // Mostrar todos os leads que têm pipeline_id (incluindo etapa 1)
        .order('posicao_kanban', { ascending: true });

      if (error) throw error;
      return data as KanbanLead[];
    },
    enabled: !!pipelineId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!pipelineId) return;

    const channel = supabase
      .channel('kanban-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'novos_leads',
          filter: `pipeline_id=eq.${pipelineId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["kanban-leads", pipelineId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipelineId, queryClient]);

  return query;
}
