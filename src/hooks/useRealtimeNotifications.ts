import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

export interface RealtimeNotification {
  id: string;
  type: 'new_lead' | 'new_message' | 'appointment_reminder' | 'task_due' | 'system';
  title: string;
  message: string;
  data?: any;
  created_at: string;
  read: boolean;
  empresa_id: string;
}

export const useRealtimeNotifications = () => {
  const { empresaId, user } = useAuth();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    if (!empresaId || !user?.id) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('empresa_id', empresaId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    setNotifications(data || []);
    setUnreadCount((data || []).filter(n => !n.read).length);
  }, [empresaId, user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
      return;
    }

    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!empresaId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('empresa_id', empresaId)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  }, [empresaId]);

  // Create notification
  const createNotification = useCallback(async (
    type: RealtimeNotification['type'],
    title: string,
    message: string,
    data?: any
  ) => {
    if (!empresaId) return;

    const notification: Omit<RealtimeNotification, 'id' | 'created_at' | 'read'> = {
      type,
      title,
      message,
      data,
      empresa_id: empresaId
    };

    const { error } = await supabase
      .from('notifications')
      .insert([notification]);

    if (error) {
      console.error('Error creating notification:', error);
    }
  }, [empresaId]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!empresaId) return;

    // Subscribe to notifications table
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          const newNotification = payload.new as RealtimeNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000,
          });
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to new leads
    const leadsChannel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'novos_leads',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          const newLead = payload.new;
          createNotification(
            'new_lead',
            'Novo Lead',
            `${newLead.name || 'Novo lead'} foi adicionado`,
            newLead
          );
        }
      )
      .subscribe();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'memoria_ai',
          filter: `empresa_id=eq.${empresaId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          if (newMessage.type === 'human') {
            createNotification(
              'new_message',
              'Nova Mensagem',
              `Nova mensagem de ${newMessage.session_id}`,
              newMessage
            );
          }
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotifications();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(leadsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [empresaId, fetchNotifications, createNotification]);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    createNotification,
    refresh: fetchNotifications,
  };
};

// Hook for push notifications (if supported)
export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  };

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    showNotification,
  };
};