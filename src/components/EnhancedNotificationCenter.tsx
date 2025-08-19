import React from 'react';
import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useMobileDetection } from '@/lib/animations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationCenterProps {
  className?: string;
}

const NotificationIcon: React.FC<{ type: string }> = ({ type }) => {
  const icons = {
    new_lead: '🎯',
    new_message: '💬',
    appointment_reminder: '📅',
    task_due: '⚡',
    system: '🔔'
  };
  
  return <span className="text-lg">{icons[type as keyof typeof icons] || icons.system}</span>;
};

export const EnhancedNotificationCenter: React.FC<NotificationCenterProps> = ({ 
  className 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isMobile } = useMobileDetection();
  const {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refresh
  } = useRealtimeNotifications();

  const unreadNotifications = notifications.filter(n => !n.read);
  const recentNotifications = notifications.slice(0, 10);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Overlay for mobile */}
          {isMobile && (
            <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setIsOpen(false)}
            />
          )}

          {/* Panel */}
          <Card className={`
            absolute right-0 mt-2 w-80 z-50
            ${isMobile ? 'fixed top-16 left-4 right-4 bottom-4' : ''}
            shadow-lg
          `}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">Notificações</h3>
                <Badge variant="secondary" className="text-xs">
                  {unreadCount} novas
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Marcar todas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Connection Status */}
            {!isConnected && (
              <div className="px-4 py-2 bg-amber-50 text-amber-800 text-xs">
                Conectando...
              </div>
            )}

            {/* Notifications List */}
            <ScrollArea className={`${isMobile ? 'h-[calc(100%-120px)]' : 'h-96'}`}>
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Nenhuma notificação no momento</p>
                </div>
              ) : (
                <div className="divide-y">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  refresh();
                  setIsOpen(false);
                }}
              >
                Ver todas as notificações
              </Button>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};