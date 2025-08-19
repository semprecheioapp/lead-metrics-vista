import { useState } from "react";
import { Bell, Check, CheckCheck, Settings, Trash2, Clock, AlertTriangle, Info, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { NotificationSettings } from "./NotificationSettings";

const getNotificationIcon = (tipo: Notification['tipo']) => {
  switch (tipo) {
    case 'lead_urgente':
      return <Zap className="h-4 w-4" />;
    case 'followup_atrasado':
      return <Clock className="h-4 w-4" />;
    case 'oportunidade':
      return <Target className="h-4 w-4" />;
    case 'meta_performance':
      return <Info className="h-4 w-4" />;
    case 'problema_critico':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getUrgencyColor = (urgencia: Notification['urgencia']) => {
  switch (urgencia) {
    case 'critica':
      return 'destructive';
    case 'alta':
      return 'destructive';
    case 'media':
      return 'secondary';
    case 'baixa':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getNotificationTypeLabel = (tipo: Notification['tipo']) => {
  switch (tipo) {
    case 'lead_urgente':
      return 'Lead Urgente';
    case 'followup_atrasado':
      return 'Follow-up Atrasado';
    case 'oportunidade':
      return 'Oportunidade';
    case 'meta_performance':
      return 'Meta & Performance';
    case 'problema_critico':
      return 'Problema Crítico';
    default:
      return tipo;
  }
};

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { notifications, unreadCount, urgentCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const { toast } = useToast();

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead.mutateAsync(notificationId);
      toast({
        title: "Notificação marcada como lida",
      });
    } catch (error) {
      toast({
        title: "Erro ao marcar notificação",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
      toast({
        title: "Todas as notificações marcadas como lidas",
      });
    } catch (error) {
      toast({
        title: "Erro ao marcar todas as notificações",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification.mutateAsync(notificationId);
      toast({
        title: "Notificação removida",
      });
    } catch (error) {
      toast({
        title: "Erro ao remover notificação",
        description: "Tente novamente",
        variant: "destructive",
      });
    }
  };

  if (showSettings) {
    return (
      <>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant={urgentCount > 0 ? "destructive" : "secondary"} 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-[20px]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
        </Popover>
        <NotificationSettings 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant={urgentCount > 0 ? "destructive" : "secondary"} 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs min-w-[20px]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 z-[99999] bg-background border shadow-2xl" align="end" sideOffset={8}>
        <Card className="bg-background border-0 shadow-none">
          <CardHeader className="pb-3 bg-background">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-foreground">Notificações</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="h-8 w-8 p-0"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="h-8 px-2"
                    disabled={markAllAsRead.isPending}
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Marcar todas
                  </Button>
                )}
              </div>
            </div>
            {unreadCount > 0 && (
              <div className="text-sm text-muted-foreground">
                {unreadCount} não lidas
                {urgentCount > 0 && (
                  <span className="text-destructive ml-2">
                    • {urgentCount} urgentes
                  </span>
                )}
              </div>
            )}
          </CardHeader>
          <Separator />
          <CardContent className="p-0 bg-background">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b last:border-b-0 transition-colors bg-background ${
                        !notification.lida ? 'bg-primary/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${
                          notification.urgencia === 'critica' ? 'bg-destructive/10 text-destructive' :
                          notification.urgencia === 'alta' ? 'bg-orange-100 text-orange-600' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {getNotificationIcon(notification.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  {getNotificationTypeLabel(notification.tipo)}
                                </span>
                                <Badge variant={getUrgencyColor(notification.urgencia)} className="text-xs py-0">
                                  {notification.urgencia}
                                </Badge>
                              </div>
                              <h4 className="text-sm font-medium mb-1 leading-tight text-foreground">
                                {notification.titulo}
                              </h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {notification.mensagem}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(notification.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </span>
                                <div className="flex items-center gap-1">
                                  {!notification.lida && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      disabled={markAsRead.isPending}
                                      className="h-6 w-6 p-0"
                                    >
                                      <Check className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteNotification(notification.id)}
                                    disabled={deleteNotification.isPending}
                                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};