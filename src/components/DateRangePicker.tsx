import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface MultipleDates {
  selectedDates: Date[];
  isRange: boolean;
}

interface DateRangePickerProps {
  value?: DateRange;
  selectedDates?: Date[];
  onChange: (range: DateRange) => void;
  onDatesChange?: (dates: Date[]) => void;
  mode?: "range" | "multiple";
}

const QUICK_RANGES = [
  { label: "Hoje", days: 0 },
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
];

export const DateRangePicker = ({ 
  value, 
  selectedDates = [], 
  onChange, 
  onDatesChange,
  mode = "range" 
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<"range" | "multiple">(mode);

  const handleQuickRange = (days: number) => {
    const to = endOfDay(new Date());
    const from = days === 0 ? startOfDay(new Date()) : startOfDay(subDays(new Date(), days));
    onChange({ from, to });
    setCurrentMode("range");
    setIsOpen(false);
  };

  const handleDateSelect = (selected: any) => {
    if (currentMode === "multiple") {
      if (selected && Array.isArray(selected)) {
        onDatesChange?.(selected);
      } else if (selected && !Array.isArray(selected)) {
        const newDates = selectedDates.some(d => d.toDateString() === selected.toDateString())
          ? selectedDates.filter(d => d.toDateString() !== selected.toDateString())
          : [...selectedDates, selected];
        onDatesChange?.(newDates);
      }
    } else {
      // Range mode
      if (selected && typeof selected === 'object' && 'from' in selected && 'to' in selected) {
        if (selected.from && selected.to) {
          onChange({
            from: startOfDay(selected.from as Date),
            to: endOfDay(selected.to as Date)
          });
          setIsOpen(false);
        }
      }
    }
  };

  const formatSelection = () => {
    if (currentMode === "multiple") {
      if (selectedDates.length === 0) return "Selecionar dias";
      if (selectedDates.length === 1) {
        return format(selectedDates[0], "dd/MM/yyyy", { locale: ptBR });
      }
      return `${selectedDates.length} dias selecionados`;
    } else {
      if (!value?.from || !value?.to) return "Selecionar período";
      
      if (value.from.toDateString() === value.to.toDateString()) {
        return format(value.from, "dd/MM/yyyy", { locale: ptBR });
      }
      
      return `${format(value.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(value.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
  };

  const removeDateFromSelection = (dateToRemove: Date) => {
    const newDates = selectedDates.filter(d => d.toDateString() !== dateToRemove.toDateString());
    onDatesChange?.(newDates);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatSelection()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border border-border shadow-lg z-50" align="start">
        <div className="flex bg-background">
          <div className="p-3 border-r border-border bg-card">
            <div className="grid gap-2">
              <div className="mb-3">
                <div className="text-sm font-medium mb-2">Modo:</div>
                <div className="grid gap-1">
                  <Button
                    variant={currentMode === "range" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setCurrentMode("range")}
                  >
                    Período
                  </Button>
                  <Button
                    variant={currentMode === "multiple" ? "default" : "ghost"}
                    size="sm"
                    className="justify-start"
                    onClick={() => setCurrentMode("multiple")}
                  >
                    Dias específicos
                  </Button>
                </div>
              </div>
              
              {currentMode === "range" && (
                <>
                  <div className="text-sm font-medium mb-2">Períodos rápidos:</div>
                  {QUICK_RANGES.map((range) => (
                    <Button
                      key={range.label}
                      variant="ghost"
                      size="sm"
                      className="justify-start hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleQuickRange(range.days)}
                    >
                      {range.label}
                    </Button>
                  ))}
                </>
              )}

              {currentMode === "multiple" && selectedDates.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Dias selecionados:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {selectedDates.map((date, index) => (
                      <div key={index} className="flex items-center justify-between gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {format(date, "dd/MM", { locale: ptBR })}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => removeDateFromSelection(date)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setIsOpen(false)}
                  >
                    Aplicar seleção
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="p-3 bg-background pointer-events-auto">
            {currentMode === "multiple" ? (
              <Calendar
                mode="multiple"
                selected={selectedDates}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR}
                className="pointer-events-auto bg-background border-0"
              />
            ) : (
              <Calendar
                mode="range"
                selected={value ? { from: value.from, to: value.to } : undefined}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={ptBR}
                className="pointer-events-auto bg-background border-0"
              />
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};