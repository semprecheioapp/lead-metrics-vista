import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  email: string | null;
  nome: string | null;
  empresa_id: number | null;
  role: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmpresaData {
  id: number;
  name_empresa: string;
  email: string | null;
  telefone: string | null;
  plano: string | null;
  ativo: boolean | null;
  limite_leads: number | null;
  limite_mensagens: number | null;
  created_at: string | null;
  updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  empresaData: EmpresaData | null;
  empresaId: number | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log("AuthProvider rendering...");
  
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [empresaData, setEmpresaData] = React.useState<EmpresaData | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadUserProfile = React.useCallback(async (userId: string) => {
    try {
      console.log("Loading user profile for:", userId);
      
      // Carregar profile do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      setUserProfile(profileData);

      // Se o usuário tem empresa_id, carregar dados da empresa
      if (profileData?.empresa_id) {
        const { data: empresaData, error: empresaError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', profileData.empresa_id)
          .single();

        if (empresaError) {
          console.error('Error loading empresa:', empresaError);
          return;
        }

        setEmpresaData(empresaData);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user?.id, loadUserProfile]);

  React.useEffect(() => {
    console.log("AuthProvider useEffect running...");
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile loading to prevent deadlocks
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          // Clear profile data when user logs out
          setUserProfile(null);
          setEmpresaData(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Existing session:", session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signOut = React.useCallback(async () => {
    try {
      console.log("Signing out...");
      
      // Clear local state first
      setUserProfile(null);
      setEmpresaData(null);
      setUser(null);
      setSession(null);
      
      // Enhanced cleanup of auth state
      const cleanupAuthState = () => {
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
      
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (signOutError) {
        console.warn('Error during sign out, continuing with redirect:', signOutError);
      }
      
      // Force page reload to ensure clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if signOut fails, redirect to auth page
      window.location.href = '/auth';
    }
  }, []);

  const value = React.useMemo(() => ({
    user,
    session,
    userProfile,
    empresaData,
    empresaId: userProfile?.empresa_id || null,
    loading,
    signOut,
    refreshProfile,
  }), [user, session, userProfile, empresaData, loading, signOut, refreshProfile]);

  console.log("AuthProvider providing value:", { user: !!user, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};