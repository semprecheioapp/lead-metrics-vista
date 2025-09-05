import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SendAudioPayload {
  tipo_mensagem: "AUDIO";
  codigo: string; // base64 audio data (puro, sem prefixo)
  base64_audio?: string; // campo adicional compatível com alguns webhooks
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

      // Determinar extensão baseada no MIME type (priorizar .ogg)
      let filename = "audio.ogg";
      if (mimeType) {
        if (mimeType.includes('webm')) {
          filename = "audio.webm";
        } else if (mimeType.includes('wav')) {
          filename = "audio.wav";
        } else {
          filename = "audio.ogg";
        }
      }

      // Sanitizar Base64: remover prefixo data: e qualquer whitespace
      let b64 = audioBase64 || '';
      if (b64.startsWith('data:')) {
        b64 = (b64.split(',')[1] || '');
      }
      const sanitized = b64.replace(/[\r\n\t ]+/g, '');

      console.log('📏 Base64 antes/depois sanitização:', {
        antes: (audioBase64 || '').length,
        depois: sanitized.length,
      });
      console.log(`📋 Preview Base64: ${sanitized.substring(0, 50)}...${sanitized.substring(Math.max(0, sanitized.length - 50))}`);

      if (!sanitized || sanitized.trim() === '') {
        console.error("❌ Base64 está vazio após sanitização");
        throw new Error("Base64 do áudio está vazio");
      }

      if (sanitized.length < 10000) {
        console.error("❌ Base64 muito pequeno (<10KB):", sanitized.length);
        throw new Error("Áudio inválido - base64 muito curto");
      }

      const payload: SendAudioPayload = {
        tipo_mensagem: "AUDIO",
        codigo: sanitized,
        base64_audio: sanitized, // compatibilidade
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