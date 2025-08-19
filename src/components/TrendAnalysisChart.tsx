
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useCombinedMetrics } from "@/hooks/useAdvancedMetrics";
import { TrendingUp, BarChart3 } from "lucide-react";

export const TrendAnalysisChart = () => {
  const { data: metrics, isLoading } = useCombinedMetrics();

  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análise de Tendências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-muted animate-pulse rounded-lg"></div>
        </CardContent>
      </Card>
    );
  }

  const chartData = metrics.trendsData.map(item => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    }),
    conversas: item.conversations,
    leads: item.leads,
    conversoes: item.conversions,
  }));

  const hasData = chartData.some(item => item.conversas > 0 || item.leads > 0 || item.conversoes > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise de Tendências (30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval="preserveStartEnd"
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  const labels = {
                    conversas: 'Conversas',
                    leads: 'Leads',
                    conversoes: 'Conversões'
                  };
                  return [value, labels[name as keyof typeof labels] || name];
                }}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="conversas" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="conversas"
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--hyperia-purple))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="leads"
              />
              <Line 
                type="monotone" 
                dataKey="conversoes" 
                stroke="hsl(var(--hyperia-blue))" 
                strokeWidth={2}
                dot={{ r: 4 }}
                name="conversoes"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum dado disponível</h3>
              <p>Ainda não há dados suficientes para mostrar tendências dos últimos 30 dias.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
