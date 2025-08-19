import { useAgentManagement } from "@/hooks/useAgentManagement";
import { InviteAgentModal } from "./InviteAgentModal";
import { AgentManagementTable } from "./AgentManagementTable";
import { AgentLimitBadge } from "./AgentLimitBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, UserPlus } from "lucide-react";

export const AgentManagementSection = () => {
  const { 
    agentUsage, 
    activeMembers, 
    pendingInvites, 
    isLoading 
  } = useAgentManagement();

  if (isLoading) {
    return <div className="animate-pulse">Carregando...</div>;
  }

  if (!agentUsage) {
    return <div>Erro ao carregar dados dos agentes</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Agentes da Empresa</h3>
          <div className="flex items-center gap-2">
            <AgentLimitBadge 
              used={agentUsage.used} 
              limit={agentUsage.limit}
            />
            {agentUsage.limit && (
              <span className="text-sm text-muted-foreground">
                {agentUsage.limit - agentUsage.used} slots disponíveis
              </span>
            )}
          </div>
        </div>

        <InviteAgentModal 
          canInvite={agentUsage.can_invite}
          usedSlots={agentUsage.used}
          totalSlots={agentUsage.limit}
        >
          <button
            disabled={!agentUsage.can_invite}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            Convidar Agente
          </button>
        </InviteAgentModal>
      </div>

      {!agentUsage.can_invite && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Limite de agentes atingido. Entre em contato com o suporte para aumentar o limite da sua empresa.
          </AlertDescription>
        </Alert>
      )}

      <AgentManagementTable 
        activeMembers={activeMembers}
        pendingInvites={pendingInvites}
      />
    </div>
  );
};