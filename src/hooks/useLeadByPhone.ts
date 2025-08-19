import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useLeadByPhone = (phoneNumber: string) => {
  const { empresaData } = useAuth();

  return useQuery({
    queryKey: ["lead_by_phone", phoneNumber, empresaData?.id],
    queryFn: async () => {
      if (!empresaData?.id || !phoneNumber) return null;

      const { data, error } = await supabase
        .from('novos_leads')
        .select('id, name, number, empresa_id, etapa, qualificacao, tags, created_at, updated_at')
        .eq('number', phoneNumber)
        .eq('empresa_id', empresaData.id)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    },
    enabled: !!empresaData?.id && !!phoneNumber,
  });
};