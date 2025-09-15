import { cn } from "@/lib/utils";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isFromAI: boolean;
  isLast?: boolean;
  senderName?: string;
  isManual?: boolean;
  attachmentType?: string;
  attachmentUrl?: string;
}

export function MessageBubble({ 
  content, 
  timestamp, 
  isFromAI, 
  isLast, 
  senderName, 
  isManual,
  attachmentType,
  attachmentUrl
}: MessageBubbleProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={cn(
      "flex mb-3 sm:mb-4 animate-fade-in px-2 sm:px-4",
      isFromAI ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex flex-col w-full",
        isFromAI ? "items-end" : "items-start"
      )}>
        {/* Nome do remetente para mensagens manuais */}
        {isFromAI && isManual && senderName && (
          <div className="text-xs text-muted-foreground mb-1 px-2">
            {senderName}
          </div>
        )}
        
        <div className={cn(
          "relative rounded-2xl px-3 py-2 shadow-sm break-words",
          "min-w-[60px] max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%]",
          isFromAI 
            ? "bg-primary text-primary-foreground rounded-br-md" 
            : "bg-muted text-foreground rounded-bl-md"
        )}>
          {/* Renderizar imagem se existir */}
          {attachmentType === 'image' && attachmentUrl && (
            <div className="mb-2">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer rounded-lg overflow-hidden border border-border/20 hover:border-border/40 transition-colors">
                    {imageLoading && !imageError && (
                      <Skeleton className="w-full h-48 bg-muted/50" />
                    )}
                    {!imageError ? (
                      <img
                        src={attachmentUrl}
                        alt="Imagem enviada"
                        className={cn(
                          "w-full max-w-xs h-auto rounded-lg transition-opacity",
                          imageLoading ? "opacity-0 absolute" : "opacity-100"
                        )}
                        onLoad={() => setImageLoading(false)}
                        onError={() => {
                          setImageLoading(false);
                          setImageError(true);
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted/50 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                        Erro ao carregar imagem
                      </div>
                    )}
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl p-0 bg-background/95 border-border">
                  <img
                    src={attachmentUrl}
                    alt="Imagem enviada"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                  />
                </DialogContent>
              </Dialog>
            </div>
          )}
          
          {/* Texto da mensagem */}
          {content && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {content}
            </p>
          )}
          <div className={cn(
            "flex items-center justify-end mt-1 gap-1",
            isFromAI ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            <span className="text-xs leading-none">{formatTime(timestamp)}</span>
            {isFromAI && (
              <div className="flex gap-0.5 ml-1">
                <div className="w-1 h-1 bg-current rounded-full opacity-70" />
                <div className="w-1 h-1 bg-current rounded-full opacity-70" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}