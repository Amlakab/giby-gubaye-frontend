'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

export interface NotificationItem {
  _id: string;
  message: string;
  link: string;
  read: boolean;
  role: string;
  createdAt: string;
  creator?: {
    name: string;
    email: string;
    role: string;
  };
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (message: string, link: string, role: string) => Promise<void>;
  addNotificationToRoles: (message: string, link: string, roles: string[]) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001/api';

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping notification fetch');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/unread`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.data.notifications || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping unread count fetch');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.count || 0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, [API_BASE_URL]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  const addNotification = async (message: string, link: string, role: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, link, role })
      });

      if (!response.ok) {
        throw new Error('Failed to add notification');
      }

      await refreshNotifications();
    } catch (error) {
      console.error('Failed to add notification:', error);
      throw error;
    }
  };

  const addNotificationToRoles = async (message: string, link: string, roles: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message, link, roles })
      });

      if (!response.ok) {
        throw new Error('Failed to add notifications to roles');
      }

      await refreshNotifications();
    } catch (error) {
      console.error('Failed to add notifications to roles:', error);
      throw error;
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/mark-as-read/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const notificationToDelete = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notificationToDelete && !notificationToDelete.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    refreshNotifications();

    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshNotifications, fetchUnreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        addNotification,
        addNotificationToRoles,
        markAsRead,
        deleteNotification,
        markAllAsRead,
        fetchNotifications,
        fetchUnreadCount,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};