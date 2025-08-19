import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, MessageSquare, Calendar, Send } from "lucide-react";
import { FollowupKanbanLead } from "@/hooks/useFollowupKanban";

interface FollowupKanbanColumnProps {
  title: string;
  leads: FollowupKanbanLead[];
  selectedLeads: number[];
  onSelectLead: (leadId: number) => void;
  onSelectAll: () => void;
  onViewLead: (lead: FollowupKanbanLead) => void;
  onSendFollowup: (leads: FollowupKanbanLead[]) => void;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  isLoading?: boolean;
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case "Abordado":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Qualificado":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const FollowupKanbanColumn = ({
  title,
  leads,
  selectedLeads,
  onSelectLead,
  onSelectAll,
  onViewLead,
  onSendFollowup,
  badgeVariant,
  isLoading = false
}: FollowupKanbanColumnProps) => {
  const selectedLeadsInColumn = leads.filter(lead => selectedLeads.includes(lead.id));
  const allSelected = leads.length > 0 && selectedLeadsInColumn.length === leads.length;

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <Badge variant={badgeVariant} className="text-xs">
            {leads.length}
          </Badge>
        </div>
        {leads.length > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({selectedLeadsInColumn.length}/{leads.length})
            </span>
            {selectedLeadsInColumn.length > 0 && (
              <Button
                size="sm"
                onClick={() => onSendFollowup(selectedLeadsInColumn)}
                disabled={isLoading}
                className="ml-auto"
              >
                <Send className="w-3 h-3 mr-1" />
                Enviar Follow-up
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum lead nesta categoria</p>
          </div>
        ) : (
          leads.map((lead) => (
            <Card key={lead.id} className="p-3 border border-border hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedLeads.includes(lead.id)}
                  onCheckedChange={() => onSelectLead(lead.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-sm font-medium truncate">{lead.name}</h4>
                    <Badge className={`text-xs ${getStageColor(lead.stage)}`}>
                      {lead.stage}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Qualificação:</span> {lead.qualificacao}
                    </p>
                    <p className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{lead.dias_parado} dias desde criação</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      <span>{lead.followup_count} follow-up(s) enviado(s)</span>
                    </p>
                    {lead.ultimo_followup && (
                      <p className="flex items-center gap-1">
                        <span className="font-medium">Último:</span> 
                        {new Date(lead.ultimo_followup).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewLead(lead)}
                  className="p-1 h-auto"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
};