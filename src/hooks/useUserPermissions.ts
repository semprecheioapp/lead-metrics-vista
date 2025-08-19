import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface UserPermissions {
  scopes: string[];
  role_name?: string;
  is_admin: boolean;
  is_super_admin: boolean;
}

export const useUserPermissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-permissions", user?.id],
    queryFn: async (): Promise<UserPermissions> => {
      if (!user) {
        return {
          scopes: [],
          is_admin: false,
          is_super_admin: false
        };
      }

      // Check if super admin
      const isSuperAdmin = user.email === 'agenciambkautomacoes@gmail.com';
      
      if (isSuperAdmin) {
        return {
          scopes: ['*'], // Super admin has all permissions
          is_admin: true,
          is_super_admin: true
        };
      }

      // Get user profile to check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, empresa_id')
        .eq('id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      // If admin, they have all company permissions
      if (isAdmin) {
        return {
          scopes: [
            'whatsapp:read', 'whatsapp:send',
            'followups:read', 'followups:manage',
            'agendamentos:read', 'agendamentos:manage',
            'oportunidades:read', 'oportunidades:manage',
            'settings:read', 'settings:manage'
          ],
          is_admin: true,
          is_super_admin: false
        };
      }

      // Get user's membership and scopes
      const { data: membership } = await supabase
        .from('membros_empresa')
        .select(`
          scopes,
          role_id,
          papeis_empresa(name)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        return {
          scopes: [],
          is_admin: false,
          is_super_admin: false
        };
      }

      return {
        scopes: Array.isArray(membership.scopes) ? membership.scopes.map(scope => String(scope)) : [],
        role_name: membership.papeis_empresa?.name,
        is_admin: false,
        is_super_admin: false
      };
    },
    enabled: !!user,
  });
};

export const useHasPermission = (requiredScopes: string[]) => {
  const { data: permissions } = useUserPermissions();

  const hasPermission = (scopes: string[]) => {
    if (!permissions) return false;
    if (permissions.is_super_admin) return true;
    if (permissions.scopes.includes('*')) return true;
    
    return scopes.some(scope => permissions.scopes.includes(scope));
  };

  return hasPermission(requiredScopes);
};