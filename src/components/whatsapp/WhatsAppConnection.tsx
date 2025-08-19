import { useEffect, useState } from "react";
import { QrCode, Wifi, WifiOff, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WhatsAppConnectionProps {
  connectionStatus: 'disconnected' | 'connecting' | 'qr_ready' | 'authenticated' | 'connected';
  qrCode?: string;
}

export const WhatsAppConnection = ({ connectionStatus, qrCode }: WhatsAppConnectionProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (connectionStatus === 'connecting') {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  const getStatusInfo = () => {
    switch (connectionStatus) {
      case 'disconnected':
        return {
          icon: <WifiOff className="w-8 h-8 text-red-500" />,
          title: "WhatsApp Desconectado",
          description: "Conecte seu WhatsApp para começar a receber mensagens",
          badge: <Badge variant="destructive">Desconectado</Badge>
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />,
          title: `Conectando${dots}`,
          description: "Estabelecendo conexão com o WhatsApp Web",
          badge: <Badge variant="secondary">Conectando</Badge>
        };
      case 'qr_ready':
        return {
          icon: <QrCode className="w-8 h-8 text-blue-500" />,
          title: "Escaneie o QR Code",
          description: "Abra o WhatsApp no seu celular e escaneie o código",
          badge: <Badge variant="outline">Aguardando QR</Badge>
        };
      case 'authenticated':
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          title: "Autenticado",
          description: "WhatsApp autenticado, finalizando conexão...",
          badge: <Badge variant="secondary">Autenticado</Badge>
        };
      case 'connected':
        return {
          icon: <Wifi className="w-8 h-8 text-green-500" />,
          title: "Conectado",
          description: "WhatsApp conectado e pronto para uso",
          badge: <Badge variant="default">Conectado</Badge>
        };
      default:
        return {
          icon: <WifiOff className="w-8 h-8 text-gray-500" />,
          title: "Status Desconhecido",
          description: "Status da conexão não identificado",
          badge: <Badge variant="secondary">Desconhecido</Badge>
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {statusInfo.icon}
        </div>
        <div className="flex justify-center mb-2">
          {statusInfo.badge}
        </div>
        <CardTitle className="text-xl">{statusInfo.title}</CardTitle>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {connectionStatus === 'qr_ready' && qrCode && (
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg shadow-inner">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>
        )}

        {connectionStatus === 'qr_ready' && (
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Abra o WhatsApp no seu telefone
            </p>
            <p className="text-sm text-muted-foreground">
              2. Toque em Menu → WhatsApp Web
            </p>
            <p className="text-sm text-muted-foreground">
              3. Escaneie este código QR
            </p>
          </div>
        )}

        {connectionStatus === 'disconnected' && (
          <Button className="w-full" size="lg">
            <Wifi className="w-4 h-4 mr-2" />
            Conectar WhatsApp
          </Button>
        )}
      </CardContent>
    </Card>
  );
};