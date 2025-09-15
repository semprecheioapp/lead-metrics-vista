import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export interface ConversationMessage {
  id: number;
  content: string;
  timestamp: string;
  isFromAI: boolean;
  rawMessage: any;
  attachmentType?: string;
  attachmentUrl?: string;
}

export const useLeadConversations = (phoneNumber: string) => {
  const { empresaId } = useAuth();
  const queryClient = useQueryClient();

  // Configurar realtime subscription para novas mensagens
  useEffect(() => {
    if (!empresaId || !phoneNumber) return;

    console.log("🔄 Configurando realtime para:", { phoneNumber, empresaId });

    // Variações do telefone para escutar
    const phoneVariations = [
      phoneNumber,
      phoneNumber.replace(/\D/g, ''),
      phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`,
      phoneNumber.startsWith('+55') ? phoneNumber.substring(3) : phoneNumber
    ];

    const channel = supabase
      .channel(`memoria_ai_${phoneNumber}_${empresaId}`);

    // Subscribe with precise filters for each phone variation
    for (const variation of phoneVariations) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memoria_ai',
          filter: `session_id=eq.${variation}`
        },
        (payload) => {
          console.log('📨 Nova mensagem (filtered) via realtime:', payload);
          const newMessage = payload.new as any;
          if (!newMessage) return;

          if (phoneVariations.includes(newMessage.session_id) && newMessage.empresa_id === empresaId) {
            console.log('✅ Mensagem deste chat. Atualizando cache imediatamente e refetch...');

            // 1) Atualiza o cache imediatamente para evitar esperar o refetch
            try {
              queryClient.setQueryData<ConversationMessage[] | undefined>(
                ['lead_conversations', phoneNumber, empresaId],
                (old) => {
                  const conversations = Array.isArray(old) ? [...old] : [];

                  // Converter payload.new.message em ConversationMessage
                  const row = { id: newMessage.id, message: newMessage.message, created_at: newMessage.created_at } as any;
                  let content = '';
                  let isFromAI = false;
                  const messageData = row.message as any;

                  if (messageData && typeof messageData === 'object' && messageData.content) {
                    isFromAI = messageData.type === 'ai';
                    if (typeof messageData.content === 'string') {
                      try {
                        const match = messageData.content.match(/content:([^,}]+)/);
                        if (match) {
                          content = match[1].trim();
                          const typeMatch = messageData.content.match(/type:(human|ai)/);
                          if (typeMatch) isFromAI = typeMatch[1] === 'ai';
                        } else {
                          const parsed = JSON.parse(messageData.content);
                          content = parsed.content || messageData.content;
                          if (parsed.type) isFromAI = parsed.type === 'ai';
                        }
                      } catch {
                        content = messageData.content;
                      }
                    } else if (typeof messageData.content === 'object') {
                      content = messageData.content.content || JSON.stringify(messageData.content);
                      isFromAI = messageData.content.type === 'ai';
                    } else {
                      content = String(messageData.content);
                    }
                    // Limpa aspas simples/duplas das extremidades
                    content = content.replace(/^["']|["']$/g, '');
                  } else if (messageData && typeof messageData === 'object' && messageData.role) {
                    content = messageData.content || '';
                    isFromAI = messageData.role === 'assistant';
                  } else if (typeof messageData === 'string') {
                    content = messageData;
                    isFromAI = false;
                  }

                  const newConv: ConversationMessage | null = content.trim()
                    ? {
                        id: row.id,
                        content: content.trim(),
                        timestamp: row.created_at,
                        isFromAI,
                        rawMessage: messageData,
                      }
                    : null;

                  if (!newConv) return conversations;

                  // Evitar duplicatas
                  const exists = conversations.some((c) => c.id === newConv.id);
                  if (!exists) conversations.push(newConv);

                  // Garantir ordenação por timestamp
                  conversations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
                  return conversations;
                }
              );
            } catch (e) {
              console.warn('Não foi possível fazer atualização imediata do cache:', e);
            }

            // 2) Ainda assim invalida e refaz o fetch para manter consistência total
            queryClient.invalidateQueries({ queryKey: ['lead_conversations', phoneNumber, empresaId] });
            queryClient.refetchQueries({ queryKey: ['lead_conversations', phoneNumber, empresaId] });
          }
        }
      );
    }

    channel.subscribe((status) => {
      console.log('📡 Status da conexão realtime:', status, 'para chat:', phoneNumber);
    });

    return () => {
      console.log("🔌 Desconectando realtime para:", phoneNumber);
      supabase.removeChannel(channel);
    };
  }, [empresaId, phoneNumber, queryClient]);

  return useQuery<ConversationMessage[]>({
    queryKey: ["lead_conversations", phoneNumber, empresaId],
    queryFn: async () => {
      console.log("🔍 Buscando conversas para:", { phoneNumber, empresaId });
      
      if (!empresaId || !phoneNumber) {
        console.log("❌ Parâmetros faltando:", { empresaId, phoneNumber });
        return [];
      }

      // Tentar diferentes formatos do número de telefone
      const phoneVariations = [
        phoneNumber,
        phoneNumber.replace(/\D/g, ''), // Remove todos os caracteres não numéricos
        phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`,
        phoneNumber.startsWith('+55') ? phoneNumber.substring(3) : phoneNumber
      ];

      console.log("📱 Tentando variações do telefone:", phoneVariations);

      let data = null;
      let error = null;

      // Tentar cada variação até encontrar dados
      for (const variation of phoneVariations) {
        const result = await supabase
          .from("memoria_ai")
          .select("id, message, created_at, attachment_type, attachment_url, empresa_id, session_id")
          .eq("empresa_id", empresaId)
          .eq("session_id", variation)
          .order("created_at", { ascending: true });

        if (result.error) {
          error = result.error;
          continue;
        }

        if (result.data && result.data.length > 0) {
          console.log(`✅ Encontrou dados com variação: ${variation}`);
          data = result.data;
          break;
        }
      }

      console.log("📊 Query executada:", { empresa_id: empresaId, session_id: phoneNumber });

      if (error) {
        console.error("❌ Erro na query:", error);
        throw error;
      }

      console.log("✅ Dados retornados:", data);

      // Processar imagens com base64 pendentes
      if (data && data.length > 0) {
        for (const record of data) {
          try {
            const messageObj = typeof record.message === 'string' 
              ? JSON.parse(record.message) 
              : record.message;

            // Verificar se tem base64 mas ainda não foi processado
            const hasBase64 = messageObj?.attachment?.base64;
            const needsProcessing = hasBase64 && !record.attachment_url;

            if (needsProcessing) {
              console.log('🎯 Processando imagem base64 para registro:', record.id);
              
              try {
                const { data: result, error: processError } = await supabase.functions.invoke('process-whatsapp-media', {
                  body: { record }
                });

                if (processError) {
                  console.error('❌ Erro ao processar mídia:', processError);
                } else {
                  console.log('✅ Mídia processada com sucesso:', result);
                  
                  // Atualizar o registro local com a URL processada
                  if (result?.attachment_url) {
                    record.attachment_url = result.attachment_url;
                    record.attachment_type = result.attachment_type;
                  }
                }
              } catch (e) {
                console.error('❌ Erro na chamada da edge function:', e);
              }
            }
          } catch (e) {
            console.error('❌ Erro ao verificar base64:', e);
          }
        }
      }

      const conversations: ConversationMessage[] = [];

      (data || []).forEach((row) => {
        try {
          const messageData = row.message as any;
          
          // Estrutura real dos dados: {type: "ai", content: "{type:human,content:Oi...}"}
          if (messageData && typeof messageData === 'object' && messageData.content) {
            let content = "";
            let isFromAI = messageData.type === "ai";
            
            // O content pode ser uma string JSON que precisa ser parseada
            if (typeof messageData.content === 'string') {
              try {
                // Tentar extrair usando regex primeiro (para formato {type:human,content:...})
                const match = messageData.content.match(/content:([^,}]+)/);
                if (match) {
                  content = match[1].trim();
                  // Determinar se é da IA baseado no tipo dentro do content
                  const typeMatch = messageData.content.match(/type:(human|ai)/);
                  if (typeMatch) {
                    isFromAI = typeMatch[1] === "ai";
                  }
                } else {
                  // Tentar parse JSON normal
                  const parsed = JSON.parse(messageData.content);
                  content = parsed.content || messageData.content;
                  if (parsed.type) {
                    isFromAI = parsed.type === "ai";
                  }
                }
              } catch {
                // Se não conseguir fazer parse, usar como string
                content = messageData.content;
              }
            } else if (typeof messageData.content === 'object') {
              content = messageData.content.content || JSON.stringify(messageData.content);
              isFromAI = messageData.content.type === "ai";
            } else {
              content = String(messageData.content);
            }

            // Limpar conteúdo se necessário
            content = content.replace(/^["']|["']$/g, ''); // Remove aspas do início/fim

            if (content.trim()) {
              conversations.push({
                id: row.id,
                content: content.trim(),
                timestamp: row.created_at,
                isFromAI,
                rawMessage: messageData,
                attachmentType: row.attachment_type || undefined,
                attachmentUrl: row.attachment_url || undefined
              });
            }
          } else if (messageData && typeof messageData === 'object' && messageData.role) {
            // OpenAI format: {role: "user"/"assistant", content: "..."}
            conversations.push({
              id: row.id,
              content: messageData.content || "",
              timestamp: row.created_at,
              isFromAI: messageData.role === "assistant",
              rawMessage: messageData,
              attachmentType: row.attachment_type || undefined,
              attachmentUrl: row.attachment_url || undefined
            });
          } else if (typeof messageData === "string") {
            // Simple string format
            conversations.push({
              id: row.id,
              content: messageData,
              timestamp: row.created_at,
              isFromAI: false,
              rawMessage: messageData,
              attachmentType: row.attachment_type || undefined,
              attachmentUrl: row.attachment_url || undefined
            });
          }
        } catch (e) {
          console.warn("Failed to parse message:", row.message, e);
        }
      });

      console.log("💬 Conversas processadas:", conversations.length);
      return conversations;
    },
    enabled: !!(empresaId && phoneNumber),
    refetchInterval: 1000, // Atualizar a cada 1 segundo
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
    staleTime: 0,
    gcTime: 0, // Não manter cache
  });
};