import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SendAudioPayload {
  tipo_mensagem: "AUDIO";
  codigo: string; // base64 audio data
  empresa_id: number;
  numero: string;
  remetente: string;
}

export const useSendWhatsAppAudio = () => {
  const { empresaData } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ telefone, audioBase64, remetente }: {
      telefone: string;
      audioBase64: string;
      remetente: string;
    }) => {
      if (!empresaData?.id) {
        throw new Error("Empresa ID não encontrado");
      }

      const payload: SendAudioPayload = {
        tipo_mensagem: "AUDIO",
        codigo: audioBase64,
        empresa_id: empresaData.id,
        numero: telefone,
        remetente
      };

      console.log("📤 Enviando áudio para webhook:", {
        url: 'https://editor.semprecheioapp.com.br/webhook/chat_whats_mbk',
        payload: { ...payload, codigo: `[BASE64 DATA - ${audioBase64.length} chars]` }
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
        throw new Error(`Erro ao enviar áudio: ${response.status}`);
      }

      return response.json();
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