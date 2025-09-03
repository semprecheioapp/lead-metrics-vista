import { useState } from "react";
import { Search, Filter, MessageSquare, Users, Star, Archive, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationList } from "./ConversationList";
import { ConversationFilter } from "./WhatsAppCRM";
import { useWhatsAppLeads } from "@/hooks/useWhatsAppLeads";
import { useFavoritesStore } from "@/hooks/useFavoritesStore";
import { cn } from "@/lib/utils";

interface ConversationSidebarProps {
  selectedChat: string | null;
  onSelectChat: (chatId: string) => void;
  filters: ConversationFilter;
  onFiltersChange: (filters: ConversationFilter) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const filterOptions = [
  { type: 'all' as const, label: 'Todas', icon: MessageSquare },
  { type: 'unread' as const, label: 'Não Atendidas', icon: Filter },
  { type: 'contacts' as const, label: 'Contatos', icon: Users },
  { type: 'favorites' as const, label: 'Favoritos', icon: Star },
  { type: 'attended' as const, label: 'Atendidos', icon: Archive },
];

export function ConversationSidebar({
  selectedChat,
  onSelectChat,
  filters,
  onFiltersChange,
  collapsed,
  onToggleCollapse
}: ConversationSidebarProps) {
  console.log('ConversationSidebar renderizando...');
  const [searchFocused, setSearchFocused] = useState(false);
  const { getFavorites } = useFavoritesStore();
  const { data: leads } = useWhatsAppLeads();

  // Calcular contadores reais
  const unreadCount = leads?.filter(lead => lead.unreadCount > 0).length || 0;

  return (
    <div className="h-full flex flex-col min-h-0 min-w-0 max-w-full">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn(
            "font-semibold text-foreground transition-opacity",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            Conversas
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Busca */}
        {!collapsed && (
          <div className={cn(
            "relative transition-all duration-200",
            searchFocused && "ring-2 ring-primary/20 rounded-md"
          )}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="pl-9 bg-background border-input"
            />
          </div>
        )}
      </div>

        {/* Filtros */}
      {!collapsed && (
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
            {filterOptions.map((option) => {
              const isActive = filters.type === option.type;
              const Icon = option.icon;
              
              return (
                <Button
                  key={option.type}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onFiltersChange({ ...filters, type: option.type })}
                  className={cn(
                    "justify-start gap-2 h-9 text-xs flex-1 min-w-0",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{option.label}</span>
                   {option.type === 'unread' && (
                     <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 flex-shrink-0">
                       {unreadCount}
                     </Badge>
                   )}
                  {option.type === 'favorites' && (
                    <Badge variant="secondary" className="ml-auto text-xs px-1.5 py-0 flex-shrink-0">
                      {getFavorites().length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de Conversas */}
      <ScrollArea className="flex-1 min-h-0">
        <ConversationList
          selectedChat={selectedChat}
          onSelectChat={onSelectChat}
          filters={filters}
          collapsed={collapsed}
        />
      </ScrollArea>
    </div>
  );
}