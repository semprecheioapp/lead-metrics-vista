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

export const ResponsiveLeadsTable = () => {
  const { data: leads } = useRecentLeads(10);
  const [selectedLead, setSelectedLead] = useState<{ name: string; phone: string } | null>(null);

  return (
    <Card className="animate-slide-up">
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Leads Recentes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile Cards View */}
        <div className="block sm:hidden space-y-3 px-4 pb-4">
          {(leads || []).map((lead) => {
            const lastContact = lead.created_at
              ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })
              : "—";
            
            const leadTags = lead.tags || [];
            
            return (
              <Card key={lead.id} className="border border-border/50 bg-card/80">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        Qualificação: {lead.qualification}
                      </p>
                    </div>
                    <Badge className={`${getStageColor(lead.stage)} text-xs`}>
                      {lead.stage}
                    </Badge>
                  </div>
                  
                  {leadTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {leadTags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {leadTags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{leadTags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-xs text-muted-foreground">{lastContact}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="px-3 py-1 h-7"
                      onClick={() => {
                        setSelectedLead({ name: lead.name, phone: lead.phone });
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-muted-foreground">Nome</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Etapa</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Tags</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-muted-foreground">Último Contato</th>
                <th className="text-left p-3 md:p-4 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(leads || []).map((lead) => {
                const lastContact = lead.created_at
                  ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR })
                  : "—";
                
                const leadTags = lead.tags || [];
                
                return (
                  <tr key={lead.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="p-3 md:p-4">
                      <div>
                        <p className="font-medium text-foreground text-sm">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Qualificação: {lead.qualification}
                        </p>
                        {/* Show stage on small screens */}
                        <div className="md:hidden mt-1">
                          <Badge className={`${getStageColor(lead.stage)} text-xs`} variant="outline">
                            {lead.stage}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 md:p-4 hidden md:table-cell">
                      <Badge className={getStageColor(lead.stage)}>
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="p-3 md:p-4 hidden lg:table-cell">
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
                    <td className="p-3 md:p-4 text-xs sm:text-sm text-muted-foreground">{lastContact}</td>
                    <td className="p-3 md:p-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="px-2 sm:px-3"
                        onClick={() => {
                          setSelectedLead({ name: lead.name, phone: lead.phone });
                        }}
                      >
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline ml-1">Ver</span>
                      </Button>
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