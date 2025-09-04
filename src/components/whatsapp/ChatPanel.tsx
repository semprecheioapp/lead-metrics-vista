import { useWhatsAppLeads } from "@/hooks/useWhatsAppLeads";
import { useLeadConversations } from "@/hooks/useLeadConversations";
import { useSendWhatsAppMessage } from "@/hooks/useSendWhatsAppMessage";
import { useConfiguracoesEmpresa } from "@/hooks/useConfiguracoesEmpresa";
import { useResolveConversation } from "@/hooks/useResolveConversation";
import { useAuth } from "@/contexts/AuthContext";
import { ChatHeader } from "./chat/ChatHeader";
import { MessageList } from "./chat/MessageList";
import { MessageComposer } from "./chat/MessageComposer";
import { EmptyState } from "./chat/EmptyState";

interface ChatPanelProps {
  chatId: string | null;
  onToggleInfoPanel: () => void;
  infoPanelCollapsed: boolean;
  onBackToConversations?: () => void;
  isMobile?: boolean;
}

export function ChatPanel({ 
  chatId, 
  onToggleInfoPanel, 
  infoPanelCollapsed, 
  onBackToConversations, 
  isMobile 
}: ChatPanelProps) {
  const { data: leads } = useWhatsAppLeads();
  const { data: conversations, isLoading: conversationsLoading } = useLeadConversations(chatId || "");
  const { mutate: sendMessage, isPending: isSending } = useSendWhatsAppMessage();
  const { data: config } = useConfiguracoesEmpresa();
  const { mutate: resolveConversation, isPending: isResolving } = useResolveConversation();
  const { empresaData } = useAuth();

  const currentLead = leads?.find(lead => lead.session_id === chatId);

  const handleSendMessage = (message: string, senderName: string) => {
    if (!currentLead || isSending) return;

    sendMessage({
      nome: currentLead.name,
      telefone: currentLead.telefone,
      mensagem: message,
      remetente: senderName
    });
  };

  const handleResolveConversation = async () => {
    if (currentLead && empresaData) {
      await resolveConversation({
        chatId,
        empresa_id: empresaData.id,
        nome: currentLead.name,
        numero: currentLead.telefone,
      });
    }
  };

  // Estado vazio - sem chat selecionado
  if (!chatId) {
    return <EmptyState />;
  }

  // Lead não encontrado
  if (!currentLead) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Lead não encontrado</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 max-w-full">
      <ChatHeader
        currentLead={{
          name: currentLead.name,
          telefone: currentLead.telefone,
          isOnline: currentLead.isOnline
        }}
        onBackToConversations={onBackToConversations}
        onToggleInfoPanel={onToggleInfoPanel}
        infoPanelCollapsed={infoPanelCollapsed}
        isMobile={isMobile}
        onResolveConversation={handleResolveConversation}
        isResolving={isResolving}
      />

      <MessageList
        conversations={conversations}
        isLoading={conversationsLoading}
        isSending={isSending}
      />

      <MessageComposer
        onSendMessage={handleSendMessage}
        isSending={isSending}
        isMobile={isMobile}
        defaultSenderName={config?.nome_remetente_padrao}
      />
    </div>
  );
}