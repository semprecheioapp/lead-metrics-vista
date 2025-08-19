import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeadsFunnel } from "@/hooks/useLeadsStats";

export const FunnelChart = () => {
  const { data } = useLeadsFunnel();
  const funnelData = [
    { label: "Novos Leads", value: data?.novo ?? 0, color: "bg-primary", gradient: "from-primary to-primary/80" },
    { label: "Abordados", value: data?.abordado ?? 0, color: "bg-warning", gradient: "from-warning to-warning/80" },
    { label: "Qualificados", value: data?.qualificado ?? 0, color: "bg-success", gradient: "from-success to-success/80" },
    { label: "Fechados", value: data?.fechado ?? 0, color: "bg-success/90", gradient: "from-success/90 to-success/70" },
  ];
  const maxValue = Math.max(1, ...funnelData.map(stage => stage.value));

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Funil de Conversão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {funnelData.map((stage, index) => {
            const percentage = (stage.value / maxValue) * 100;
            const prev = index > 0 ? funnelData[index - 1].value : null;
            const conversionRate = prev && prev > 0 ? ((stage.value / prev) * 100).toFixed(1) : null;
            
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">{stage.value}</span>
                    {conversionRate && (
                      <span className="text-xs text-muted-foreground">({conversionRate}%)</span>
                    )}
                  </div>
                </div>
                <div className="relative h-10 bg-muted/50 rounded-xl overflow-hidden border border-border/50">
                  <div
                    className={`h-full bg-gradient-to-r ${stage.gradient} transition-all duration-1000 ease-out rounded-xl flex items-center justify-center shadow-lg`}
                    style={{ width: `${percentage}%` }}
                  >
                    <span className="text-white text-sm font-bold drop-shadow-sm">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};