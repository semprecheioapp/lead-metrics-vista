import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/DashboardLayout';
import { SuperAdminLeadsImport } from '@/components/SuperAdminLeadsImport';
import { SuperAdminMemoriaImport } from '@/components/SuperAdminMemoriaImport';
import { ClientInvite } from '@/components/ClientInvite';
import { MetricCard } from '@/components/MetricCard';
import { CompanySelector } from '@/components/CompanySelector';
import { DateRangePicker, DateRange } from '@/components/DateRangePicker';
import { CompanyManagement } from '@/components/CompanyManagement';
import { useSuperAdminControls } from '@/hooks/useSuperAdminControls';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Building2, Users, Database, FileText, TrendingUp, MessageSquare, UserPlus, Shield, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAllEmpresas } from '@/hooks/useAllEmpresas';
import { WhiteLabelManagement } from '@/components/WhiteLabelManagement';
import { endOfDay, startOfDay, subDays } from 'date-fns';

export default function SuperAdminDashboard() {
  const { user, userProfile } = useAuth();
  
  // Estado para filtros
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 30)),
    to: endOfDay(new Date())
  });

  // Verificar se o usuário é super admin
  const isSuperAdmin = user?.email === 'agenciambkautomacoes@gmail.com';

  // Hooks para controles super admin
  const { 
    companyMetrics, 
    companyList, 
    isLoading: superAdminLoading 
  } = useSuperAdminControls(selectedCompanyId, dateRange);
  
  const { data: allEmpresas } = useAllEmpresas();
  const [selectedCompanyForAgents, setSelectedCompanyForAgents] = useState<number | null>(null);
  const [newAgentLimit, setNewAgentLimit] = useState<string>('');

  // Buscar estatísticas gerais do sistema
  const { data: systemStats } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async () => {
      const [empresasResult, leadsResult, memoriaResult] = await Promise.all([
        supabase.from('empresas').select('id', { count: 'exact' }),
        supabase.from('novos_leads').select('id', { count: 'exact' }),
        supabase.from('memoria_ai').select('id', { count: 'exact' })
      ]);

      return {
        totalEmpresas: empresasResult.count || 0,
        totalLeads: leadsResult.count || 0,
        totalConversas: memoriaResult.count || 0
      };
    },
    enabled: isSuperAdmin,
  });

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acesso Negado</h2>
            <p className="text-muted-foreground">
              Você não tem permissão para acessar o painel de Super Admin.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Painel Super Admin
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Olá, {userProfile?.nome || user?.email} - Controle total do sistema
              </p>
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 p-3 sm:p-4 border rounded-lg bg-card">
            <div className="flex-1 min-w-0">
              <CompanySelector
                selectedCompanyId={selectedCompanyId}
                onCompanyChange={setSelectedCompanyId}
                showAllOption={true}
              />
            </div>
            <div className="flex-1 min-w-0">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 sm:px-4">Visão Geral</TabsTrigger>
            <TabsTrigger value="companies" className="text-xs sm:text-sm px-2 sm:px-4">Empresas</TabsTrigger>
            <TabsTrigger value="agents" className="text-xs sm:text-sm px-2 sm:px-4">Agentes</TabsTrigger>
            <TabsTrigger value="whitelabel" className="text-xs sm:text-sm px-2 sm:px-4">White Label</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4">Analytics</TabsTrigger>
            <TabsTrigger value="tools" className="text-xs sm:text-sm px-2 sm:px-4">Ferramentas</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Métricas Gerais do Sistema */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard
                title="Total de Empresas"
                value={systemStats?.totalEmpresas?.toString() || "0"}
                subtitle="empresas cadastradas"
                icon={<Building2 className="h-4 w-4" />}
                trend="neutral"
                className="text-center sm:text-left"
              />
              <MetricCard
                title="Total de Leads"
                value={systemStats?.totalLeads?.toString() || "0"}
                subtitle="leads no sistema"
                icon={<Users className="h-4 w-4" />}
                trend="neutral"
                className="text-center sm:text-left"
              />
              <MetricCard
                title="Total de Conversas"
                value={systemStats?.totalConversas?.toString() || "0"}
                subtitle="conversas registradas"
                icon={<Database className="h-4 w-4" />}
                trend="neutral"
                className="text-center sm:text-left sm:col-span-2 lg:col-span-1"
              />
            </div>

            {/* Métricas Filtradas */}
            {(selectedCompanyId || !selectedCompanyId) && (
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title="Sessões Únicas"
                  value={companyMetrics?.totalSessions?.toString() || "0"}
                  subtitle="no período selecionado"
                  icon={<MessageSquare className="h-4 w-4" />}
                  trend="neutral"
                  className="text-center sm:text-left"
                />
                <MetricCard
                  title="Leads Gerados"
                  value={companyMetrics?.totalLeads?.toString() || "0"}
                  subtitle="no período"
                  icon={<Users className="h-4 w-4" />}
                  trend="neutral"
                  className="text-center sm:text-left"
                />
                <MetricCard
                  title="Leads Qualificados"
                  value={companyMetrics?.qualifiedLeads?.toString() || "0"}
                  subtitle="no período"
                  icon={<TrendingUp className="h-4 w-4" />}
                  trend="up"
                  className="text-center sm:text-left"
                />
                <MetricCard
                  title="Total de Logs"
                  value={companyMetrics?.totalLogs?.toString() || "0"}
                  subtitle="erros registrados"
                  icon={<FileText className="h-4 w-4" />}
                  trend="neutral"
                  className="text-center sm:text-left"
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Gestão de Limites de Agentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company-select">Selecionar Empresa</Label>
                    <select
                      id="company-select"
                      className="w-full p-2 border rounded-md"
                      value={selectedCompanyForAgents || ''}
                      onChange={(e) => setSelectedCompanyForAgents(e.target.value ? Number(e.target.value) : null)}
                    >
                      <option value="">Selecione uma empresa</option>
                      {allEmpresas?.map((empresa) => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.name_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-limit">Novo Limite de Agentes</Label>
                    <Input
                      id="agent-limit"
                      type="number"
                      placeholder="Ex: 5"
                      value={newAgentLimit}
                      onChange={(e) => setNewAgentLimit(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Deixe em branco para limite ilimitado
                    </p>
                  </div>
                </div>
                
                <Button 
                  onClick={async () => {
                    if (!selectedCompanyForAgents) return;
                    
                    try {
                      const { error } = await supabase
                        .from('empresas')
                        .update({ 
                          max_agents: newAgentLimit ? Number(newAgentLimit) : null 
                        })
                        .eq('id', selectedCompanyForAgents);
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Sucesso",
                        description: "Limite de agentes atualizado com sucesso!",
                      });
                      
                      setNewAgentLimit('');
                      setSelectedCompanyForAgents(null);
                    } catch (error: any) {
                      toast({
                        title: "Erro",
                        description: error.message || "Erro ao atualizar limite",
                        variant: "destructive",
                      });
                    }
                  }}
                  disabled={!selectedCompanyForAgents}
                  className="w-full md:w-auto"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Atualizar Limite
                </Button>
              </CardContent>
            </Card>

            {/* Lista de empresas com seus limites atuais */}
            <Card>
              <CardHeader>
                <CardTitle>Limites Atuais por Empresa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                   {allEmpresas?.map((empresa) => {
                     const empresaData = companyList?.empresas?.find(c => c.id === empresa.id);
                    return (
                      <div key={empresa.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{empresa.name_empresa}</h4>
                          <p className="text-sm text-muted-foreground">
                            ID: {empresa.id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            Limite: {empresaData?.max_agents || 'Ilimitado'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Status: {empresaData?.ativo ? 'Ativo' : 'Inativo'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="whitelabel" className="space-y-6">
            <WhiteLabelManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Comparativo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground text-center py-8">
                  Gráficos comparativos serão implementados em breve
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 sm:space-y-6">
            {/* Ferramentas de Importação */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 xl:grid-cols-2">
              <ClientInvite />
              <SuperAdminLeadsImport />
              <SuperAdminMemoriaImport />
            </div>

            {/* Informações Importantes */}
            <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                Instruções Importantes
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p>• <strong>Importação de Leads:</strong> Selecione a empresa de destino e faça upload do CSV com as colunas: name/nome, number/telefone, qualificacao/status</p>
                <p>• <strong>Importação de Conversas:</strong> CSV com colunas "session_id", "type" (human/ai), "content" (mensagem), "data_atual" (YYYY-MM-DD)</p>
                <p>• <strong>Acesso:</strong> Como super admin, você tem acesso total a todos os dados de todas as empresas</p>
                <p>• <strong>Responsabilidade:</strong> Use essas ferramentas com cuidado, pois afetam diretamente os dados das empresas clientes</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}