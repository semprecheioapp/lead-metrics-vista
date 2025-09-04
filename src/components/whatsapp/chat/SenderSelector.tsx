import { useState, useEffect } from "react";
import { Edit3, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SenderSelectorProps {
  defaultSenderName?: string;
  onKeyPress?: (e: React.KeyboardEvent) => void;
}

export function SenderSelector({ defaultSenderName, onKeyPress }: SenderSelectorProps) {
  const [senderName, setSenderName] = useState("");
  const [isEditingSender, setIsEditingSender] = useState(false);
  const [savedSenderName, setSavedSenderName] = useState("");

  // Carregar nome do remetente salvo
  useEffect(() => {
    const saved = localStorage.getItem('whatsapp-sender-name');
    if (saved) {
      setSavedSenderName(saved);
    }
  }, []);

  // Salvar nome do remetente
  const handleSaveSenderName = () => {
    if (senderName.trim()) {
      localStorage.setItem('whatsapp-sender-name', senderName.trim());
      setSavedSenderName(senderName.trim());
      setIsEditingSender(false);
      setSenderName("");
    }
  };

  // Editar nome do remetente
  const handleEditSenderName = () => {
    setSenderName(savedSenderName);
    setIsEditingSender(true);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setSenderName("");
    setIsEditingSender(false);
  };

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
        Remetente:
      </Label>
      
      {!savedSenderName && !isEditingSender ? (
        // Estado inicial - sem nome salvo
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={defaultSenderName || "Digite seu nome"}
            className="h-7 sm:h-8 text-xs sm:text-sm bg-background flex-1"
          />
          <Button
            onClick={handleSaveSenderName}
            disabled={!senderName.trim()}
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            <Check className="h-3 w-3" />
          </Button>
        </div>
      ) : isEditingSender ? (
        // Estado de edição
        <div className="flex items-center gap-2 flex-1">
          <Input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            onKeyPress={onKeyPress}
            className="h-7 sm:h-8 text-xs sm:text-sm bg-background flex-1"
            autoFocus
          />
          <Button
            onClick={handleSaveSenderName}
            disabled={!senderName.trim()}
            size="sm"
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            onClick={handleCancelEdit}
            size="sm"
            variant="ghost"
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        // Estado com nome salvo
        <div className="flex items-center gap-2 flex-1">
          <span className="text-xs sm:text-sm font-medium text-foreground flex-1 truncate">
            {savedSenderName}
          </span>
          <Button
            onClick={handleEditSenderName}
            size="sm"
            variant="ghost"
            className="h-7 sm:h-8 px-2 sm:px-3"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}

export function useSenderName() {
  const [savedSenderName, setSavedSenderName] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('whatsapp-sender-name');
    if (saved) {
      setSavedSenderName(saved);
    }
  }, []);

  return savedSenderName;
}