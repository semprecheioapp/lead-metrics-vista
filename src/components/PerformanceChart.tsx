import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemoriaMetrics } from "@/hooks/useMemoriaMetrics";


export const PerformanceChart = () => {
  const { data } = useMemoriaMetrics();
  const chartData = (data?.messagesByDay || []).map(d => ({
    day: d.day,
    leads: d.count,
    conversions: 0,
  }));
  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle>Performance Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" className="opacity-20" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }} 
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickLine={{ stroke: 'hsl(var(--border))' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="hsl(var(--primary))" 
                strokeWidth={4}
                name="Leads"
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, fill: 'hsl(var(--primary))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="conversions" 
                stroke="hsl(var(--success))" 
                strokeWidth={4}
                name="Conversões"
                dot={{ fill: 'hsl(var(--success))', strokeWidth: 3, r: 6 }}
                activeDot={{ r: 8, fill: 'hsl(var(--success))', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};