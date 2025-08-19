import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./useCompany";

export interface Pipeline {
  id: number;
  nome: string;
  moeda: string;
  empresa_id: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export function usePipelines() {
  const { data: empresa } = useCompany();

  return useQuery({
    queryKey: ["pipelines", empresa?.id],
    queryFn: async () => {
      if (!empresa?.id) return [];

      const { data, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('empresa_id', empresa.id)
        .eq('ativo', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Pipeline[];
    },
    enabled: !!empresa?.id,
  });
}