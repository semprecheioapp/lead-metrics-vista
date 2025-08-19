import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentLimitBadgeProps {
  used: number;
  limit: number | null;
  className?: string;
  showIcon?: boolean;
}

export const AgentLimitBadge = ({ used, limit, className, showIcon = true }: AgentLimitBadgeProps) => {
  const percentage = limit ? (used / limit) * 100 : 0;
  const isNearLimit = limit && percentage >= 80;
  const isAtLimit = limit && used >= limit;

  const getVariant = () => {
    if (isAtLimit) return "destructive";
    if (isNearLimit) return "outline";
    return "secondary";
  };

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="h-3 w-3" />;
    if (isNearLimit) return <AlertTriangle className="h-3 w-3" />;
    return <CheckCircle2 className="h-3 w-3" />;
  };

  const getText = () => {
    if (limit === null) return `${used} agentes`;
    return `${used}/${limit} agentes`;
  };

  return (
    <Badge 
      variant={getVariant()} 
      className={cn("gap-1", className)}
    >
      {showIcon && getIcon()}
      {getText()}
    </Badge>
  );
};