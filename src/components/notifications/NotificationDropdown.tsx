'use client';

import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Loader2 } from 'lucide-react';

interface NotificationDropdownProps {
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationDropdown({ onClose, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=20');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
        
        // Update unread count
        const unreadCount = notifications.filter(n => !n.isRead && n.id !== id).length;
        onUnreadCountChange(unreadCount);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Update unread count
        const deletedNotification = notifications.find(n => n.id === id);
        if (deletedNotification && !deletedNotification.isRead) {
          const unreadCount = notifications.filter(n => !n.isRead && n.id !== id).length;
          onUnreadCountChange(unreadCount);
        }
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  async function handleMarkAllRead() {
    try {
      setIsMarkingAllRead(true);
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        onUnreadCountChange(0);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingAllRead(false);
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="absolute right-0 top-12 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-lg shadow-2xl shadow-cyan-500/10 z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div>
          <h3 className="text-white font-bold font-orbitron">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingAllRead}
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-900/20 text-xs"
          >
            {isMarkingAllRead ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </>
            )}
          </Button>
        )}
      </div>

      {/* Notifications list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-400 text-sm">No notifications yet</p>
          <p className="text-gray-500 text-xs mt-1">We'll let you know when something happens!</p>
        </div>
      ) : (
        <ScrollArea className="max-h-[500px]">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
            />
          ))}
        </ScrollArea>
      )}
    </div>
  );
}

