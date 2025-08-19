
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Phone, Calendar, MessageSquare, Star, Tag, X } from "lucide-react";
import { useLeadStats } from "@/hooks/useLeadStats";
import { TagsManager } from "./TagsManager";
import { useLeadTags } from "@/hooks/useLeadTags";
import { useLeadByPhone } from "@/hooks/useLeadByPhone";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadInfoPanelProps {
  chatId: string;
  onClose?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-800";
    case "qualified":
      return "bg-green-100 text-green-800";
    case "converted":
      return "bg-purple-100 text-purple-800";
    case "lost":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "new":
      return "Novo";
    case "qualified":
      return "Qualificado";
    case "converted":
      return "Convertido";
    case "lost":
      return "Perdido";
    default:
      return "Desconhecido";
  }
};

export const LeadInfoPanel = ({ chatId, onClose }: LeadInfoPanelProps) => {
  // Extrair número de telefone do chatId (assumindo que chatId é o número)
  const phoneNumber = chatId;
  
  const { data: leadData, isLoading: leadLoading } = useLeadByPhone(phoneNumber);
  const { data: stats, isLoading: statsLoading } = useLeadStats(phoneNumber);
  const { tags, updateTags, isUpdating } = useLeadTags(leadData?.id || 0);
  
  const leadName = leadData?.name || phoneNumber;
  const leadId = leadData?.id;

  const handleTagsUpdate = (newTags: string[]) => {
    updateTags(newTags);
  };

  if (statsLoading || leadLoading) {
    return (
      <div className="w-80 border-l border-border bg-card p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border-l border-border bg-card overflow-y-auto">
      {/* Header com botão de fechar em mobile */}
      {onClose && (
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Informações do Lead</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      
      <div className="p-4 space-y-4">
        {/* Informações do Lead */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              Informações do Lead
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{leadName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{phoneNumber}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-semibold">{stats?.totalMessages || 0}</div>
                <div className="text-muted-foreground">Mensagens</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded">
                <div className="font-semibold">{stats?.daysSinceLastContact || 0}</div>
                <div className="text-muted-foreground">Dias sem contato</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(stats?.status || "new")}>
                {getStatusLabel(stats?.status || "new")}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Etapa:</span>
              <Badge variant="outline">
                Etapa {stats?.stage || 1}
              </Badge>
            </div>

            {stats?.isFavorite && (
              <div className="flex items-center gap-2 text-yellow-600">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm">Lead Favorito</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags do Lead */}
        {leadId && (
          <TagsManager
            leadId={leadId}
            currentTags={tags}
            onTagsUpdate={handleTagsUpdate}
          />
        )}

        {/* Ações Rápidas */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="w-4 h-4 mr-2" />
              Enviar Mensagem
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Follow-up
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Marcar como Favorito
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
