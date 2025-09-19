import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, TrendingUp, MessageSquare, Users, Lightbulb, RefreshCw, Target, AlertTriangle, CheckCircle2, Calendar, BarChart3, Zap, Award, TrendingDown, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRangePicker, DateRange } from "@/components/DateRangePicker";

interface AIInsight {
  id: string;
  analysis_type: string;
  insights: any;
  metadata: any;
  created_at: string;
}

export const AIInsightsDashboard = () => {
  const { empresaId } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [activeTab, setActiveTab] = useState("conversations");
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const promptTemplates = {
    custom: "",
    conversation_analysis: `Analise as conversas de atendimento ao cliente do meu ${empresaId === 1 ? 'salão de beleza' : 'negócio'} e me forneça insights sobre:
1. Sentimento geral dos clientes (positivo, neutro, negativo)
2. Principais dúvidas e necessidades dos clientes
3. Qualidade do atendimento prestado
4. Oportunidades de melhoria no atendimento
5. Sugestões para aumentar a satisfação dos clientes

Forneça uma análise prática e actionável em JSON com as chaves: sentiment, main_topics, service_quality, improvement_opportunities, recommendations.`,
    
    lead_analysis: `Analise os leads do meu ${empresaId === 1 ? 'salão de beleza' : 'negócio'} e me forneça insights sobre:
1. Perfil dos leads mais qualificados
2. Padrões de conversão e comportamento
3. Horários e períodos de maior interesse
4. Principais objeções ou barreiras
5. Estratégias para melhorar a conversão

Forneça uma análise estratégica em JSON com as chaves: lead_profile, conversion_patterns, best_times, common_objections, conversion_strategies.`,
    
    business_insights: `Como especialista em análise de negócios, analise os dados do meu ${empresaId === 1 ? 'salão de beleza' : 'negócio'} e me ajude a:
1. Identificar oportunidades de crescimento
2. Otimizar processos e atendimento
3. Entender melhor meu público-alvo
4. Criar estratégias para aumentar vendas
5. Melhorar a experiência do cliente

Seja específico e prático nas recomendações, em JSON com as chaves: growth_opportunities, process_optimization, target_audience, sales_strategies, customer_experience.`
  };

  useEffect(() => {
    loadInsights();
  }, [empresaId]);

  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template);
    if (template !== 'custom') {
      setCustomPrompt(promptTemplates[template as keyof typeof promptTemplates] || "");
    }
  };

  const runAnalysis = async (type: 'conversation' | 'leads') => {
    if (!empresaId) return;

    const promptToUse = selectedTemplate === 'custom' ? customPrompt : promptTemplates[selectedTemplate === 'conversation_analysis' || selectedTemplate === 'lead_analysis' || selectedTemplate === 'business_insights' ? selectedTemplate : 'custom'];
    
    if (!promptToUse.trim()) {
      toast({
        title: "Prompt necessário",
        description: "Por favor, escreva um prompt ou selecione um template para a análise.",
        variant: "destructive",
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Período necessário",
        description: "Por favor, selecione um período para a análise.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const requestBody = { 
        empresaId: empresaId,
        analysisType: type,
        customPrompt: promptToUse,
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString(),
        periodType: getPeriodType(dateRange.from, dateRange.to)
      };
      
      console.log('Enviando para edge function:', requestBody);
      
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: requestBody
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Análise Concluída",
          description: `Análise de ${type === 'conversation' ? 'conversas' : 'leads'} gerada com sucesso!`,
        });
        
        console.log('Dados recebidos da edge function:', data);
        
        // Processar a resposta do webhook - agora já vem estruturada
        let processedAnalysis = data.analysis;
        
        // Se a análise tem resumo e recomendações, usar diretamente
        if (processedAnalysis && typeof processedAnalysis === 'object') {
          // Se já tem a estrutura esperada, usar diretamente
          if (processedAnalysis.resumo || processedAnalysis.recomendacoes || processedAnalysis.analise_completa) {
            // Análise já estruturada, usar como está
          } else if (processedAnalysis.raw_analysis) {
            // Caso ainda venha no formato antigo, estruturar
            const analysisText = processedAnalysis.raw_analysis?.analysis || processedAnalysis.analysis || 'Análise não disponível';
            
            processedAnalysis = {
              resumo: "Análise Baseada nas Conversas",
              analise_completa: analysisText,
              insights: [analysisText],
              recomendacoes: [
                "Análise gerada pelo sistema de IA",
                "Baseada nos dados das conversas do período selecionado"
              ]
            };
          }
        } else if (typeof processedAnalysis === 'string') {
          // Se veio como string, estruturar
          processedAnalysis = {
            resumo: "Análise de IA",
            analise_completa: processedAnalysis,
            recomendacoes: [
              "Análise processada com sucesso",
              "Revisar os insights gerados pela IA"
            ]
          };
        }
        
        const newInsight: AIInsight = {
          id: Date.now().toString(),
          analysis_type: type,
          insights: processedAnalysis,
          metadata: { 
            analysis_date: new Date().toISOString(),
            period: dateRange ? formatDateLabel(dateRange.from!, dateRange.to!) : 'Período não especificado'
          },
          created_at: new Date().toISOString()
        };
        
        setInsights(prev => [newInsight, ...prev]);
      } else {
        throw new Error(data?.error || 'Erro na análise');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro na Análise",
        description: error instanceof Error ? error.message : "Erro ao gerar análise",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadInsights = async () => {
    if (!empresaId) return;
    // Não precisa carregar histórico - as análises são exibidas diretamente após processamento
    setInsights([]);
  };

  const getPeriodType = (from: Date, to: Date): string => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    if (diffDays <= 14) return 'biweekly';
    if (diffDays <= 31) return 'monthly';
    return 'custom';
  };

  const formatDateLabel = (from: Date, to: Date): string => {
    const diffTime = Math.abs(to.getTime() - from.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'Hoje';
    if (diffDays <= 7) return 'Últimos 7 dias';
    if (diffDays <= 14) return 'Últimas 2 semanas';
    if (diffDays <= 31) return 'Último mês';
    return `${from.toLocaleDateString('pt-BR')} - ${to.toLocaleDateString('pt-BR')}`;
  };

  const renderMetricCard = (title: string, value: string | number, icon: React.ReactNode, color: string) => (
    <div className={`p-4 rounded-lg border bg-gradient-to-br ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-background/80">
          {icon}
        </div>
      </div>
    </div>
  );

  const renderInsightSection = (title: string, items: string[] | any[], icon: React.ReactNode, color: string) => {
    if (!items || (Array.isArray(items) && items.length === 0)) return null;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className={`text-lg flex items-center gap-2 ${color}`}>
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.isArray(items) ? (
              items.map((item: string | any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-muted">
                  <div className={`w-2 h-2 rounded-full mt-2 ${color.replace('text-', 'bg-')}`}></div>
                  <p className="text-sm leading-relaxed flex-1">
                    {typeof item === 'object' ? 
                      (item.tema || item.topico || item.title || JSON.stringify(item)) : 
                      String(item)
                    }
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-muted/30 border border-muted">
                <p className="text-sm leading-relaxed">{String(items)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderSentimentAnalysis = (sentiment: any) => {
    if (!sentiment || typeof sentiment !== 'object') return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
            <BarChart3 className="w-5 h-5" />
            Análise de Sentimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20 backdrop-blur-sm">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-success" />
              <p className="text-sm font-medium text-success">Positivo</p>
              <p className="text-2xl font-bold text-success">{sentiment.positivo || sentiment.positive || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-warning/10 border border-warning/20 backdrop-blur-sm">
              <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
              <p className="text-sm font-medium text-warning">Neutro</p>
              <p className="text-2xl font-bold text-warning">{sentiment.neutro || sentiment.neutral || 0}</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-danger/10 border border-danger/20 backdrop-blur-sm">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-danger" />
              <p className="text-sm font-medium text-danger">Negativo</p>
              <p className="text-2xl font-bold text-danger">{sentiment.negativo || sentiment.negative || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderAnalysisContent = (analysis: any) => {
    console.log('Renderizando análise:', analysis);

    if (!analysis || typeof analysis !== 'object') {
      return (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Análise não disponível</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Resumo Executivo */}
        {analysis.resumo && (
          <Card className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Award className="w-5 h-5" />
                📊 Resumo Executivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{analysis.resumo}</p>
            </CardContent>
          </Card>
        )}

        {/* Análise Completa da IA */}
        {analysis.analise_completa && (
          <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                <Brain className="w-5 h-5" />
                🤖 Análise da IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{analysis.analise_completa}</p>
            </CardContent>
          </Card>
        )}

        {/* Métricas Importantes */}
        {analysis.metricas && typeof analysis.metricas === 'object' && (
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-600">
                <TrendingUp className="w-5 h-5" />
                📈 Métricas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysis.metricas).map(([key, value]) => 
                  renderMetricCard(
                    key.replace('_', ' ').toUpperCase(),
                    String(value),
                    <BarChart3 className="w-4 h-4" />,
                    "from-primary/10 to-primary/20 border-primary/20"
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Análise de Sentimento */}
        {analysis.sentimento && renderSentimentAnalysis(analysis.sentimento)}

        {/* Insights Principais */}
        {analysis.insights && renderInsightSection(
          "💡 Principais Insights",
          Array.isArray(analysis.insights) ? analysis.insights : [analysis.insights],
          <Lightbulb className="w-5 h-5" />,
          "text-amber-600"
        )}

        {/* Recomendações */}
        {analysis.recomendacoes && renderInsightSection(
          "🎯 Recomendações",
          Array.isArray(analysis.recomendacoes) ? analysis.recomendacoes : [analysis.recomendacoes],
          <Target className="w-5 h-5" />,
          "text-green-600"
        )}

        {/* Problemas Identificados */}
        {analysis.problemas_identificados && renderInsightSection(
          "⚠️ Problemas Identificados",
          Array.isArray(analysis.problemas_identificados) ? analysis.problemas_identificados : [analysis.problemas_identificados],
          <AlertTriangle className="w-5 h-5" />,
          "text-red-600"
        )}

        {/* Temas Principais */}
        {analysis.temas_principais && renderInsightSection(
          "🏷️ Temas Principais",
          Array.isArray(analysis.temas_principais) ? analysis.temas_principais : [analysis.temas_principais],
          <MessageSquare className="w-5 h-5" />,
          "text-purple-600"
        )}

        {/* Oportunidades de Crescimento */}
        {analysis.growth_opportunities && renderInsightSection(
          "🚀 Oportunidades de Crescimento",
          Array.isArray(analysis.growth_opportunities) ? analysis.growth_opportunities : [analysis.growth_opportunities],
          <TrendingUp className="w-5 h-5" />,
          "text-emerald-600"
        )}

        {/* Estratégias de Conversão */}
        {analysis.conversion_strategies && renderInsightSection(
          "💰 Estratégias de Conversão",
          Array.isArray(analysis.conversion_strategies) ? analysis.conversion_strategies : [analysis.conversion_strategies],
          <Zap className="w-5 h-5" />,
          "text-orange-600"
        )}

        {/* Renderizar campos dinâmicos */}
        {Object.entries(analysis)
          .filter(([key]) => ![
            'resumo', 'insights', 'metricas', 'recomendacoes', 'problemas_identificados', 
            'sentimento', 'temas_principais', 'growth_opportunities', 'conversion_strategies',
            'analise_completa'
          ].includes(key))
          .map(([key, value]) => {
            if (!value) return null;
            
            return renderInsightSection(
              `📋 ${key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
              Array.isArray(value) ? value : [value],
              <Brain className="w-5 h-5" />,
              "text-slate-600"
            );
          })}
      </div>
    );
  };

  const renderInsightCard = (insight: AIInsight) => {
    const isConversation = insight.analysis_type === 'conversation';

    return (
      <div key={insight.id} className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isConversation ? 'bg-blue-100 dark:bg-blue-900/20' : 'bg-green-100 dark:bg-green-900/20'}`}>
              {isConversation ? (
                <MessageSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Users className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {isConversation ? 'Análise de Conversas' : 'Análise de Leads'}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(insight.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Concluída
          </Badge>
        </div>

        <ScrollArea className="max-h-[600px]">
          {renderAnalysisContent(insight.insights)}
        </ScrollArea>

        <Separator className="my-6" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Insights de IA
          </h2>
          <p className="text-muted-foreground">
            Análise inteligente de conversas e leads
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <DateRangePicker 
            value={dateRange} 
            onChange={setDateRange}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => runAnalysis('conversation')}
              disabled={isAnalyzing || !dateRange}
              variant="outline"
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="w-4 h-4 mr-2" />
              )}
              Analisar Conversas
            </Button>
            
            <Button
              onClick={() => runAnalysis('leads')}
              disabled={isAnalyzing || !dateRange}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Analisar Leads
            </Button>
          </div>
        </div>
      </div>

      {/* Status do período selecionado */}
      {dateRange && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary">
                Período selecionado: {formatDateLabel(dateRange.from, dateRange.to)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Configuration Section */}
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <h3 className="text-lg font-semibold">Configure sua Análise de IA</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-2 block">Template de Análise:</label>
            <select 
              value={selectedTemplate} 
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value="custom">Prompt Personalizado</option>
              <option value="conversation_analysis">Análise de Conversas</option>
              <option value="lead_analysis">Análise de Leads</option>
              <option value="business_insights">Insights de Negócio</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Prompt para a IA:
              <span className="text-muted-foreground ml-1">(Descreva como você quer que a IA analise seus dados)</span>
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ex: Analise minhas conversas e me diga quais são os serviços mais procurados e como posso melhorar o atendimento..."
              className="w-full p-3 border rounded-md bg-background min-h-[120px] resize-y"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="conversations">Conversas</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations" className="mt-6">
          <div>
            {insights
              .filter(insight => insight.analysis_type === 'conversation')
              .map(renderInsightCard)}
            
            {insights.filter(insight => insight.analysis_type === 'conversation').length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma análise de conversas encontrada. 
                    Clique em "Analisar Conversas" para gerar insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="mt-6">
          <div>
            {insights
              .filter(insight => insight.analysis_type === 'leads')
              .map(renderInsightCard)}
            
            {insights.filter(insight => insight.analysis_type === 'leads').length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma análise de leads encontrada. 
                    Clique em "Analisar Leads" para gerar insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div>
            {insights.map(renderInsightCard)}
            
            {insights.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Nenhuma análise encontrada. Use os botões acima para gerar insights com IA.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
