import { useState } from "react";
import { ConversationSidebar } from "./ConversationSidebar";
import { ChatPanel } from "./ChatPanel";
import { LeadInfoPanel } from "./LeadInfoPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ConversationFilter {
  type: 'all' | 'unread' | 'contacts' | 'favorites' | string; // Permitir filtros por tags
  search: string;
  selectedTags?: string[]; // Adicionar filtro por tags selecionadas
}

export interface ConversationStatus {
  status: 'new' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high';
  isFavorite: boolean;
  unreadCount: number;
}

export function WhatsAppCRM() {
  console.log('WhatsAppCRM renderizando...');
  const isMobile = useIsMobile();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [filters, setFilters] = useState<ConversationFilter>({
    type: 'all',
    search: '',
    selectedTags: []
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [infoPanelCollapsed, setInfoPanelCollapsed] = useState(isMobile);
  const [showConversations, setShowConversations] = useState(true);

  const handleSelectChat = (chatId: string) => {
    setSelectedChat(chatId);
    if (isMobile) {
      setShowConversations(false);
    }
  };

  const handleBackToConversations = () => {
    if (isMobile) {
      setSelectedChat(null);
      setShowConversations(true);
      setInfoPanelCollapsed(true);
    }
  };

  return (
    <div className="h-full bg-background flex min-h-0 rounded-lg border w-full max-w-full">
      {/* Layout Mobile/Tablet */}
      {isMobile ? (
        <>
          {/* Lista de Conversas - Mobile */}
          {showConversations && (
            <div className="w-full bg-card min-h-0 flex flex-col">
              <ConversationSidebar
                selectedChat={selectedChat}
                onSelectChat={handleSelectChat}
                filters={filters}
                onFiltersChange={setFilters}
                collapsed={false}
                onToggleCollapse={() => {}}
              />
            </div>
          )}

          {/* Chat Ativo - Mobile */}
          {!showConversations && selectedChat && (
            <div className="w-full flex flex-col min-h-0 max-w-full">
              <ChatPanel 
                chatId={selectedChat}
                onToggleInfoPanel={() => setInfoPanelCollapsed(!infoPanelCollapsed)}
                infoPanelCollapsed={infoPanelCollapsed}
                onBackToConversations={handleBackToConversations}
                isMobile={true}
              />
            </div>
          )}

          {/* Painel de Info - Mobile (Modal) */}
          {selectedChat && !infoPanelCollapsed && (
            <div className="fixed inset-0 z-50 bg-black/50 flex p-4">
              <div className="w-full max-w-sm bg-card ml-auto animate-slide-in-right rounded-lg min-h-0 flex flex-col">
                <LeadInfoPanel 
                  chatId={selectedChat}
                  onClose={() => setInfoPanelCollapsed(true)}
                />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Layout Desktop */
        <>
          {/* Coluna Esquerda - Lista de Conversas */}
          <div className={cn(
            "bg-card border-r border-border flex-shrink-0 transition-all duration-300",
            sidebarCollapsed ? "w-16 xl:w-20" : "w-72 md:w-80 xl:w-96"
          )}>
            <ConversationSidebar
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              filters={filters}
              onFiltersChange={setFilters}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Coluna Central - Chat Ativo */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 max-w-full">
            <ChatPanel 
              chatId={selectedChat}
              onToggleInfoPanel={() => setInfoPanelCollapsed(!infoPanelCollapsed)}
              infoPanelCollapsed={infoPanelCollapsed}
            />
          </div>

          {/* Coluna Direita - Informações do Lead */}
          {selectedChat && !infoPanelCollapsed && (
            <div className="w-72 md:w-80 xl:w-96 bg-card border-l border-border flex-shrink-0 animate-slide-in-right min-h-0 min-w-0 max-w-full">
              <LeadInfoPanel 
                chatId={selectedChat}
                onClose={() => setInfoPanelCollapsed(true)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}