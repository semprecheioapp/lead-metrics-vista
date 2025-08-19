import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Upgrade': 'websocket',
  'Connection': 'Upgrade',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") !== "websocket") {
    return new Response("Expected websocket", { status: 426 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  let openaiWs: WebSocket | null = null;

  socket.addEventListener("open", () => {
    console.log("🔗 Cliente conectado ao chat");

    // Conectar ao OpenAI Realtime API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY não configurada");
      socket.send(JSON.stringify({ type: 'error', message: 'API Key não configurada' }));
      return;
    }

    const openaiUrl = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17`;
    
    try {
      openaiWs = new WebSocket(openaiUrl, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        },
      });

      openaiWs.addEventListener("open", () => {
        console.log("✅ Conectado ao OpenAI Realtime API");
        socket.send(JSON.stringify({ type: 'connected', message: 'Chat conectado com sucesso!' }));
      });

      openaiWs.addEventListener("message", (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 Mensagem do OpenAI:", data.type);

          // Configurar sessão assim que receber session.created
          if (data.type === 'session.created') {
            const sessionUpdate = {
              type: 'session.update',
              session: {
                modalities: ["text", "audio"],
                instructions: `Você é um assistente de atendimento ao cliente inteligente para um sistema de gestão de leads. 
                
                Suas responsabilidades incluem:
                - Ajudar com dúvidas sobre leads e contatos
                - Fornecer insights sobre conversões e métricas
                - Auxiliar na interpretação de dados de vendas
                - Sugerir estratégias de follow-up
                - Responder perguntas sobre o sistema
                
                Mantenha respostas concisas, profissionais e úteis. Sempre ofereça ajuda prática.`,
                voice: "alloy",
                input_audio_format: "pcm16",
                output_audio_format: "pcm16",
                input_audio_transcription: {
                  model: "whisper-1"
                },
                turn_detection: {
                  type: "server_vad",
                  threshold: 0.5,
                  prefix_padding_ms: 300,
                  silence_duration_ms: 1000
                },
                temperature: 0.7,
                max_response_output_tokens: "inf"
              }
            };
            
            openaiWs.send(JSON.stringify(sessionUpdate));
            console.log("⚙️ Sessão configurada");
          }

          // Repassar todas as mensagens para o cliente
          socket.send(JSON.stringify(data));
        } catch (error) {
          console.error("❌ Erro ao processar mensagem do OpenAI:", error);
        }
      });

      openaiWs.addEventListener("error", (error) => {
        console.error("❌ Erro no WebSocket OpenAI:", error);
        socket.send(JSON.stringify({ type: 'error', message: 'Erro na conexão com IA' }));
      });

      openaiWs.addEventListener("close", () => {
        console.log("🔌 Conexão OpenAI fechada");
        socket.send(JSON.stringify({ type: 'disconnected', message: 'Conexão com IA encerrada' }));
      });

    } catch (error) {
      console.error("❌ Erro ao conectar OpenAI:", error);
      socket.send(JSON.stringify({ type: 'error', message: 'Falha ao conectar com IA' }));
    }
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Mensagem do cliente:", data.type);

      // Repassar mensagens do cliente para o OpenAI
      if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
        openaiWs.send(event.data);
      } else {
        console.error("❌ OpenAI WebSocket não está disponível");
        socket.send(JSON.stringify({ type: 'error', message: 'Conexão com IA indisponível' }));
      }
    } catch (error) {
      console.error("❌ Erro ao processar mensagem do cliente:", error);
    }
  });

  socket.addEventListener("close", () => {
    console.log("🔌 Cliente desconectado");
    if (openaiWs) {
      openaiWs.close();
    }
  });

  return response;
});