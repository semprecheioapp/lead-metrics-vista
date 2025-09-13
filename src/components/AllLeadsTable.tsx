import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLeadsOptimized } from "@/hooks/useLeadsOptimized";
import { useBulkDeleteContacts } from "@/hooks/useDeleteContact";
import { useDeleteContact } from "@/hooks/useDeleteContact";
import { BulkActionsBar } from "./BulkActionsBar";
import { toast } from "sonner";
import { Trash2, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const AllLeadsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [originFilter, setOriginFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const { data: leadsData, isLoading } = useLeadsOptimized({
    page: currentPage,
    limit: 20,
    search: searchTerm,
    stage: statusFilter ? parseInt(statusFilter) : undefined,
    dateRange: undefined
  });

  const { bulkDelete, isDeleting } = useBulkDeleteContacts();
  const { deleteContact, isDeleting: isDeletingSingle } = useDeleteContact();

  const leads = Array.isArray(leadsData) ? [] : (leadsData?.leads || []);
  const totalLeads = Array.isArray(leadsData) ? 0 : (leadsData?.total || 0);
  const totalPages = Math.ceil(totalLeads / 20);

  // Reset selections when page changes or filters change
  useEffect(() => {
    setSelectedLeads(new Set());
  }, [currentPage, searchTerm, statusFilter, originFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentPageLeadIds = new Set(leads.map(lead => lead.id));
      setSelectedLeads(currentPageLeadIds);
    } else {
      setSelectedLeads(new Set());
    }
  };

  const handleSelectLead = (leadId: number, checked: boolean) => {
    const newSelected = new Set(selectedLeads);
    if (checked) {
      newSelected.add(leadId);
    } else {
      newSelected.delete(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;

    const phoneNumbers = leads
      .filter(lead => selectedLeads.has(lead.id))
      .map(lead => lead.phone)
      .filter(phone => phone && phone !== "-");

    if (phoneNumbers.length === 0) {
      toast.error("Nenhum lead válido selecionado para exclusão");
      return;
    }

    try {
      await bulkDelete({ phoneNumbers });
      toast.success(`${phoneNumbers.length} leads excluídos com sucesso`);
      setSelectedLeads(new Set());
    } catch (error) {
      toast.error("Erro ao excluir leads selecionados");
    }
  };

  const handleDeleteSingle = async (phone: string) => {
    if (!phone || phone === "-") {
      toast.error("Telefone inválido para exclusão");
      return;
    }

    try {
      await deleteContact({ phoneNumber: phone });
      toast.success("Lead excluído com sucesso");
    } catch (error) {
      toast.error("Erro ao excluir lead");
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Novo": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Abordado": return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      case "Qualificado": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Fechado": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const isAllSelected = leads.length > 0 && leads.every(lead => selectedLeads.has(lead.id));
  const isIndeterminate = selectedLeads.size > 0 && selectedLeads.size < leads.length;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-card">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Abordado">Abordado</SelectItem>
                  <SelectItem value="Qualificado">Qualificado</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Origem</label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as origens" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as origens</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedLeads.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedLeads.size}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedLeads(new Set())}
          isDeleting={isDeleting}
        />
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Todos os Leads ({totalLeads})</span>
            {leads.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                />
                <span className="text-sm text-muted-foreground">
                  Selecionar todos desta página
                </span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        className={isIndeterminate ? "data-[state=indeterminate]:bg-primary" : ""}
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Qualificação</TableHead>
                    <TableHead>Origem</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow 
                      key={lead.id}
                      className={cn(
                        "hover:bg-muted/50",
                        selectedLeads.has(lead.id) && "bg-muted/30"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedLeads.has(lead.id)}
                          onCheckedChange={(checked) => 
                            handleSelectLead(lead.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>
                        <Badge className={getStageColor(lead.stage)}>
                          {lead.stage}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {lead.qualification}
                      </TableCell>
                      <TableCell className="capitalize">whatsapp</TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSingle(lead.phone)}
                            disabled={isDeletingSingle || !lead.phone || lead.phone === "-"}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} ({totalLeads} leads total)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};