import { ReactNode } from "react";
import { useHasPermission } from "@/hooks/useUserPermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

interface PermissionGuardProps {
  requiredScopes: string[];
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}

export const PermissionGuard = ({ 
  requiredScopes, 
  children, 
  fallback,
  showAlert = true 
}: PermissionGuardProps) => {
  const hasPermission = useHasPermission(requiredScopes);

  if (!hasPermission) {
    if (fallback) return <>{fallback}</>;
    
    if (showAlert) {
      return (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Você não tem permissão para acessar este recurso. 
            Entre em contato com o administrador para solicitar acesso.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  }

  return <>{children}</>;
};