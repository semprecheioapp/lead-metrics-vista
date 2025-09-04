import { useState, useRef, useEffect } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SenderSelector, useSenderName } from "./SenderSelector";

interface MessageComposerProps {
  onSendMessage: (message: string, senderName: string) => void;
  isSending: boolean;
  isMobile?: boolean;
  defaultSenderName?: string;
}

export function MessageComposer({ 
  onSendMessage, 
  isSending, 
  isMobile, 
  defaultSenderName 
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSenderName = useSenderName();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = Math.min(scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleSendMessage = () => {
    if (!message.trim() || isSending) return;

    const remetente = savedSenderName || defaultSenderName || "Atendente";
    onSendMessage(message.trim(), remetente);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-card">
      <div className="space-y-2 sm:space-y-3">
        {/* Sender name selector */}
        <SenderSelector 
          defaultSenderName={defaultSenderName}
          onKeyPress={handleKeyPress}
        />
        
        {/* Message input */}
        <div className="flex items-end gap-2">
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex-1 relative min-w-0">
            <Textarea
              ref={textareaRef}
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="min-h-[36px] sm:min-h-[40px] max-h-[120px] resize-none pr-12 bg-background w-full text-sm"
              rows={1}
            />
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}