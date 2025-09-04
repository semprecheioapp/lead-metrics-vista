import { useState } from "react";
import { useAllEmpresas } from "@/hooks/useAllEmpresas";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Crown, Building, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const WhiteLabelManagement = () => {
  const { data: empresas, isLoading } = useAllEmpresas();
  const [updatingEmpresa, setUpdatingEmpresa] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const handleToggleWhiteLabel = async (empresaId: number, currentStatus: boolean) => {
    setUpdatingEmpresa(empresaId);
    
    try {
      const { error } = await supabase
        .from("empresas")
        .update({ whitelabel_enabled: !currentStatus })
        .eq("id", empresaId);

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["all_empresas"] });
      
      toast.success(
        `White Label ${!currentStatus ? "habilitado" : "desabilitado"} com sucesso!`
      );
    } catch (error) {
      console.error("Erro ao atualizar White Label:", error);
      toast.error("Erro ao atualizar White Label. Tente novamente.");
    } finally {
      setUpdatingEmpresa(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Gerenciar White Label
          </CardTitle>
          <CardDescription>
            Controle quais empresas podem usar a funcionalidade White Label
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5" />
          Gerenciar White Label
        </CardTitle>
        <CardDescription>
          Controle quais empresas podem usar a funcionalidade White Label
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {empresas?.map((empresa: any) => (
            <div
              key={empresa.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{empresa.name_empresa}</h3>
                  <p className="text-sm text-muted-foreground">ID: {empresa.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge 
                  variant={empresa.whitelabel_enabled ? "default" : "secondary"}
                  className="flex items-center gap-1"
                >
                  {empresa.whitelabel_enabled ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      Habilitado
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Desabilitado
                    </>
                  )}
                </Badge>

                <div className="flex items-center space-x-2">
                  <Switch
                    id={`whitelabel-${empresa.id}`}
                    checked={empresa.whitelabel_enabled || false}
                    onCheckedChange={() => handleToggleWhiteLabel(empresa.id, empresa.whitelabel_enabled)}
                    disabled={updatingEmpresa === empresa.id}
                  />
                  <Label htmlFor={`whitelabel-${empresa.id}`} className="text-sm">
                    {updatingEmpresa === empresa.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "White Label"
                    )}
                  </Label>
                </div>
              </div>
            </div>
          ))}

          {(!empresas || empresas.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma empresa encontrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};