import { useState } from "react";
import { Settings, Users, MessageSquare, BarChart3, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useWhatsAppStats } from "@/hooks/useWhatsAppStats";

export const WhatsAppManager = () => {
  const [activeTab, setActiveTab] = useState("stats");
  const { data: stats, isLoading } = useWhatsAppStats();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Gerenciamento WhatsApp
            </CardTitle>
            <CardDescription>
              Controles avançados e estatísticas de performance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar Dados
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Contatos
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Conversas Ativas</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats?.activeChats || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mensagens Hoje</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats?.messagesToday || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats?.avgResponseTime || '0m'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="default" className="bg-green-500">
                        Conectado
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Atividade Recente</h3>
              <div className="space-y-2">
                {[
                  { time: '10:30', action: 'Nova mensagem de João Silva', type: 'message' },
                  { time: '10:25', action: 'Lead convertido: Maria Santos', type: 'conversion' },
                  { time: '10:20', action: 'Mensagem automatizada enviada', type: 'auto' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Badge variant="outline" className="text-xs">
                      {activity.time}
                    </Badge>
                    <span className="flex-1 text-sm">{activity.action}</span>
                    <Badge 
                      variant={activity.type === 'conversion' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {activity.type === 'message' && 'Mensagem'}
                      {activity.type === 'conversion' && 'Conversão'}
                      {activity.type === 'auto' && 'Automático'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium mb-2">Gerenciamento de Contatos</p>
              <p className="text-sm">
                Funcionalidade em desenvolvimento para gerenciar e organizar seus contatos do WhatsApp
              </p>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-lg font-medium mb-2">Templates de Mensagens</p>
              <p className="text-sm">
                Em breve você poderá criar e gerenciar templates para respostas rápidas
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};