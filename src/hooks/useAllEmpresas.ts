import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useAllEmpresas = () => {
  return useQuery({
    queryKey: ["all_empresas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, name_empresa, whitelabel_enabled")
        .eq("ativo", true)
        .order("name_empresa");

      if (error) throw error;
      return data;
    },
  });
};