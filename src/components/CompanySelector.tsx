import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

interface CompanySelectorProps {
  selectedCompanyId?: number | null;
  onCompanyChange: (companyId: number | null) => void;
  showAllOption?: boolean;
}

export const CompanySelector = ({ 
  selectedCompanyId, 
  onCompanyChange, 
  showAllOption = true 
}: CompanySelectorProps) => {
  const { data: companies, isLoading } = useQuery({
    queryKey: ["companies-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, name_empresa, ativo, plano")
        .order("name_empresa");
      
      if (error) throw error;
      return data;
    },
  });

  const handleValueChange = (value: string) => {
    if (value === "all") {
      onCompanyChange(null);
    } else {
      onCompanyChange(parseInt(value));
    }
  };

  const selectedCompany = companies?.find(c => c.id === selectedCompanyId);

  return (
    <div className="flex items-center gap-3">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedCompanyId ? selectedCompanyId.toString() : "all"}
        onValueChange={handleValueChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Selecione uma empresa" />
        </SelectTrigger>
        <SelectContent>
          {showAllOption && (
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <span>Todas as Empresas</span>
                <Badge variant="outline" className="text-xs">
                  {companies?.length || 0}
                </Badge>
              </div>
            </SelectItem>
          )}
          {companies?.map((company) => (
            <SelectItem key={company.id} value={company.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{company.name_empresa}</span>
                <Badge 
                  variant={company.ativo ? "default" : "secondary"}
                  className="text-xs"
                >
                  {company.ativo ? "Ativa" : "Inativa"}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {company.plano}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedCompany && (
        <div className="flex items-center gap-2">
          <Badge 
            variant={selectedCompany.ativo ? "default" : "secondary"}
            className="text-xs"
          >
            {selectedCompany.ativo ? "Ativa" : "Inativa"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {selectedCompany.plano}
          </Badge>
        </div>
      )}
    </div>
  );
};