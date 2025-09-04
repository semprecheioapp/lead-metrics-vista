import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface WhiteLabelConfig {
  empresa_id: bigint;
  logo_url?: string;
  nome_empresa?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
  favicon_url?: string;
  titulo_sistema?: string;
  cor_accent?: string;
  cor_background?: string;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_CONFIG: Partial<WhiteLabelConfig> = {
  nome_empresa: "Dashboard MBK",
  titulo_sistema: "Dashboard MBK - CRM & IA",
  cor_primaria: "#1e40af",
  cor_secundaria: "#3b82f6", 
  cor_accent: "#60a5fa",
  cor_background: "#0a0f1c"
};

export const useWhiteLabel = () => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  const { data: config, isLoading, error } = useQuery({
    queryKey: ["whitelabel_config", empresaId],
    queryFn: async () => {
      if (!empresaId) return DEFAULT_CONFIG;

      const { data, error } = await supabase
        .from("configuracoes_empresa")
        .select("empresa_id, logo_url, nome_empresa, cor_primaria, cor_secundaria, favicon_url, titulo_sistema, cor_accent, cor_background")
        .eq("empresa_id", empresaId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data ? {
        ...(DEFAULT_CONFIG as WhiteLabelConfig),
        ...data
      } : (DEFAULT_CONFIG as WhiteLabelConfig);
    },
    enabled: !!empresaId,
  });

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: Partial<WhiteLabelConfig>) => {
      if (!empresaId) throw new Error("No empresa ID");

      const { data: existing } = await supabase
        .from("configuracoes_empresa")
        .select("empresa_id")
        .eq("empresa_id", empresaId)
        .single();

      const updateData = {
        empresa_id: empresaId,
        logo_url: newConfig.logo_url,
        nome_empresa: newConfig.nome_empresa,
        cor_primaria: newConfig.cor_primaria,
        cor_secundaria: newConfig.cor_secundaria,
        favicon_url: newConfig.favicon_url,
        titulo_sistema: newConfig.titulo_sistema,
        cor_accent: newConfig.cor_accent,
        cor_background: newConfig.cor_background,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { data, error } = await supabase
          .from("configuracoes_empresa")
          .update(updateData)
          .eq("empresa_id", empresaId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("configuracoes_empresa")
          .insert({
            ...updateData,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whitelabel_config", empresaId] });
    },
  });

  // Apply dynamic theming
  useEffect(() => {
    if (config && typeof document !== 'undefined') {
      const root = document.documentElement;
      
      if (config.cor_primaria) {
        // Convert hex to HSL
        const hsl = hexToHsl(config.cor_primaria);
        root.style.setProperty('--primary', hsl);
      }
      
      if (config.cor_secundaria) {
        const hsl = hexToHsl(config.cor_secundaria);
        root.style.setProperty('--secondary', hsl);
      }
      
      if (config.cor_accent) {
        const hsl = hexToHsl(config.cor_accent);
        root.style.setProperty('--accent', hsl);
      }
      
      if (config.cor_background) {
        const hsl = hexToHsl(config.cor_background);
        root.style.setProperty('--background-base', hsl);
      }

      // Update document title
      if (config.titulo_sistema) {
        document.title = config.titulo_sistema;
      }

      // Update favicon
      if (config.favicon_url) {
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
        if (link) {
          link.href = config.favicon_url;
        }
      }
    }
  }, [config]);

  return {
    config: config || DEFAULT_CONFIG,
    isLoading,
    error,
    updateConfig: updateConfigMutation.mutate,
    isUpdating: updateConfigMutation.isPending,
  };
};

// Helper function to convert hex to HSL
function hexToHsl(hex: string): string {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}