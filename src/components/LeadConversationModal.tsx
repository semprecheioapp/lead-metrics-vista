import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, Bot, User, Download, Brain, FileText } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useLeadConversations } from "@/hooks/useLeadConversations";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationSummary } from "./ConversationSummary";

interface LeadConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadName: string;
  phoneNumber: string;
}

export const LeadConversationModal = ({ 
  isOpen, 
  onClose, 
  leadName, 
  phoneNumber 
}: LeadConversationModalProps) => {
  const { data: conversations, isLoading } = useLeadConversations(phoneNumber);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const { toast } = useToast();
  const { empresaData } = useAuth();

  console.log('🔄 Modal renderizado:', { summary: !!summary, summaryData: summary });

  const exportConversations = () => {
    if (!conversations || conversations.length === 0) return;

    const exportData = {
      lead: leadName,
      phone: phoneNumber,
      exportDate: new Date().toISOString(),
      totalMessages: conversations.length,
      conversations: conversations.map(msg => ({
        content: msg.content,
        sender: msg.isFromAI ? 'IA' : 'Cliente',
        timestamp: msg.timestamp
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversa-${leadName}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportação concluída",
      description: "Conversa exportada com sucesso!",
    });
  };

  const generateSummary = async () => {
    console.log('🧠 Iniciando geração de resumo...');
    if (!conversations || conversations.length === 0 || !empresaData) {
      console.log('❌ Condições não atendidas:', { conversations: !!conversations, length: conversations?.length, empresaData: !!empresaData });
      return;
    }

    setGeneratingSummary(true);
    try {
      const requestData = {
        empresa_id: empresaData.id,
        lead_name: leadName,
        lead_phone: phoneNumber,
        conversas: conversations.map(msg => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          isFromAI: msg.isFromAI,
          rawMessage: msg.rawMessage
        }))
      };

      console.log('📤 Enviando dados para resumo:', requestData);

      const response = await fetch('https://wb.semprecheioapp.com.br/webhook/resumo_dashbk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📥 Resposta recebida:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const summaryData = await response.json();
      console.log('🔍 Dados do resumo:', summaryData);

      if (summaryData.success) {
        console.log('✅ Resumo gerado com sucesso, atualizando estado...');
        setSummary(summaryData.resumo);
        console.log('🎯 Estado do resumo atualizado:', summaryData.resumo);
        toast({
          title: "Resumo gerado com sucesso",
          description: "Análise da conversa disponível abaixo.",
        });
      } else {
        throw new Error(summaryData.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('❌ Erro ao gerar resumo:', error);
      toast({
        title: "Erro ao gerar resumo",
        description: "Não foi possível conectar com o serviço de análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingSummary(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] w-[95vw] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                Conversas com {leadName}
              </div>
              <Badge variant="outline" className="text-xs w-fit">
                {phoneNumber}
              </Badge>
            </DialogTitle>
            <div className="flex gap-2">
              {conversations && conversations.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateSummary}
                    disabled={generatingSummary}
                    className="flex items-center gap-2"
                  >
                    {generatingSummary ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">Resumo IA</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportConversations}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6 flex-1 min-h-0">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground text-sm">Carregando conversas...</span>
              </div>
            ) : !conversations || conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma conversa encontrada
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ainda não há conversas registradas para este lead.
                </p>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 border rounded-lg p-3 sm:p-4 min-h-[300px] lg:min-h-[400px]">
                  <div className="space-y-3">
                    {conversations.map((message, index) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 sm:gap-3 ${
                          message.isFromAI ? "justify-start" : "justify-end"
                        }`}
                      >
                        <div
                          className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
                            message.isFromAI ? "flex-row" : "flex-row-reverse"
                          }`}
                        >
                          <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                            message.isFromAI 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-muted-foreground text-muted"
                          }`}>
                            {message.isFromAI ? (
                              <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                            ) : (
                              <User className="w-3 h-3 sm:w-4 sm:h-4" />
                            )}
                          </div>
                          
                          <div className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm ${
                            message.isFromAI
                              ? "bg-muted/50 text-foreground border border-border/50"
                              : "bg-primary text-primary-foreground"
                          }`}>
                            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <div className={`text-xs mt-1 sm:mt-2 flex items-center gap-1 ${
                              message.isFromAI ? "text-muted-foreground" : "text-primary-foreground/70"
                            }`}>
                              <span>{format(new Date(message.timestamp), 'HH:mm')}</span>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(message.timestamp), { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="border-t pt-3 sm:pt-4 flex-shrink-0">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-foreground">{conversations.length}</div>
                      <div className="text-muted-foreground text-xs">Mensagens</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {conversations.filter(m => m.isFromAI).length}
                      </div>
                      <div className="text-muted-foreground text-xs">Da IA</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-foreground">
                        {conversations.filter(m => !m.isFromAI).length}
                      </div>
                      <div className="text-muted-foreground text-xs">Do Cliente</div>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 text-center text-xs text-muted-foreground">
                    Última atividade: {formatDistanceToNow(new Date(conversations[conversations.length - 1].timestamp), { 
                      addSuffix: true, 
                      locale: ptBR 
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="lg:col-span-1 flex flex-col min-h-0">
            {summary ? (
              <div className="h-full overflow-hidden">
                <ConversationSummary summary={summary} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/30 rounded-lg p-4 sm:p-6 min-h-[200px]">
                <Brain className="w-8 h-8 sm:w-12 sm:h-12 mb-4" />
                <p className="text-center text-xs sm:text-sm">
                  Clique em "Resumo IA" para gerar um resumo inteligente desta conversa
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};