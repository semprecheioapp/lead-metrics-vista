import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Send, Sparkles } from "lucide-react";
import { format, setHours, setMinutes, addDays, isWeekend, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useFollowupConfig } from "@/hooks/useFollowupConfig";
import { TimePickerInput } from "@/components/TimePickerInput";

interface ScheduleFollowupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: {
    id: string;
    name: string;
    number: string;
  };
  onSchedule: (data: {
    date: Date;
    message: string;
    leadId: string;
  }) => void;
  isLoading?: boolean;
}

export function ScheduleFollowupModal({
  open,
  onOpenChange,
  lead,
  onSchedule,
  isLoading = false
}: ScheduleFollowupModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("09:00");
  const [message, setMessage] = useState("");
  const { config } = useFollowupConfig();

  React.useEffect(() => {
    if (open && config) {
      // Definir mensagem padrão quando abrir o modal
      const defaultMessage = config.template_followup?.replace("{nome}", lead.name) || 
        `Olá ${lead.name}, notamos que você demonstrou interesse em nossos produtos. Podemos ajudá-lo a dar continuidade?`;
      setMessage(defaultMessage);
      
      // Definir horário padrão (usar 09:00 como padrão)
      const defaultTime = "09:00";
      setSelectedTime(defaultTime);
    }
  }, [open, config, lead.name]);

  const getNextBusinessDateTime = () => {
    const now = new Date();
    const currentHour = getHours(now);
    let targetDate = new Date();
    
    // Se já passou do horário comercial ou é fim de semana, sugerir próximo dia útil
    const endHour = 18; // Horário padrão
    if (currentHour >= endHour || isWeekend(now)) {
      targetDate = addDays(now, 1);
      while (isWeekend(targetDate)) {
        targetDate = addDays(targetDate, 1);
      }
    }
    
    return targetDate;
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime || !message.trim()) return;

    // Combinar data e hora selecionadas
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const fullDateTime = setMinutes(setHours(selectedDate, hours), minutes);

    onSchedule({
      date: fullDateTime,
      message: message.trim(),
      leadId: lead.id
    });
  };

  const validateBusinessHours = (time: string): boolean => {
    const [hours] = time.split(":").map(Number);
    const startHour = 9; // Horário padrão
    const endHour = 18; // Horário padrão
    
    return hours >= startHour && hours < endHour;
  };

  const tomorrow = getNextBusinessDateTime();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Agendar Follow-up
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Agende um follow-up para <span className="font-semibold">{lead.name}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Seleção de Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data do Follow-up</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "PPP", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < tomorrow}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Seleção de Horário */}
          <div className="space-y-2">
            <TimePickerInput 
              value={selectedTime}
              onChange={setSelectedTime}
              label="Horário do Follow-up"
              placeholder="09:00"
            />
            {selectedTime && !validateBusinessHours(selectedTime) && (
              <p className="text-xs text-amber-600">
                ⚠️ Horário fora do expediente comercial (9h às 18h)
              </p>
            )}
          </div>

          {/* Mensagem do Follow-up */}
          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2">
              Mensagem do Follow-up
              <Sparkles className="w-4 h-4 text-amber-500" />
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem que será enviada no follow-up..."
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>A IA irá otimizar sua mensagem antes do envio</span>
              <span>{message.length}/500</span>
            </div>
          </div>

          {/* Preview */}
          {selectedDate && selectedTime && message && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
              <p className="text-sm">
                <span className="font-medium">Data:</span> {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })} às {selectedTime}
              </p>
              <p className="text-sm">
                <span className="font-medium">Para:</span> {lead.name} ({lead.number})
              </p>
              <p className="text-sm mt-2">
                <span className="font-medium">Mensagem:</span> {message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={!selectedDate || !selectedTime || !message.trim() || isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Agendar Follow-up
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}