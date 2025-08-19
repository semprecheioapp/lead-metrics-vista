import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useSecureAuth = () => {
  const { user, userProfile, loading } = useAuth();

  // Check if user is super admin using secure function
  const { data: isSuperAdmin, isLoading: isCheckingSuperAdmin } = useQuery({
    queryKey: ['is-super-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_super_admin');
        if (error) {
          console.error('Error checking super admin status:', error);
          return false;
        }
        return data || false;
      } catch (error) {
        console.error('Unexpected error checking super admin status:', error);
        return false;
      }
    },
    enabled: !!user?.id,
    retry: 1,
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Check if user is super admin by email (fallback)
  const { data: isSuperAdminByEmail, isLoading: isCheckingByEmail } = useQuery({
    queryKey: ['is-super-admin-email', user?.email],
    queryFn: async () => {
      if (!user?.email) return false;
      
      try {
        const { data, error } = await supabase.rpc('is_super_admin_by_email');
        if (error) {
          console.error('Error checking super admin by email:', error);
          return false;
        }
        return data || false;
      } catch (error) {
        console.error('Unexpected error checking super admin by email:', error);
        return false;
      }
    },
    enabled: !!user?.email,
    retry: 1,
    staleTime: 5 * 60 * 1000
  });

  // Determine final super admin status (role-based OR email-based)
  const finalSuperAdminStatus = isSuperAdmin || isSuperAdminByEmail;

  return {
    user,
    userProfile,
    loading: loading || isCheckingSuperAdmin || isCheckingByEmail,
    isSuperAdmin: finalSuperAdminStatus,
    isAdmin: userProfile?.role === 'admin' || finalSuperAdminStatus,
    hasEmpresaAccess: !!userProfile?.empresa_id || finalSuperAdminStatus,
    empresaId: userProfile?.empresa_id
  };
};

// Clean up auth state utility
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

// Rate limiting for authentication operations
export const createAuthRateLimiter = () => {
  const attempts = new Map<string, number[]>();
  
  return (operation: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
    const now = Date.now();
    const operationAttempts = attempts.get(operation) || [];
    
    // Remove old attempts outside the window
    const validAttempts = operationAttempts.filter(time => now - time < windowMs);
    
    if (validAttempts.length >= maxAttempts) {
      return false; // Rate limit exceeded
    }
    
    validAttempts.push(now);
    attempts.set(operation, validAttempts);
    return true;
  };
};