import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CompanyRole {
  id: string;
  name: string;
  description: string;
  is_preset: boolean;
  permissions: string[];
}

export const AVAILABLE_PERMISSIONS = [
  { key: 'whatsapp:read', label: 'Ver WhatsApp', module: 'WhatsApp' },
  { key: 'whatsapp:send', label: 'Enviar WhatsApp', module: 'WhatsApp' },
  { key: 'followups:read', label: 'Ver Follow-ups', module: 'Follow-ups' },
  { key: 'followups:manage', label: 'Gerenciar Follow-ups', module: 'Follow-ups' },
  { key: 'agendamentos:read', label: 'Ver Agendamentos', module: 'Agendamentos' },
  { key: 'agendamentos:manage', label: 'Gerenciar Agendamentos', module: 'Agendamentos' },
  { key: 'oportunidades:read', label: 'Ver Oportunidades', module: 'Oportunidades' },
  { key: 'oportunidades:manage', label: 'Gerenciar Oportunidades', module: 'Oportunidades' },
  { key: 'settings:read', label: 'Ver Configurações', module: 'Configurações' },
  { key: 'settings:manage', label: 'Gerenciar Configurações', module: 'Configurações' },
];

export const useCompanyRoles = () => {
  const { user, empresaData } = useAuth();

  return useQuery({
    queryKey: ["company-roles", empresaData?.id],
    queryFn: async (): Promise<CompanyRole[]> => {
      if (!empresaData?.id) return [];

      const { data: roles, error } = await supabase
        .from('papeis_empresa')
        .select(`
          id,
          name,
          description,
          is_preset,
          papeis_permissoes(permission)
        `)
        .eq('company_id', empresaData.id)
        .order('is_preset', { ascending: false })
        .order('name');

      if (error) throw error;

      return roles.map(role => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        is_preset: role.is_preset || false,
        permissions: role.papeis_permissoes?.map(p => p.permission) || []
      }));
    },
    enabled: !!empresaData?.id && !!user,
  });
};