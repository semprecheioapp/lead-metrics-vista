import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompany } from "@/hooks/useCompany";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreatePipelineModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (pipeline: { id: number; nome: string; moeda: string }) => void;
}

const DEFAULT_COLUMNS = [
  { nome: "SEM CLASSIFICAÇÃO", ordem: 1, cor: "#94a3b8" },
  { nome: "LEAD FRIO", ordem: 2, cor: "#60a5fa" },
  { nome: "LEAD MORNO", ordem: 3, cor: "#fbbf24" },
  { nome: "LEAD QUENTE", ordem: 4, cor: "#f59e0b" },
  { nome: "VENDIDO", ordem: 5, cor: "#10b981" },
];

export function CreatePipelineModal({ open, onOpenChange, onSuccess }: CreatePipelineModalProps) {
  const [nome, setNome] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { data: empresa } = useCompany();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      toast.error("Nome da pipeline é obrigatório");
      return;
    }

    if (!empresa?.id) {
      toast.error("Empresa não encontrada");
      return;
    }

    setIsLoading(true);

    try {
      // Criar a pipeline
      const { data: pipeline, error: pipelineError } = await supabase
        .from('pipelines')
        .insert({
          nome: nome.trim(),
          moeda: 'BRL',
          empresa_id: empresa.id
        })
        .select()
        .single();

      if (pipelineError) throw pipelineError;

      // Criar as colunas padrão
      const columnsToCreate = DEFAULT_COLUMNS.map(col => ({
        ...col,
        pipeline_id: pipeline.id
      }));

      const { error: columnsError } = await supabase
        .from('kanban_colunas')
        .insert(columnsToCreate);

      if (columnsError) throw columnsError;

      toast.success("Pipeline criada com sucesso!");
      setNome("");
      onOpenChange(false);
      onSuccess?.(pipeline);

    } catch (error) {
      console.error('Erro ao criar pipeline:', error);
      toast.error("Erro ao criar pipeline");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Pipeline</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moeda">Moeda</Label>
              <Input
                id="moeda"
                value="BRL - Brazil"
                disabled
                className="bg-muted text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Pipeline *</Label>
              <Input
                id="nome"
                placeholder="Ex: Vendas Principais"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Colunas padrão que serão criadas:</h4>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLUMNS.map((col) => (
                <div
                  key={col.nome}
                  className="flex items-center gap-1 text-xs px-2 py-1 bg-background rounded border"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: col.cor }}
                  />
                  {col.nome}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Pipeline"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}