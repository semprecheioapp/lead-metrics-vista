import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  trend = "neutral",
  trendValue,
  className
}: MetricCardProps) => {
  const trendColors = {
    up: "text-success",
    down: "text-danger", 
    neutral: "text-muted-foreground"
  };

  const getCardVariant = (trend: string) => {
    switch (trend) {
      case "up":
        return "border-success/30 bg-gradient-to-br from-card to-success/8 shadow-success-glow/30 hover:shadow-success-glow/50";
      case "down":
        return "border-danger/30 bg-gradient-to-br from-card to-danger/8 shadow-danger-glow/30 hover:shadow-danger-glow/50";
      default:
        return "border-primary/30 bg-gradient-to-br from-card to-primary/8 shadow-corporate-glow/30 hover:shadow-corporate-glow/50";
    }
  };

  const getIconColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-danger";
      default:
        return "text-primary";
    }
  };

  const getIconBg = (trend: string) => {
    switch (trend) {
      case "up":
        return "bg-gradient-to-br from-success/15 to-success/8 border-success/20";
      case "down":
        return "bg-gradient-to-br from-danger/15 to-danger/8 border-danger/20";
      default:
        return "bg-gradient-to-br from-primary/15 to-primary/8 border-primary/20";
    }
  };

  return (
    <Card className={cn(
      "group transition-all duration-300 ease-in-out hover:scale-[1.03] hover:-translate-y-1 border backdrop-blur-sm rounded-xl",
      getCardVariant(trend),
      className
    )}>
      <CardContent className="p-5 sm:p-6 lg:p-7">
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div className={cn(
            "p-3 sm:p-3.5 rounded-xl border flex-shrink-0 shadow-sm transition-all duration-300 group-hover:scale-105",
            getIconBg(trend)
          )}>
            <div className={cn("w-6 h-6 sm:w-7 sm:h-7 transition-colors duration-300", getIconColor(trend))}>
              {icon}
            </div>
          </div>
          {trendValue && (
            <span className={cn(
              "text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full bg-background/70 border whitespace-nowrap ml-3 shadow-sm transition-all duration-300 group-hover:bg-background/90",
              trendColors[trend]
            )}>
              {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
            </span>
          )}
        </div>
        
        <div className="space-y-3 sm:space-y-4 min-w-0">
          <h3 className="text-xs sm:text-sm font-bold text-muted-foreground/90 leading-tight tracking-widest uppercase">
            {title}
          </h3>
          <p className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-foreground break-all leading-none tracking-tighter">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm sm:text-base text-muted-foreground/80 leading-tight font-semibold">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};