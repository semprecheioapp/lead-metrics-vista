
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Phone, Tag } from "lucide-react";
import { useRecentLeads } from "@/hooks/useLeads";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LeadConversationModal } from "@/components/LeadConversationModal";
import { useState } from "react";

interface Lead {
  id: number;
  name: string;
  phone: string;
  stage: string;
  qualification: string;
  lastContact: string;
  tags?: string[];
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

export const LeadsTable = () => {
  const { data: leads } = useRecentLeads(10);
  const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string } | null>(null);

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[700px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground hidden md:table-cell">Etapa</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground hidden xl:table-cell">Último Contato</th>
                <th className="text-left p-2 sm:p-4 text-xs sm:text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(leads || []).map((lead) => {
                const lastContact = lead.created_at
                  ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })
                  : "—";
                
                // Simular tags para demonstração - em produção virá do banco
                const leadTags = lead.tags || [];
                
                return (
                  <tr key={lead.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="font-medium text-foreground text-sm sm:text-base">{lead.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Qualificação: {lead.qualification}
                        </p>
                        {/* Show stage on mobile */}
                        <div className="md:hidden mt-1">
                          <Badge className={getStageColor(lead.stage)} variant="outline">
                            {lead.stage}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 hidden md:table-cell">
                      <Badge className={getStageColor(lead.stage)}>
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="p-2 sm:p-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {leadTags.length > 0 ? (
                          leadTags.slice(0, 2).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Sem tags
                          </span>
                        )}
                        {leadTags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{leadTags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-xs sm:text-sm text-muted-foreground hidden xl:table-cell">{lastContact}</td>
                    <td className="p-2 sm:p-4">
                      <div className="flex gap-1 sm:gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2 sm:px-3"
                          onClick={() => {
                            console.log("👁️ Clicou em visualizar lead:", { name: lead.name, phone: lead.phone });
                            setSelectedLead({ name: lead.name, phone: lead.phone });
                          }}
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="sr-only sm:not-sr-only sm:ml-1">Ver</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
