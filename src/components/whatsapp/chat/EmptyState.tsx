import { Smartphone } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background p-6">
      <div className="p-4 sm:p-6 rounded-full bg-muted/30 mb-4 sm:mb-6">
        <Smartphone className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />
      </div>
      <h3 className="text-xl sm:text-2xl font-light text-foreground mb-2 sm:mb-3 text-center">
        CHAT AO VIVO MBK
      </h3>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-sm">
        Selecione uma conversa da lista para começar a responder mensagens dos seus leads.
      </p>
    </div>
  );
}