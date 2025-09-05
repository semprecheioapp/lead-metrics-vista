import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onSendAudio: (audioBase64: string, mimeType?: string, duration?: number) => void;
  isSending: boolean;
  onCancel: () => void;
}

export function AudioRecorder({ onSendAudio, isSending, onCancel }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  };

  const startRecording = async () => {
    try {
      console.log("🎤 Iniciando gravação de áudio...");
      setPermissionDenied(false);
      audioChunksRef.current = [];
      
      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;

      // Verificar suporte a formatos comprimidos
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus', 
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];

      let selectedMimeType = 'audio/wav';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      console.log(`🎵 Usando formato: ${selectedMimeType}`);

      mediaRecorderRef.current = new MediaRecorder(stream, { 
        mimeType: selectedMimeType,
        audioBitsPerSecond: 64000 // 64kbps para boa qualidade e tamanho reduzido
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`📦 Chunk gravado: ${event.data.size} bytes`);
        }
      };

      mediaRecorderRef.current.start(100); // Capturar dados a cada 100ms
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
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log("🛑 Parando gravação...");
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    
    // Aguardar um pouco para garantir que todos os chunks foram processados
    setTimeout(() => {
      setHasRecording(audioChunksRef.current.length > 0);
      console.log(`✅ Gravação parada. ${audioChunksRef.current.length} chunks gravados`);
    }, 100);
  };

  const sendRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      console.warn("⚠️ Nenhum áudio gravado para enviar");
      toast({
        title: "Erro",
        description: "Nenhum áudio foi gravado",
        variant: "destructive",
      });
      return;
    }

    // Validar duração mínima
    if (recordingTime < 1) {
      console.warn("⚠️ Gravação muito curta");
      toast({
        title: "Aviso",
        description: "A gravação deve ter pelo menos 1 segundo",
        variant: "destructive",
      });
      return;
    }

    console.log("📤 Processando áudio para envio...");
    
    try {
      // Combinar todos os chunks em um blob
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/wav' 
      });
      
      console.log(`📊 Tamanho do áudio: ${audioBlob.size} bytes`);
      console.log(`🎵 Tipo MIME: ${audioBlob.type}`);
      console.log(`⏱️ Duração: ${recordingTime} segundos`);

      // Validar tamanho mínimo
      if (audioBlob.size < 1000) { // Menos de 1KB é suspeito
        console.warn("⚠️ Arquivo de áudio muito pequeno");
        toast({
          title: "Erro",
          description: "Áudio inválido - arquivo muito pequeno",
          variant: "destructive",
        });
        return;
      }

      // Converter para base64
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove o prefixo data:audio/...;base64,
        
        if (!base64Data || base64Data.length === 0) {
          console.error("❌ Base64 vazio após conversão");
          toast({
            title: "Erro",
            description: "Falha ao processar o áudio",
            variant: "destructive",
          });
          return;
        }
        
        console.log(`✅ Áudio processado: ${base64Data.length} caracteres base64`);
        console.log(`📋 Preview Base64: ${base64Data.substring(0, 50)}...${base64Data.substring(base64Data.length - 50)}`);
        
        onSendAudio(base64Data, audioBlob.type, recordingTime);
        
        // Reset
        audioChunksRef.current = [];
        setHasRecording(false);
        setRecordingTime(0);
      };
      
      reader.onerror = () => {
        console.error("❌ Erro ao converter áudio para base64");
        toast({
          title: "Erro",
          description: "Falha ao processar o áudio",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(audioBlob);
      
    } catch (error) {
      console.error("❌ Erro ao processar áudio:", error);
      toast({
        title: "Erro",
        description: "Falha ao processar o áudio",
        variant: "destructive",
      });
    }
  };

  const cancelRecording = () => {
    console.log("❌ Cancelando gravação...");
    
    cleanup();
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