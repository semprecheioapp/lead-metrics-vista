import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Building, MessageSquare, Clock, Shield, Save, RefreshCw, Send, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConfiguracoesEmpresa } from "@/hooks/useConfiguracoesEmpresa";
import { useFollowupConfig } from "@/hooks/useFollowupConfig";
import { toast } from "@/hooks/use-toast";
import { AgentManagementSection } from "@/components/agents/AgentManagementSection";

export default function Configuracoes() {
  const { empresaData } = useAuth();
  const { data: configData, isLoading, updateConfig } = useConfiguracoesEmpresa();
  const { config: followupConfig, updateConfig: updateFollowupConfig, isUpdating: isUpdatingFollowup } = useFollowupConfig();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Dados da empresa
    nomeEmpresa: empresaData?.name_empresa || '',
    emailEmpresa: empresaData?.email || '',
    telefoneEmpresa: empresaData?.telefone || '',
    
    // Configurações operacionais
    autoResposta: configData?.auto_resposta ?? true,
    mensagemForaHorario: configData?.mensagem_fora_horario || '',
    promptSistema: configData?.prompt_sistema || '',
    apiWhatsapp: configData?.api_whatsapp || '',
    webhookUrl: configData?.webhook_url || '',
    
    // Horário de funcionamento
    horarioInicio: '09:00',
    horarioFim: '18:00',
    diasFuncionamento: ['segunda', 'terca', 'quarta', 'quinta', 'sexta'],
    
  });

  const handleSave = async (section: string) => {
    setSaving(true);
    try {
      if (section === 'empresa') {
        // Aqui seria a lógica para atualizar dados da empresa
        toast({
          title: "Sucesso",
          description: "Dados da empresa atualizados com sucesso!",
        });
      } else if (section === 'seguranca') {
        toast({
          title: "Sucesso", 
          description: "Configurações de segurança atualizadas com sucesso!",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações da sua empresa e sistema</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Restaurar Padrões
            </Button>
          </div>
        </div>

        <Tabs defaultValue="empresa" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="empresa" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Empresa
            </TabsTrigger>
            <TabsTrigger value="agentes" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="followup" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Follow-up
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Configurações da Empresa */}
          <TabsContent value="empresa">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Dados da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                    <Input
                      id="nomeEmpresa"
                      value={formData.nomeEmpresa}
                      onChange={(e) => setFormData({...formData, nomeEmpresa: e.target.value})}
                      placeholder="Digite o nome da empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailEmpresa">Email Corporativo</Label>
                    <Input
                      id="emailEmpresa"
                      type="email"
                      value={formData.emailEmpresa}
                      onChange={(e) => setFormData({...formData, emailEmpresa: e.target.value})}
                      placeholder="contato@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefoneEmpresa">Telefone</Label>
                    <Input
                      id="telefoneEmpresa"
                      value={formData.telefoneEmpresa}
                      onChange={(e) => setFormData({...formData, telefoneEmpresa: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planoAtual">Plano Atual</Label>
                    <Input
                      id="planoAtual"
                      value={empresaData?.plano || 'Free'}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('empresa')}
                    disabled={saving}
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gestão de Agentes */}
          <TabsContent value="agentes">
            <AgentManagementSection />
          </TabsContent>

          {/* Configurações de Follow-up */}
          <TabsContent value="followup">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Configurações de Follow-up
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tempo_abandono">Tempo para considerar abandonado (dias)</Label>
                    <Select 
                      value={followupConfig?.tempo_abandono_dias?.toString() || "3"}
                      onValueChange={(value) => updateFollowupConfig({ tempo_abandono_dias: Number(value) })}
                      disabled={isUpdatingFollowup}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 dia</SelectItem>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="7">7 dias</SelectItem>
                        <SelectItem value="15">15 dias</SelectItem>
                        <SelectItem value="30">30 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto_followup">Follow-up automático</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto_followup"
                        checked={followupConfig?.auto_followup_enabled || false}
                        onCheckedChange={(checked) => updateFollowupConfig({ auto_followup_enabled: checked })}
                        disabled={isUpdatingFollowup}
                      />
                      <Label htmlFor="auto_followup" className="text-sm">
                        Ativar follow-up automático
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_followup">Template de Mensagem de Follow-up</Label>
                  <Textarea
                    id="template_followup"
                    placeholder="Olá {nome}, notamos que você demonstrou interesse..."
                    value={followupConfig?.template_followup || ""}
                    onChange={(e) => updateFollowupConfig({ template_followup: e.target.value })}
                    disabled={isUpdatingFollowup}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {"{nome}"} para inserir automaticamente o nome do lead na mensagem.
                  </p>
                </div>

                <Button 
                  onClick={() => {
                    toast({
                      title: "Configurações salvas",
                      description: "As configurações de follow-up foram atualizadas com sucesso.",
                    });
                  }}
                  disabled={isUpdatingFollowup}
                >
                  {isUpdatingFollowup ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configurações de Segurança */}
          <TabsContent value="seguranca">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="limiteLeads">Limite de Leads</Label>
                    <Input
                      id="limiteLeads"
                      type="number"
                      value={empresaData?.limite_leads || 1000}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">Limite atual do seu plano</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limiteMensagens">Limite de Mensagens</Label>
                    <Input
                      id="limiteMensagens"
                      type="number"
                      value={empresaData?.limite_mensagens || 10000}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">Limite atual do seu plano</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Configurações de Acesso</Label>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Logs de Auditoria</p>
                        <p className="text-sm text-muted-foreground">Registrar todas as ações dos usuários</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Notificações de Segurança</p>
                        <p className="text-sm text-muted-foreground">Alertas sobre tentativas de acesso suspeitas</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">Backup Automático</p>
                        <p className="text-sm text-muted-foreground">Backup diário das configurações</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleSave('seguranca')}
                    disabled={saving}
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}