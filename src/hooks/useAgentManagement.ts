import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AgentUsage {
  used: number;
  limit: number | null;
  can_invite: boolean;
}

export interface ActiveMember {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  profiles: {
    nome: string;
    email: string;
  };
}

export interface PendingInvite {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  expires_at: string;
}

export interface CreateInviteData {
  email: string;
  name?: string;
  role_id?: string;
  scopes: string[];
}

export const useAgentManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get company agent usage and details
  const agentUsageQuery = useQuery({
    queryKey: ["agent-usage", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('company-agents-usage');
      
      if (error) throw error;
      return data as {
        usage: AgentUsage;
        active_members: ActiveMember[];
        pending_invites: PendingInvite[];
      };
    },
    enabled: !!user,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (inviteData: CreateInviteData) => {
      const { data, error } = await supabase.functions.invoke('agent-invite-create', {
        body: inviteData
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Convite enviado",
        description: "O convite foi enviado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["agent-usage"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  });

  // Revoke invite mutation
  const revokeInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase.functions.invoke('agent-invite-revoke', {
        body: { invite_id: inviteId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Convite revogado",
        description: "O convite foi revogado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["agent-usage"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao revogar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  });

  // Resend invite mutation
  const resendInviteMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      const { data, error } = await supabase.functions.invoke('agent-invite-resend', {
        body: { invite_id: inviteId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Convite reenviado",
        description: "O convite foi reenviado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["agent-usage"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar convite",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  });

  return {
    agentUsage: agentUsageQuery.data?.usage,
    activeMembers: agentUsageQuery.data?.active_members || [],
    pendingInvites: agentUsageQuery.data?.pending_invites || [],
    isLoading: agentUsageQuery.isLoading,
    error: agentUsageQuery.error,
    createInvite: createInviteMutation.mutate,
    revokeInvite: revokeInviteMutation.mutate,
    resendInvite: resendInviteMutation.mutate,
    isCreatingInvite: createInviteMutation.isPending,
    isRevokingInvite: revokeInviteMutation.isPending,
    isResendingInvite: resendInviteMutation.isPending,
  };
};