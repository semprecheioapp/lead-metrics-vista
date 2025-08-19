
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, Filter } from "lucide-react";
import { DateRangePicker, DateRange } from "@/components/DateRangePicker";
import { Badge } from "@/components/ui/badge";

interface AgendamentosFiltersProps {
  dateRange: DateRange | undefined;
  selectedDates?: Date[];
  onDateRangeChange: (range: DateRange | undefined) => void;
  onSelectedDatesChange?: (dates: Date[]) => void;
  viewMode: "table" | "kanban";
  onViewModeChange: (mode: "table" | "kanban") => void;
  totalCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
}

export function AgendamentosFilters({
  dateRange,
  selectedDates,
  onDateRangeChange,
  onSelectedDatesChange,
  viewMode,
  onViewModeChange,
  totalCount,
  confirmedCount,
  completedCount,
  cancelledCount
}: AgendamentosFiltersProps) {
  const quickFilters = [
    { label: "Hoje", days: 0 },
    { label: "Esta Semana", days: 7 },
    { label: "Este Mês", days: 30 },
  ];

  const handleQuickFilter = (days: number) => {
    const today = new Date();
    const from = new Date(today);
    const to = new Date(today);
    
    if (days === 0) {
      // Hoje
      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);
    } else if (days === 7) {
      // Esta semana
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      from.setDate(diff);
      from.setHours(0, 0, 0, 0);
      to.setDate(diff + 6);
      to.setHours(23, 59, 59, 999);
    } else if (days === 30) {
      // Este mês
      from.setDate(1);
      from.setHours(0, 0, 0, 0);
      to.setMonth(to.getMonth() + 1, 0);
      to.setHours(23, 59, 59, 999);
    }
    
    onDateRangeChange({ from, to });
    onSelectedDatesChange?.([]); // Clear selected dates when using quick filters
  };

  const handleClearFilters = () => {
    onDateRangeChange(undefined);
    onSelectedDatesChange?.([]);
  };

  return (
    <div className="space-y-4">
      {/* Filtros Rápidos e Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className={!dateRange && (!selectedDates || selectedDates.length === 0) ? "bg-primary text-primary-foreground" : ""}
          >
            Todos
          </Button>
          {quickFilters.map((filter) => (
            <Button
              key={filter.label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickFilter(filter.days)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          <DateRangePicker
            value={dateRange}
            selectedDates={selectedDates}
            onChange={onDateRangeChange}
            onDatesChange={onSelectedDatesChange}
            mode="range"
          />
          
          <div className="flex gap-1">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("table")}
            >
              <Filter className="w-4 h-4 mr-1" />
              Tabela
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange("kanban")}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Kanban
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-foreground">{totalCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-blue-400">{confirmedCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Realizados</p>
                <p className="text-2xl font-bold text-green-400">{completedCount}</p>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelados</p>
                <p className="text-2xl font-bold text-red-400">{cancelledCount}</p>
              </div>
              <Badge variant="destructive">✕</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
