
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Webhook, Palette, Save, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface ColumnSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: {
    id: number;
    nome: string;
    cor?: string;
    webhook_ativo: boolean;
    webhook_url?: string;
    pipeline_id: number;
  };
}

const predefinedColors = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export function ColumnSettingsModal({ open, onOpenChange, column }: ColumnSettingsModalProps) {
  const [nome, setNome] = useState(column.nome);
  const [cor, setCor] = useState(column.cor || '#3b82f6');
  const [webhookAtivo, setWebhookAtivo] = useState(column.webhook_ativo);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // URL padrão do webhook para todos os clientes
  const defaultWebhookUrl = "https://wb.semprecheioapp.com.br/webhook/etapa_client_dashmbk";

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('kanban_colunas')
        .update({
          nome,
          cor,
          webhook_ativo: webhookAtivo,
          webhook_url: webhookAtivo ? defaultWebhookUrl : null,
        })
        .eq('id', column.id);

      if (error) throw error;

      // Invalidar cache para recarregar dados
      queryClient.invalidateQueries({ queryKey: ["kanban-columns", column.pipeline_id] });
      
      toast.success("Configurações salvas com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Configurações da Coluna
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nome da Coluna */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome da Coluna</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da coluna"
            />
          </div>

          {/* Cor da Coluna */}
          <div className="space-y-3">
            <Label>Cor da Coluna</Label>
            <div className="flex gap-2 flex-wrap">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setCor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    cor === color ? 'border-foreground shadow-lg' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className="w-12 h-8 p-0 border-0"
              />
              <Input
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          {/* Configurações de Webhook */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-green-500" />
                <Label htmlFor="webhook-ativo">Webhook Ativo</Label>
                {webhookAtivo && <Badge variant="default" className="text-xs bg-green-500">Ativo</Badge>}
              </div>
              <Switch
                id="webhook-ativo"
                checked={webhookAtivo}
                onCheckedChange={setWebhookAtivo}
              />
            </div>

            {webhookAtivo && (
              <p className="text-xs text-muted-foreground">
                Será chamado quando um lead for movido para esta coluna
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
