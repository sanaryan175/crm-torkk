/**
 * useWebSocketNotifications - Real-time notification hook
 * Connects to WebSocket server for instant notification delivery
 * Falls back to polling if WebSocket unavailable
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface WebSocketNotification {
  id: string;
  title: string;
  body?: string;
  type: 'activity' | 'deal' | 'announcement' | 'approval' | 'system';
  relatedModel?: string;
  relatedId?: string;
  createdAt: string;
}

interface UseWebSocketNotificationsReturn {
  notifications: WebSocketNotification[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  unreadCount: number;
}

export function useWebSocketNotifications(): UseWebSocketNotificationsReturn {
  const [notifications, setNotifications] = useState<WebSocketNotification[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get token from localStorage
  const getToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }, []);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.statusText}`);
      }

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread || 0);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  }, [getToken]);

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const token = getToken();
        if (!token) return;

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/app-notifications/mark-read`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notificationIds: [notificationId] }),
          }
        );

        // Update local state
        setNotifications(notifs =>
          notifs.map(n => (n.id === notificationId ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [getToken, unreadCount]
  );

  // Delete notification
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const token = getToken();
        if (!token) return;

        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/app-notifications/${notificationId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        // Update local state
        setNotifications(notifs => notifs.filter(n => n.id !== notificationId));
      } catch (err) {
        console.error('Error deleting notification:', err);
      }
    },
    [getToken]
  );

  // Initialize WebSocket connection
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('No authentication token');
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchNotifications();

    try {
      // Connect to WebSocket
      const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000', {
        auth: { token },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      // Connection events
      socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        setError(null);

        // Clear polling interval if it exists
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
      });

      socket.on('disconnect', () => {
        console.log('👋 WebSocket disconnected');
        setIsConnected(false);

        // Start fallback polling
        if (!pollIntervalRef.current) {
          console.log('⏱️ Starting fallback polling (15 seconds)');
          pollIntervalRef.current = setInterval(() => {
            fetchNotifications();
          }, 15000);
        }
      });

      socket.on('connect_error', (error: any) => {
        console.error('❌ WebSocket connection error:', error);
        reconnectAttemptsRef.current += 1;

        if (reconnectAttemptsRef.current >= 3) {
          setError('WebSocket connection failed, using polling');
          // Start fallback polling
          if (!pollIntervalRef.current) {
            pollIntervalRef.current = setInterval(() => {
              fetchNotifications();
            }, 15000);
          }
        }
      });

      // Listen for new notifications
      socket.on('notification:new', (notification: WebSocketNotification) => {
        console.log('📬 New notification received:', notification);
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Optional: Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/icon.png',
            badge: '/badge.png',
          });
        }
      });

      // Listen for connection confirmation
      socket.on('connected', (data: any) => {
        console.log('✨ WebSocket authenticated:', data);
      });

      // Ping/pong for keep-alive
      socket.on('pong', () => {
        console.log('💓 Pong received');
      });

      // Periodically send ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping');
        }
      }, 25000);

      return () => {
        clearInterval(pingInterval);
        socket.disconnect();
      };
    } catch (err) {
      console.error('Error initializing WebSocket:', err);
      setError('Failed to initialize WebSocket');

      // Start fallback polling
      if (!pollIntervalRef.current) {
        console.log('⏱️ Starting fallback polling (15 seconds)');
        pollIntervalRef.current = setInterval(() => {
          fetchNotifications();
        }, 15000);
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [getToken, fetchNotifications]);

  // Request browser notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, []);

  return {
    notifications,
    isConnected,
    isLoading,
    error,
    markAsRead,
    deleteNotification,
    unreadCount,
  };
}
