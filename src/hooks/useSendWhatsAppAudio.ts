import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SendAudioPayload {
  tipo_mensagem: "AUDIO";
  codigo: string; // base64 audio data
  empresa_id: number;
  numero: string;
  remetente: string;
  mime?: string; // MIME type do áudio
  filename?: string; // Nome do arquivo
  duracao_ms?: number; // Duração em milissegundos
}

export const useSendWhatsAppAudio = () => {
  const { empresaData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      telefone, 
      audioBase64, 
      remetente, 
      mimeType, 
      duration 
    }: {
      telefone: string;
      audioBase64: string;
      remetente: string;
      mimeType?: string;
      duration?: number;
    }) => {
      if (!empresaData?.id) {
        throw new Error("Empresa ID não encontrado");
      }

      // Validação adicional do Base64
      if (!audioBase64 || audioBase64.trim() === '') {
        console.error("❌ Base64 está vazio");
        throw new Error("Base64 do áudio está vazio");
      }

      if (audioBase64.length < 100) {
        console.error("❌ Base64 muito pequeno:", audioBase64.length);
        throw new Error("Áudio inválido - dados insuficientes");
      }

      // Determinar extensão baseada no MIME type
      let filename = "audio.wav";
      if (mimeType) {
        if (mimeType.includes('opus')) {
          filename = "audio.opus";
        } else if (mimeType.includes('webm')) {
          filename = "audio.webm";
        } else if (mimeType.includes('ogg')) {
          filename = "audio.ogg";
        } else if (mimeType.includes('mp4')) {
          filename = "audio.mp4";
        }
      }

      const payload: SendAudioPayload = {
        tipo_mensagem: "AUDIO",
        codigo: audioBase64,
        empresa_id: empresaData.id,
        numero: telefone,
        remetente,
        mime: mimeType,
        filename: filename,
        duracao_ms: duration ? duration * 1000 : undefined
      };

      console.log("📤 Enviando áudio para webhook:", {
        url: 'https://editor.semprecheioapp.com.br/webhook/chat_whats_mbk',
        payload: { 
          ...payload, 
          codigo: `[BASE64 DATA - ${audioBase64.length} chars]`,
          tamanho_base64: audioBase64.length,
          tipo_mime: mimeType || 'não especificado',
          duracao_segundos: duration || 'não especificado'
        }
      });

      // Enviar para o webhook
      const response = await fetch('https://editor.semprecheioapp.com.br/webhook/chat_whats_mbk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro na resposta do webhook:", {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Erro ao enviar áudio: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("✅ Áudio enviado com sucesso:", result);
      return result;
    },
    onSuccess: (data, variables) => {
      console.log("✅ Áudio enviado com sucesso:", data);
      
      // Invalidar cache para atualizar a conversa
      queryClient.invalidateQueries({ 
        queryKey: ["lead_conversations", variables.telefone, empresaData.id]
      });
      queryClient.invalidateQueries({ 
        queryKey: ["whatsapp_leads", empresaData.id]
      });
      
      toast.success("Áudio enviado com sucesso!");
    },
    onError: (error) => {
      console.error('❌ Erro ao enviar áudio:', error);
      toast.error("Erro ao enviar áudio. Tente novamente.");
    }
  });
};