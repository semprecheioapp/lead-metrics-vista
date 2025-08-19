import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLeadConversations } from "@/hooks/useLeadConversations";
import { useWhatsAppLeads } from "@/hooks/useWhatsAppLeads";
import { useSendWhatsAppMessage } from "@/hooks/useSendWhatsAppMessage";
import { useConfiguracoesEmpresa } from "@/hooks/useConfiguracoesEmpresa";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WhatsAppChatProps {
  chatId: string; // session_id / telefone
}

export const WhatsAppChat = ({ chatId }: WhatsAppChatProps) => {
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { data: conversations, isLoading } = useLeadConversations(chatId);
  const { data: leads } = useWhatsAppLeads();
  const { mutate: sendMessage, isPending: isSending } = useSendWhatsAppMessage();
  const { data: config } = useConfiguracoesEmpresa();
  
  const currentLead = leads?.find(lead => lead.session_id === chatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 72) + 'px';
    }
  }, [message]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentLead || isSending) return;
    
    const remetente = senderName.trim() || config?.nome_remetente_padrao || "Atendente";
    
    sendMessage({
      nome: currentLead.name,
      telefone: currentLead.telefone,
      mensagem: message,
      remetente
    });
    
    setMessage("");
    setSenderName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const groupMessagesByDate = (messages: any[]) => {
    const groups: { [key: string]: any[] } = {};
    
    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Ontem';
      } else {
        dateKey = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });
    
    return groups;
  };

  if (!currentLead) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <p className="text-muted-foreground">Lead não encontrado</p>
      </div>
    );
  }

  const messageGroups = conversations ? groupMessagesByDate(conversations) : {};

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center p-4 bg-card border-b border-border">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarFallback className="bg-muted text-foreground">
            {currentLead.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h3 className="font-medium text-foreground">{currentLead.name}</h3>
          <p className="text-sm text-muted-foreground">
            {currentLead.telefone}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 bg-background"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-opacity='0.03'%3E%3Cpolygon fill='%23000' points='50 0 60 40 100 50 60 60 50 100 40 60 0 50 40 40'/%3E%3C/g%3E%3C/svg%3E")` 
        }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn(
                  "flex",
                  i % 2 === 0 ? "justify-start" : "justify-end"
                )}>
                  <div className="max-w-sm p-3 rounded-lg bg-muted animate-pulse">
                    <div className="h-4 bg-muted-foreground/20 rounded mb-2" />
                    <div className="h-3 bg-muted-foreground/20 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations?.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">Nenhuma mensagem ainda</p>
              <p className="text-sm">Envie a primeira mensagem para começar a conversa</p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([dateKey, msgs]) => (
              <div key={dateKey} className="space-y-4">
                {/* Date separator */}
                <div className="flex justify-center">
                  <div className="bg-muted/50 px-3 py-1 rounded-full">
                    <span className="text-xs text-muted-foreground font-medium">{dateKey}</span>
                  </div>
                </div>
                
                {/* Messages for this date */}
                {msgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex mb-1",
                      msg.isFromAI ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex flex-col",
                      msg.isFromAI ? "items-end" : "items-start"
                    )}>
                      {/* Mostrar nome do remetente para mensagens manuais da empresa */}
                      {msg.isFromAI && msg.rawMessage?.response_metadata?.is_manual && msg.rawMessage?.response_metadata?.sender_name && (
                        <div className="text-xs text-muted-foreground mb-1 px-1">
                          {msg.rawMessage.response_metadata.sender_name}
                        </div>
                      )}
                      
                      <div
                        className={cn(
                          "max-w-sm lg:max-w-md p-3 rounded-lg shadow-sm relative",
                          msg.isFromAI
                            ? "bg-primary text-white rounded-br-sm"
                            : "bg-slate-800 border border-slate-600 text-slate-100 rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-2">
                          <span className={cn(
                            "text-xs",
                            msg.isFromAI ? "text-white/80" : "text-slate-400"
                          )}>
                            {formatMessageTime(msg.timestamp)}
                          </span>
                          {msg.isFromAI && (
                            <span className="text-white/80 text-xs ml-1">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
          
          {isSending && (
            <div className="flex justify-end mb-1">
              <div className="bg-primary/20 p-3 rounded-lg rounded-br-sm max-w-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="p-4 bg-card border-t border-border">
        <div className="space-y-3 max-w-4xl mx-auto">
          {/* Sender name input */}
          <div className="flex items-center gap-3">
            <Label htmlFor="sender-name" className="text-sm text-muted-foreground whitespace-nowrap">
              Remetente:
            </Label>
            <Input
              id="sender-name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder={config?.nome_remetente_padrao || "Atendente"}
              className="h-8 text-sm bg-muted/50 border-none"
            />
          </div>
          
          {/* Message input */}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Digite uma mensagem..."
                className="resize-none min-h-[44px] max-h-[72px] px-4 py-3 pr-12 bg-muted/50 border-none rounded-full"
                rows={1}
              />
            </div>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="icon"
              className="rounded-full h-11 w-11 bg-primary hover:bg-primary/90"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};