
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { useKanbanColumns } from "@/hooks/useKanbanColumns";
import { useKanbanLeads } from "@/hooks/useKanbanLeads";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Loader2, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KanbanBoardProps {
  pipelineId: number;
}

export function KanbanBoard({ pipelineId }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { data: columns, isLoading: columnsLoading } = useKanbanColumns(pipelineId);
  const { data: leads, isLoading: leadsLoading, refetch: refetchLeads } = useKanbanLeads(pipelineId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as number;
    const overId = over.id as number;

    // Encontrar o lead sendo movido
    const lead = leads?.find((l) => l.id === leadId);
    if (!lead) return;

    // Determinar coluna de destino corretamente
    let newColumnId: number | undefined;

    // 1) Se soltou na área vazia da coluna, over.id é o id da coluna
    if (columns?.some((c) => c.id === overId)) {
      newColumnId = overId;
    } else {
      // 2) Se soltou sobre outro card, over.id é o id do lead desse card
      const overLead = leads?.find((l) => l.id === overId);
      newColumnId = overLead?.kanban_coluna_id;
    }

    if (!newColumnId) return;

    // Se já está na mesma coluna, não fazer nada
    if (lead.kanban_coluna_id === newColumnId) return;

    const oldColumnId = lead.kanban_coluna_id;

    try {
      // Buscar próxima posição na coluna de destino (max + 1)
      const { data: posData, error: posError } = await supabase
        .from('novos_leads')
        .select('posicao_kanban')
        .eq('kanban_coluna_id', newColumnId)
        .order('posicao_kanban', { ascending: false })
        .limit(1);

      if (posError) throw posError;
      const nextPos = ((posData?.[0]?.posicao_kanban as number) || 0) + 1;

      // Descobrir etapa a partir da coluna (se disponível)
      const targetColumn = columns?.find((c: any) => c.id === newColumnId) as any;
      const newEtapa = targetColumn?.ordem ?? lead.etapa;

      // Atualizar no banco
      const { error } = await supabase
        .from('novos_leads')
        .update({
          kanban_coluna_id: newColumnId,
          posicao_kanban: nextPos,
          etapa: newEtapa,
        })
        .eq('id', leadId);

      if (error) throw error;

      // Disparar webhook se necessário (só para leads da etapa 2+)
      if (oldColumnId !== newColumnId && newEtapa >= 2) {
        await supabase.functions.invoke('kanban-webhook', {
          body: {
            leadId,
            fromColumnId: oldColumnId,
            toColumnId: newColumnId,
          },
        });
      }

      // Atualizar UI
      refetchLeads();
      toast.success('Lead movido com sucesso!');
    } catch (error) {
      console.error('Erro ao mover lead:', error);
      toast.error('Erro ao mover lead');
    }
  };

  if (columnsLoading || leadsLoading) {
    return (
      <Card className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando pipeline...</span>
      </Card>
    );
  }

  if (!columns || columns.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma coluna encontrada para esta pipeline.</p>
      </Card>
    );
  }

  const activeLead = leads?.find(lead => lead.id.toString() === activeId);

  return (
    <div className="space-y-4">
      {/* Informação sobre quando os leads aparecem */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funcionam os leads na pipeline:</strong> Todos os leads com pipeline definido aparecem aqui, incluindo os da <strong>etapa 1 (SEM CLASSIFICAÇÃO)</strong>. 
          Porém, <strong>webhooks só são disparados para leads da etapa 2 ou superior</strong> quando movidos entre colunas.
        </AlertDescription>
      </Alert>

      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCorners}
      >
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 h-[calc(100vh-14rem)] md:h-[calc(100vh-12rem)] snap-x snap-mandatory scrollbar-hide kanban-scroll">
          <SortableContext items={columns.map(col => col.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                leads={leads?.filter(lead => lead.kanban_coluna_id === column.id) || []}
              />
            ))}
          </SortableContext>
        </div>

        <DragOverlay>
          {activeLead && (
            <div className="rotate-2 scale-110 shadow-2xl border-2 border-primary/50 bg-background/95 backdrop-blur-sm">
              <KanbanCard lead={activeLead} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
