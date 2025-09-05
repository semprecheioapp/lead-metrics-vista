import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioRecorder as AudioRecorderClass, encodeAudioForAPI } from "@/utils/RealtimeAudio";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  onSendAudio: (audioBase64: string) => void;
  isSending: boolean;
  onCancel: () => void;
}

export function AudioRecorder({ onSendAudio, isSending, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const recorderRef = useRef<AudioRecorderClass | null>(null);
  const audioChunksRef = useRef<Float32Array[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recorderRef.current) {
        recorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      console.log("🎤 Iniciando gravação de áudio...");
      setPermissionDenied(false);
      audioChunksRef.current = [];
      
      recorderRef.current = new AudioRecorderClass((audioData) => {
        audioChunksRef.current.push(new Float32Array(audioData));
      });

      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Iniciar contador de tempo
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log("✅ Gravação iniciada com sucesso");
    } catch (error) {
      console.error("❌ Erro ao iniciar gravação:", error);
      setPermissionDenied(true);
    }
  };

  const stopRecording = () => {
    console.log("🛑 Parando gravação...");
    
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsRecording(false);
    setHasRecording(audioChunksRef.current.length > 0);
    
    console.log(`✅ Gravação parada. ${audioChunksRef.current.length} chunks gravados`);
  };

  const sendRecording = () => {
    if (audioChunksRef.current.length === 0) {
      console.warn("⚠️ Nenhum áudio gravado para enviar");
      return;
    }

    console.log("📤 Processando áudio para envio...");
    
    // Combinar todos os chunks de áudio
    const totalLength = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.length, 0);
    const combinedAudio = new Float32Array(totalLength);
    
    let offset = 0;
    for (const chunk of audioChunksRef.current) {
      combinedAudio.set(chunk, offset);
      offset += chunk.length;
    }

    // Converter para base64
    const audioBase64 = encodeAudioForAPI(combinedAudio);
    console.log(`✅ Áudio processado: ${audioBase64.length} caracteres base64`);
    
    onSendAudio(audioBase64);
    
    // Reset
    audioChunksRef.current = [];
    setHasRecording(false);
    setRecordingTime(0);
  };

  const cancelRecording = () => {
    console.log("❌ Cancelando gravação...");
    
    if (recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    audioChunksRef.current = [];
    setIsRecording(false);
    setHasRecording(false);
    setRecordingTime(0);
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionDenied) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <p className="text-sm text-destructive text-center">
          Permissão para usar o microfone foi negada. 
          <br />
          Verifique as configurações do seu navegador.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onCancel}
          className="w-full mt-2"
        >
          Fechar
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-card border rounded-lg space-y-4">
      {/* Status da gravação */}
      <div className="text-center">
        {isRecording && (
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm font-medium">Gravando: {formatTime(recordingTime)}</span>
          </div>
        )}
        
        {hasRecording && !isRecording && (
          <span className="text-sm text-muted-foreground">
            Áudio gravado: {formatTime(recordingTime)}
          </span>
        )}
      </div>

      {/* Botões de controle */}
      <div className="flex items-center justify-center gap-3">
        {/* Botão de gravar/parar */}
        <Button
          onMouseDown={!isRecording ? startRecording : undefined}
          onMouseUp={isRecording ? stopRecording : undefined}
          onTouchStart={!isRecording ? startRecording : undefined}
          onTouchEnd={isRecording ? stopRecording : undefined}
          onClick={isRecording ? stopRecording : (!hasRecording ? startRecording : undefined)}
          disabled={isSending}
          size="lg"
          className={cn(
            "h-16 w-16 rounded-full transition-all duration-200",
            isRecording 
              ? "bg-destructive hover:bg-destructive/90 scale-110" 
              : "bg-primary hover:bg-primary/90"
          )}
        >
          {isRecording ? (
            <MicOff className="h-6 w-6" />
          ) : (
            <Mic className="h-6 w-6" />
          )}
        </Button>

        {/* Botão de enviar (se tem gravação) */}
        {hasRecording && !isRecording && (
          <Button
            onClick={sendRecording}
            disabled={isSending}
            size="lg"
            className="h-12 w-12 rounded-full bg-green-600 hover:bg-green-700"
          >
            <Send className="h-5 w-5" />
          </Button>
        )}

        {/* Botão de cancelar */}
        <Button
          onClick={cancelRecording}
          disabled={isSending}
          variant="outline"
          size="lg"
          className="h-12 w-12 rounded-full"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Instruções */}
      <div className="text-center text-xs text-muted-foreground">
        {!hasRecording && !isRecording && (
          <p>Clique e segure para gravar áudio</p>
        )}
        {isRecording && (
          <p>Solte para parar a gravação</p>
        )}
        {hasRecording && !isRecording && (
          <p>Clique em enviar ou cancele a gravação</p>
        )}
      </div>
    </div>
  );
}