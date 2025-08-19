import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Phone } from "lucide-react";
import { useRecentLeads } from "@/hooks/useLeads";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LeadConversationModal } from "@/components/LeadConversationModal";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Lead {
  id: number;
  name: string;
  phone: string;
  stage: string;
  qualification: string;
  lastContact: string;
}

const getStageColor = (stage: string) => {
  switch (stage) {
    case "Novo": return "bg-muted text-muted-foreground";
    case "Abordado": return "bg-primary/10 text-primary";
    case "Qualificado": return "bg-primary/20 text-primary";
    case "Fechado": return "bg-success/10 text-success";
    default: return "bg-muted text-muted-foreground";
  }
};

const MobileLeadCard = ({ lead, onView }: { lead: any; onView: (lead: any) => void }) => {
  const lastContact = lead.created_at
    ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })
    : "—";

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground text-sm truncate">{lead.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Qualificação: {lead.qualification}
            </p>
          </div>
          <Badge className={`${getStageColor(lead.stage)} text-xs whitespace-nowrap ml-2`}>
            {lead.stage}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {lastContact}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="h-8 px-3 touch-target"
            onClick={() => onView(lead)}
          >
            <Eye className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const LeadsTableMobile = () => {
  const { data: leads } = useRecentLeads(10);
  const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string } | null>(null);
  const isMobile = useIsMobile();

  const handleViewLead = (lead: any) => {
    console.log("👁️ Clicou em visualizar lead:", { name: lead.name, phone: lead.phone });
    setSelectedLead({ name: lead.name, phone: lead.phone });
  };

  if (isMobile) {
    return (
      <Card className="animate-slide-up">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Leads Recentes</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {(leads || []).map((lead) => (
              <MobileLeadCard
                key={lead.id}
                lead={lead}
                onView={handleViewLead}
              />
            ))}
          </div>
        </CardContent>
        
        <LeadConversationModal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          leadName={selectedLead?.name || ""}
          phoneNumber={selectedLead?.phone || ""}
        />
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Etapa</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Último Contato</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {(leads || []).map((lead) => {
                  const lastContact = lead.created_at
                    ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })
                    : "—";
                  return (
                    <tr key={lead.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">Qualificação: {lead.qualification}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getStageColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{lastContact}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="touch-target"
                            onClick={() => handleViewLead(lead)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
      
      <LeadConversationModal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        leadName={selectedLead?.name || ""}
        phoneNumber={selectedLead?.phone || ""}
      />
    </Card>
  );
};