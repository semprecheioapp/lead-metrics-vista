import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Send, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useFollowupConfig } from "@/hooks/useFollowupConfig";

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
  const [message, setMessage] = useState("");
  const { config } = useFollowupConfig();

  React.useEffect(() => {
    if (open && config) {
      // Definir mensagem padrão quando abrir o modal
      const defaultMessage = config.template_followup.replace("{nome}", lead.name);
      setMessage(defaultMessage);
    }
  }, [open, config, lead.name]);

  const handleSchedule = () => {
    if (!selectedDate || !message.trim()) return;

    onSchedule({
      date: selectedDate,
      message: message.trim(),
      leadId: lead.id
    });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

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
          {selectedDate && message && (
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">Preview:</p>
              <p className="text-sm">
                <span className="font-medium">Data:</span> {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
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
            disabled={!selectedDate || !message.trim() || isLoading}
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