import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Target } from "lucide-react";
import { useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";
import { CreatePipelineModal } from "@/components/CreatePipelineModal";
import { usePipelines } from "@/hooks/usePipelines";

export default function Oportunidades() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<number | null>(null);
  const { data: pipelines, isLoading } = usePipelines();

  const activePipeline = pipelines?.find(p => p.id === selectedPipelineId) || pipelines?.[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Oportunidades
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus leads através do pipeline de vendas
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Criar Nova Pipeline
          </Button>
        </div>

        {/* Pipeline Selector */}
        {pipelines && pipelines.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipeline Ativa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap">
                {pipelines.map((pipeline) => (
                  <Button
                    key={pipeline.id}
                    variant={selectedPipelineId === pipeline.id ? "default" : "outline"}
                    onClick={() => setSelectedPipelineId(pipeline.id)}
                    className="transition-all"
                  >
                    {pipeline.nome}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kanban Board */}
        {activePipeline ? (
          <KanbanBoard pipelineId={activePipeline.id} />
        ) : !isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma pipeline encontrada
              </h3>
              <p className="text-muted-foreground text-center mb-6">
                Crie sua primeira pipeline para começar a gerenciar oportunidades
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Nova Pipeline
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {/* Create Pipeline Modal */}
        <CreatePipelineModal 
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSuccess={(newPipeline) => setSelectedPipelineId(newPipeline.id)}
        />
      </div>
    </DashboardLayout>
  );
}