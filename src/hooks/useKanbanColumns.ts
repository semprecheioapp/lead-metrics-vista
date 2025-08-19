import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface KanbanColumn {
  id: number;
  pipeline_id: number;
  nome: string;
  ordem: number;
  cor?: string;
  webhook_ativo: boolean;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export function useKanbanColumns(pipelineId: number) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["kanban-columns", pipelineId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kanban_colunas')
        .select('*')
        .eq('pipeline_id', pipelineId)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data as KanbanColumn[];
    },
    enabled: !!pipelineId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!pipelineId) return;

    const channel = supabase
      .channel('kanban-columns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kanban_colunas',
          filter: `pipeline_id=eq.${pipelineId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["kanban-columns", pipelineId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pipelineId, queryClient]);

  return query;
}