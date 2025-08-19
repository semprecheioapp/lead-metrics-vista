
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Webhook } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import { ColumnSettingsModal } from "./ColumnSettingsModal";
import { useState } from "react";

interface KanbanColumnProps {
  column: {
    id: number;
    nome: string;
    cor?: string;
    webhook_ativo: boolean;
    webhook_url?: string;
    pipeline_id: number;
  };
  leads: Array<{
    id: number;
    name: string;
    number: string;
    qualificacao?: string;
    created_at: string;
    kanban_coluna_id: number;
  }>;
}

export function KanbanColumn({ column, leads }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
  });
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Card className="w-80 flex-shrink-0 bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.cor || '#3b82f6' }}
              />
              <CardTitle className="text-sm font-medium text-card-foreground">
                {column.nome}
              </CardTitle>
              <Badge variant="secondary" className="text-xs">
                {leads.length}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {column.webhook_ativo && (
                <Webhook className="w-3 h-3 text-success" />
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent ref={setNodeRef} className="pt-0 min-h-[400px]">
          <SortableContext items={leads.map(lead => lead.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {leads.map((lead) => (
                <KanbanCard key={lead.id} lead={lead} />
              ))}
            </div>
          </SortableContext>
          
          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Arraste leads para esta coluna
            </div>
          )}
        </CardContent>
      </Card>

      <ColumnSettingsModal
        open={showSettings}
        onOpenChange={setShowSettings}
        column={column}
      />
    </>
  );
}
