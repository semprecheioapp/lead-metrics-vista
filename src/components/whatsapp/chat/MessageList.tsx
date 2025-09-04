import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageBubble } from "./MessageBubble";
import { cn } from "@/lib/utils";

interface Conversation {
  id: number;
  content: string;
  timestamp: string;
  isFromAI: boolean;
  rawMessage?: {
    response_metadata?: {
      sender_name?: string;
      is_manual?: boolean;
    };
  };
}

interface MessageListProps {
  conversations?: Conversation[];
  isLoading: boolean;
  isSending: boolean;
}

export function MessageList({ conversations, isLoading, isSending }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations]);

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="py-2 sm:py-4">
        {isLoading ? (
          <div className="space-y-3 sm:space-y-4 px-2 sm:px-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
                <div className="max-w-[80%] sm:max-w-[70%] space-y-2">
                  <Skeleton className="h-12 sm:h-16 w-32 sm:w-48" />
                  <Skeleton className="h-3 w-8 sm:w-12 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations?.length ? (
          <>
            {conversations.map((conv, index) => (
              <MessageBubble
                key={conv.id}
                content={conv.content}
                timestamp={conv.timestamp}
                isFromAI={conv.isFromAI}
                isLast={index === conversations.length - 1}
                senderName={conv.rawMessage?.response_metadata?.sender_name}
                isManual={conv.rawMessage?.response_metadata?.is_manual}
              />
            ))}
            {isSending && (
              <div className="flex justify-end mb-3 sm:mb-4 px-2 sm:px-4">
                <div className="bg-primary/50 text-primary-foreground rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}