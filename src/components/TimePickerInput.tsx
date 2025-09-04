import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface TimePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const TimePickerInput = ({ 
  value, 
  onChange, 
  label = "Horário",
  placeholder = "09:00",
  disabled = false 
}: TimePickerInputProps) => {
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    
    // Validar formato HH:MM
    if (time.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) || time === "") {
      onChange(time);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="time-input">{label}</Label>}
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          id="time-input"
          type="time"
          value={value}
          onChange={handleTimeChange}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10"
        />
      </div>
    </div>
  );
};