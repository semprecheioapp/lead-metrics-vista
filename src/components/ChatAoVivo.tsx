import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChat } from "@/utils/RealtimeAudio";
import {
  MessageSquare,
  Mic,
  MicOff,
  Send,
  Phone,
  PhoneOff,
  Bot,
  User,
  Volume2,
  VolumeX
} from "lucide-react";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

export const ChatAoVivo = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("Desconectado");
  const [isConnecting, setIsConnecting] = useState(false);
  
  const chatRef = useRef<RealtimeChat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleMessage = (data: any) => {
    console.log("📩 Mensagem processada:", data.type);

    switch (data.type) {
      case 'connected':
        setConnectionStatus("Conectado");
        addMessage({
          type: 'system',
          content: '✅ Chat conectado! Você pode conversar por voz ou texto.',
        });
        break;

      case 'disconnected':
        setConnectionStatus("Desconectado");
        addMessage({
          type: 'system',
          content: '🔌 Chat desconectado.',
        });
        break;

      case 'error':
        setConnectionStatus("Erro");
        addMessage({
          type: 'system',
          content: `❌ Erro: ${data.message}`,
        });
        break;

      case 'session.created':
        console.log("🎉 Sessão criada");
        break;

      case 'session.updated':
        console.log("⚙️ Sessão atualizada");
        break;

      case 'input_audio_buffer.speech_started':
        console.log("🎤 Fala detectada");
        break;

      case 'input_audio_buffer.speech_stopped':
        console.log("🛑 Fala parou");
        break;

      case 'response.created':
        console.log("🤖 IA começou a responder");
        setIsSpeaking(true);
        break;

      case 'response.done':
        console.log("✅ IA terminou de responder");
        setIsSpeaking(false);
        break;

      case 'response.audio.delta':
        // Áudio sendo reproduzido automaticamente pelo RealtimeAudio
        setIsSpeaking(true);
        break;

      case 'response.audio.done':
        setIsSpeaking(false);
        break;

      case 'response.audio_transcript.delta':
        // Acumular transcrição da resposta da IA
        if (data.delta) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.type === 'assistant' && !lastMessage.content.includes('🔄')) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + data.delta }
              ];
            } else {
              return [...prev, {
                id: crypto.randomUUID(),
                type: 'assistant' as const,
                content: data.delta,
                timestamp: new Date(),
                isAudio: true
              }];
            }
          });
        }
        break;

      case 'response.text.delta':
        if (data.delta) {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.type === 'assistant' && !lastMessage.content.includes('🔄')) {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + data.delta }
              ];
            } else {
              return [...prev, {
                id: crypto.randomUUID(),
                type: 'assistant' as const,
                content: data.delta,
                timestamp: new Date(),
                isAudio: false
              }];
            }
          });
        }
        break;

      case 'conversation.item.input_audio_transcription.completed':
        // Transcrição do que o usuário falou
        if (data.transcript) {
          addMessage({
            type: 'user',
            content: data.transcript,
            isAudio: true
          });
        }
        break;
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    setIsConnecting(false);
    
    if (connected) {
      setConnectionStatus("Conectado");
      toast({
        title: "✅ Conectado",
        description: "Chat ao vivo está pronto para uso!",
      });
    } else {
      setConnectionStatus("Desconectado");
      setIsRecording(false);
      setIsSpeaking(false);
    }
  };

  const connectChat = async () => {
    try {
      setIsConnecting(true);
      setConnectionStatus("Conectando...");
      
      chatRef.current = new RealtimeChat(handleMessage, handleConnectionChange);
      await chatRef.current.connect();
      
    } catch (error) {
      console.error("❌ Erro ao conectar:", error);
      setIsConnecting(false);
      setConnectionStatus("Erro");
      toast({
        title: "❌ Erro de Conexão",
        description: "Não foi possível conectar ao chat. Verifique sua conexão.",
        variant: "destructive",
      });
    }
  };

  const disconnectChat = () => {
    if (chatRef.current) {
      chatRef.current.disconnect();
      chatRef.current = null;
    }
    setMessages([]);
  };

  const toggleRecording = async () => {
    if (!chatRef.current || !isConnected) return;

    try {
      if (isRecording) {
        chatRef.current.stopAudioRecording();
        setIsRecording(false);
        toast({
          title: "🛑 Gravação Parada",
          description: "Microfone desligado",
        });
      } else {
        await chatRef.current.startAudioRecording();
        setIsRecording(true);
        toast({
          title: "🎤 Gravação Iniciada",
          description: "Fale para conversar com a IA",
        });
      }
    } catch (error) {
      console.error("❌ Erro no microfone:", error);
      toast({
        title: "❌ Erro no Microfone",
        description: "Verifique as permissões de áudio",
        variant: "destructive",
      });
    }
  };

  const sendTextMessage = () => {
    if (!inputMessage.trim() || !chatRef.current || !isConnected) return;

    try {
      addMessage({
        type: 'user',
        content: inputMessage,
        isAudio: false
      });

      chatRef.current.sendTextMessage(inputMessage);
      setInputMessage("");
    } catch (error) {
      console.error("❌ Erro ao enviar mensagem:", error);
      toast({
        title: "❌ Erro ao Enviar",
        description: "Não foi possível enviar a mensagem",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Chat Interface */}
      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat ao Vivo com IA
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                  {connectionStatus}
                </Badge>
                {isSpeaking && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    <Volume2 className="w-3 h-3 mr-1" />
                    IA falando
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col gap-4 p-4">
            {/* Messages */}
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Conecte-se para começar a conversar com a IA</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.type !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {message.type === 'assistant' ? (
                          <Bot className="w-4 h-4 text-primary" />
                        ) : (
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'assistant'
                          ? 'bg-accent'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                        <span>
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.isAudio && (
                          <Volume2 className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                    
                    {message.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className="flex-1"
                />
                <Button
                  onClick={sendTextMessage}
                  disabled={!isConnected || !inputMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={toggleRecording}
                  disabled={!isConnected}
                  variant={isRecording ? "destructive" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 mr-2" />
                      Parar Gravação
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Falar com IA
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Panel */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Controles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button
                onClick={connectChat}
                disabled={isConnecting}
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                {isConnecting ? "Conectando..." : "Conectar Chat"}
              </Button>
            ) : (
              <Button
                onClick={disconnectChat}
                variant="destructive"
                className="w-full"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {messages.filter(m => m.type === 'user').length}
                </div>
                <div className="text-xs text-muted-foreground">Minhas Msgs</div>
              </div>
              <div className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-primary">
                  {messages.filter(m => m.type === 'assistant').length}
                </div>
                <div className="text-xs text-muted-foreground">Respostas IA</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Conexão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">WebSocket</span>
                <Badge variant={isConnected ? "default" : "secondary"}>
                  {isConnected ? "Conectado" : "Desconectado"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Microfone</span>
                <Badge variant={isRecording ? "default" : "secondary"}>
                  {isRecording ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">IA</span>
                <Badge variant={isSpeaking ? "default" : "secondary"}>
                  {isSpeaking ? "Falando" : "Ouvindo"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Use o botão de microfone para conversar por voz</p>
              <p>• Digite mensagens de texto quando preferir</p>
              <p>• A IA pode ajudar com leads, métricas e estratégias</p>
              <p>• Mantenha a conexão estável para melhor experiência</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};