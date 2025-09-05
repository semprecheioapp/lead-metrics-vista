import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SenderSelector, useSenderName } from "./SenderSelector";
import { AudioRecorder } from "./AudioRecorder";
import { useSendWhatsAppAudio } from "@/hooks/useSendWhatsAppAudio";

interface MessageComposerProps {
  onSendMessage: (message: string, senderName: string) => void;
  isSending: boolean;
  isMobile?: boolean;
  defaultSenderName?: string;
  phoneNumber?: string; // Para envio de áudio
}

export function MessageComposer({ 
  onSendMessage, 
  isSending, 
  isMobile, 
  defaultSenderName,
  phoneNumber 
}: MessageComposerProps) {
  const [message, setMessage] = useState("");
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const savedSenderName = useSenderName();
  const sendAudioMutation = useSendWhatsAppAudio();

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

  const handleSendAudio = async (audioBase64: string) => {
    if (!phoneNumber) {
      console.error("❌ Número de telefone não encontrado");
      return;
    }

    const remetente = savedSenderName || defaultSenderName || "Atendente";
    
    try {
      await sendAudioMutation.mutateAsync({
        telefone: phoneNumber,
        audioBase64,
        remetente
      });
      
      setShowAudioRecorder(false);
    } catch (error) {
      console.error("❌ Erro ao enviar áudio:", error);
    }
  };

  const toggleAudioRecorder = () => {
    setShowAudioRecorder(!showAudioRecorder);
  };

  return (
    <div className="p-3 sm:p-4 border-t border-border bg-card">
      <div className="space-y-2 sm:space-y-3">
        {/* Sender name selector */}
        <SenderSelector 
          defaultSenderName={defaultSenderName}
          onKeyPress={handleKeyPress}
        />
        
        {/* Audio Recorder */}
        {showAudioRecorder && (
          <AudioRecorder 
            onSendAudio={handleSendAudio}
            isSending={sendAudioMutation.isPending}
            onCancel={() => setShowAudioRecorder(false)}
          />
        )}
        
        {/* Message input */}
        {!showAudioRecorder && (
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
            
            {/* Botão de microfone */}
            <Button 
              onClick={toggleAudioRecorder}
              disabled={isSending || sendAudioMutation.isPending}
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending}
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
            >
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}