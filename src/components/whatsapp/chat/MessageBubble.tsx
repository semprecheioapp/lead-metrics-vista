import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isFromAI: boolean;
  isLast?: boolean;
  senderName?: string;
  isManual?: boolean;
}

export function MessageBubble({ 
  content, 
  timestamp, 
  isFromAI, 
  isLast, 
  senderName, 
  isManual 
}: MessageBubbleProps) {
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
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere">
            {content}
          </p>
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