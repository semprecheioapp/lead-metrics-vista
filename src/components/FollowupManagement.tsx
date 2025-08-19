import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFollowupKanban, FollowupKanbanLead, FollowupFilter } from "@/hooks/useFollowupKanban";
import { FollowupKanbanColumn } from "./FollowupKanbanColumn";
import { LeadConversationModal } from "./LeadConversationModal";
import { MetricCard } from "./MetricCard";
import { Users, Send, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const FollowupManagement = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FollowupFilter>({ value: 3, unit: 'days' });
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<FollowupKanbanLead | null>(null);
  
  const { data: kanbanData, refetch } = useFollowupKanban(filter);

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAllPending = () => {
    const pendingIds = kanbanData?.pending.map(lead => lead.id) || [];
    const allPendingSelected = pendingIds.every(id => selectedLeads.includes(id));
    
    if (allPendingSelected) {
      setSelectedLeads(prev => prev.filter(id => !pendingIds.includes(id)));
    } else {
      setSelectedLeads(prev => [...new Set([...prev, ...pendingIds])]);
    }
  };

  const handleSelectAllSentOnce = () => {
    const sentOnceIds = kanbanData?.sentOnce.map(lead => lead.id) || [];
    const allSentOnceSelected = sentOnceIds.every(id => selectedLeads.includes(id));
    
    if (allSentOnceSelected) {
      setSelectedLeads(prev => prev.filter(id => !sentOnceIds.includes(id)));
    } else {
      setSelectedLeads(prev => [...new Set([...prev, ...sentOnceIds])]);
    }
  };

  const handleSelectAllSentMultiple = () => {
    const sentMultipleIds = kanbanData?.sentMultiple.map(lead => lead.id) || [];
    const allSentMultipleSelected = sentMultipleIds.every(id => selectedLeads.includes(id));
    
    if (allSentMultipleSelected) {
      setSelectedLeads(prev => prev.filter(id => !sentMultipleIds.includes(id)));
    } else {
      setSelectedLeads(prev => [...new Set([...prev, ...sentMultipleIds])]);
    }
  };

  const handleSendFollowup = async (leads: FollowupKanbanLead[]) => {
    if (leads.length === 0) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-followup', {
        body: { 
          leads: leads.map(lead => ({
            id: lead.id,
            nome: lead.name,
            telefone: lead.number,
            etapa: lead.etapa,
            dias_parado: lead.dias_parado,
            ultima_interacao: lead.updated_at,
            qualificacao: lead.qualificacao
          }))
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Follow-up enviado com sucesso para ${leads.length} lead(s)!`);
        setSelectedLeads([]);
        
        // Invalidar cache para atualizar os dados
        queryClient.invalidateQueries({ queryKey: ['followup-kanban'] });
        await refetch();
      } else {
        throw new Error(data?.error || 'Erro desconhecido ao enviar follow-up');
      }
    } catch (error: any) {
      console.error('Erro ao enviar follow-up:', error);
      toast.error(`Erro ao enviar follow-up: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLead = (lead: FollowupKanbanLead) => {
    setSelectedLead(lead);
  };

  // Métricas para exibir no topo
  const metrics = [
    {
      title: "Total de Leads",
      value: kanbanData?.total || 0,
      subtitle: "Aguardando follow-up",
      icon: <Users className="w-5 h-5 text-primary" />,
      trend: "neutral" as const,
    },
    {
      title: "Primeiro Follow-up",
      value: kanbanData?.totalPending || 0,
      subtitle: "Nunca receberam",
      icon: <AlertTriangle className="w-5 h-5 text-orange-500" />,
      trend: "neutral" as const,
    },
    {
      title: "Follow-up Enviado",
      value: kanbanData?.totalSentOnce || 0,
      subtitle: "Receberam 1x",
      icon: <Send className="w-5 h-5 text-blue-500" />,
      trend: "neutral" as const,
    },
    {
      title: "Múltiplos Follow-ups",
      value: kanbanData?.totalSentMultiple || 0,
      subtitle: "Receberam 2+ vezes",
      icon: <Clock className="w-5 h-5 text-green-500" />,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sem resposta há:</label>
              <Select 
                value={filter.value.toString()} 
                onValueChange={(value) => setFilter(prev => ({ ...prev, value: parseInt(value) }))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filter.unit === 'minutes' && (
                    <>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="45">45</SelectItem>
                    </>
                  )}
                  {filter.unit === 'hours' && (
                    <>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                    </>
                  )}
                  {filter.unit === 'days' && (
                    <>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="7">7</SelectItem>
                      <SelectItem value="15">15</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <Select 
                value={filter.unit} 
                onValueChange={(value: 'minutes' | 'hours' | 'days') => setFilter(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                  <SelectItem value="days">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FollowupKanbanColumn
          title="Aguardando Primeiro Follow-up"
          leads={kanbanData?.pending || []}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAllPending}
          onViewLead={handleViewLead}
          onSendFollowup={handleSendFollowup}
          badgeVariant="destructive"
          isLoading={isLoading}
        />
        
        <FollowupKanbanColumn
          title="Follow-up Enviado (1x)"
          leads={kanbanData?.sentOnce || []}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAllSentOnce}
          onViewLead={handleViewLead}
          onSendFollowup={handleSendFollowup}
          badgeVariant="secondary"
          isLoading={isLoading}
        />
        
        <FollowupKanbanColumn
          title="Múltiplos Follow-ups (2+)"
          leads={kanbanData?.sentMultiple || []}
          selectedLeads={selectedLeads}
          onSelectLead={handleSelectLead}
          onSelectAll={handleSelectAllSentMultiple}
          onViewLead={handleViewLead}
          onSendFollowup={handleSendFollowup}
          badgeVariant="default"
          isLoading={isLoading}
        />
      </div>

      {/* Modal de conversa */}
      {selectedLead && (
        <LeadConversationModal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          leadName={selectedLead.name}
          phoneNumber={selectedLead.number}
        />
      )}
    </div>
  );
};