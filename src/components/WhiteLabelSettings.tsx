import { useState } from "react";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Upload, Palette, Globe, Image as ImageIcon, Lock, Crown } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const WhiteLabelSettings = () => {
  const { config, updateConfig, isUpdating, hasPermission } = useWhiteLabel();
  const [formData, setFormData] = useState({
    nome_empresa: config.nome_empresa || "",
    titulo_sistema: config.titulo_sistema || "",
    logo_url: config.logo_url || "",
    favicon_url: config.favicon_url || "",
    cor_primaria: config.cor_primaria || "#1e40af",
    cor_secundaria: config.cor_secundaria || "#3b82f6",
    cor_accent: config.cor_accent || "#60a5fa",
    cor_background: config.cor_background || "#0a0f1c"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!hasPermission) {
      toast.error("White Label não está habilitado para sua empresa");
      return;
    }
    updateConfig(formData);
    toast.success("Configurações salvas com sucesso!");
  };

  const handleReset = () => {
    setFormData({
      nome_empresa: config.nome_empresa || "",
      titulo_sistema: config.titulo_sistema || "",
      logo_url: config.logo_url || "",
      favicon_url: config.favicon_url || "",
      cor_primaria: config.cor_primaria || "#1e40af",
      cor_secundaria: config.cor_secundaria || "#3b82f6",
      cor_accent: config.cor_accent || "#60a5fa",
      cor_background: config.cor_background || "#0a0f1c"
    });
    toast.info("Formulário resetado");
  };

  return (
    <div className="space-y-6">
      {!hasPermission && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              <strong>Funcionalidade Premium:</strong> White Label não está habilitado para sua empresa. 
              Entre em contato com o suporte para habilitar esta funcionalidade.
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      <Card className={!hasPermission ? "opacity-50 pointer-events-none" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configurações White Label
            {!hasPermission && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
          <CardDescription>
            Personalize a aparência e identidade visual do seu dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Identidade da Empresa */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              <h3 className="text-lg font-medium">Identidade da Empresa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome_empresa">Nome da Empresa</Label>
                <Input
                  id="nome_empresa"
                  value={formData.nome_empresa}
                  onChange={(e) => handleInputChange("nome_empresa", e.target.value)}
                  placeholder="Dashboard MBK"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="titulo_sistema">Título do Sistema</Label>
                <Input
                  id="titulo_sistema"
                  value={formData.titulo_sistema}
                  onChange={(e) => handleInputChange("titulo_sistema", e.target.value)}
                  placeholder="Dashboard MBK - CRM & IA"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange("logo_url", e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="favicon_url">URL do Favicon</Label>
                <div className="flex gap-2">
                  <Input
                    id="favicon_url"
                    value={formData.favicon_url}
                    onChange={(e) => handleInputChange("favicon_url", e.target.value)}
                    placeholder="https://exemplo.com/favicon.ico"
                  />
                  <Button variant="outline" size="icon">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cores e Temas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <h3 className="text-lg font-medium">Cores e Temas</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cor_primaria">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_primaria"
                    type="color"
                    value={formData.cor_primaria}
                    onChange={(e) => handleInputChange("cor_primaria", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.cor_primaria}
                    onChange={(e) => handleInputChange("cor_primaria", e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cor_secundaria">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_secundaria"
                    type="color"
                    value={formData.cor_secundaria}
                    onChange={(e) => handleInputChange("cor_secundaria", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.cor_secundaria}
                    onChange={(e) => handleInputChange("cor_secundaria", e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cor_accent">Cor de Destaque</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_accent"
                    type="color"
                    value={formData.cor_accent}
                    onChange={(e) => handleInputChange("cor_accent", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.cor_accent}
                    onChange={(e) => handleInputChange("cor_accent", e.target.value)}
                    placeholder="#60a5fa"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cor_background">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="cor_background"
                    type="color"
                    value={formData.cor_background}
                    onChange={(e) => handleInputChange("cor_background", e.target.value)}
                    className="w-12 h-10 p-1 rounded"
                  />
                  <Input
                    value={formData.cor_background}
                    onChange={(e) => handleInputChange("cor_background", e.target.value)}
                    placeholder="#0a0f1c"
                  />
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview das Alterações</h3>
            <div 
              className="p-4 rounded-lg border"
              style={{
                backgroundColor: formData.cor_background,
                borderColor: formData.cor_primaria
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {formData.logo_url && (
                  <img 
                    src={formData.logo_url} 
                    alt="Logo" 
                    className="h-8 w-8 rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <h4 
                  className="font-semibold"
                  style={{ color: formData.cor_primaria }}
                >
                  {formData.nome_empresa || "Nome da Empresa"}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.titulo_sistema || "Título do Sistema"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isUpdating || !hasPermission}
              className="flex-1"
            >
              {isUpdating ? "Salvando..." : "Salvar Configurações"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isUpdating || !hasPermission}
            >
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};