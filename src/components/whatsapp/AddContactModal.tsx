import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddContact } from "@/hooks/useAddContact";
import { InputValidator } from "@/utils/inputValidation";

interface AddContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddContactModal({ open, onOpenChange }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [errors, setErrors] = useState<{ name?: string; number?: string }>({});
  
  const addContactMutation = useAddContact();

  const formatPhoneNumber = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    
    // Aplicar máscara brasileira
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
    
    // Limpar erro quando começar a digitar
    if (errors.number) {
      setErrors({ ...errors, number: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: { name?: string; number?: string } = {};
    
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }
    
    const cleanNumber = number.replace(/\D/g, '');
    if (!cleanNumber || !InputValidator.isValidPhone(number)) {
      newErrors.number = "Telefone deve ter formato válido brasileiro";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const cleanNumber = number.replace(/\D/g, '');
    
    addContactMutation.mutate(
      {
        name: name.trim(),
        number: cleanNumber
      },
      {
        onSuccess: () => {
          // Limpar formulário e fechar modal
          setName("");
          setNumber("");
          setErrors({});
          onOpenChange(false);
        }
      }
    );
  };

  const handleClose = () => {
    setName("");
    setNumber("");
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Contato</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contact-name">Nome do Contato</Label>
            <Input
              id="contact-name"
              placeholder="Digite o nome do contato"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-number">Número do WhatsApp</Label>
            <Input
              id="contact-number"
              placeholder="(11) 99999-9999"
              value={number}
              onChange={handlePhoneChange}
              maxLength={15}
              className={errors.number ? "border-destructive" : ""}
            />
            {errors.number && (
              <p className="text-sm text-destructive">{errors.number}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addContactMutation.isPending}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={addContactMutation.isPending}
            >
              {addContactMutation.isPending ? "Adicionando..." : "Adicionar Contato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}