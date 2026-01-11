'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, CheckCircle, AlertCircle, Star, MessageSquare, Briefcase } from 'lucide-react';

interface Notification {
  id: string;
  userId: string;
  type: 'job' | 'application' | 'review';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

interface NotificationDropdownProps {
  userId: string;
  className?: string;
  locale?: 'en' | 'fr' | 'ar-TN';
}

const translations = {
  en: {
    notifications: 'Notifications',
    markAllRead: 'Mark all read',
    noNotifications: 'No notifications yet',
    justNow: 'Just now',
  },
  fr: {
    notifications: 'Notifications',
    markAllRead: 'Tout marquer lu',
    noNotifications: 'Pas encore de notifications',
    justNow: 'À l\'instant',
  },
  'ar-TN': {
    notifications: 'الإشعارات',
    markAllRead: 'تحديد الكل كمقروء',
    noNotifications: 'لا توجد إشعارات بعد',
    justNow: 'الآن',
  },
};

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, className = '', locale = 'en' }) => {
  const t = translations[locale];
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('/api/notifications', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        // Silently fail - notifications are non-critical
        if (process.env.NODE_ENV === 'development') {
          console.warn('Notifications fetch failed:', error instanceof Error ? error.message : 'Network error');
        }
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          notificationId,
          read: true
        }),
      });

      if (response.ok) {
        setNotifications(prev => prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'application':
        return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-amber-500" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-500" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return t.justNow;
    if (diffMins < 60) return locale === 'ar-TN' ? `منذ ${diffMins} د` : `${diffMins}m ago`;
    if (diffMins < 1440) return locale === 'ar-TN' ? `منذ ${Math.floor(diffMins / 60)} س` : `${Math.floor(diffMins / 60)}h ago`;
    return locale === 'ar-TN' ? `منذ ${Math.floor(diffMins / 1440)} ي` : `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute end-0 mt-2 w-80 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 z-50">
          <CardHeader className="pb-3">
            <div className={`flex items-center justify-between`}>
              <CardTitle className="text-sm">{t.notifications}</CardTitle>
              <div className={`flex gap-2`}>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    {t.markAllRead}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="text-center py-6 text-neutral-500 dark:text-neutral-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t.noNotifications}</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-neutral-100 dark:border-neutral-700 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id);
                      }
                      // Handle notification click based on type
                      if (notification.type === 'application' && notification.data?.jobId) {
                        window.location.href = '/customer/applications';
                      } else if (notification.type === 'job' && notification.data?.jobId) {
                        window.location.href = '/worker/dashboard';
                      }
                    }}
                  >
                    <div className={`flex items-start gap-3`}>
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`flex items-center justify-between mb-1`}>
                          <p className={`text-sm font-medium ${
                            !notification.read ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'
                          }`}>
                            {notification.title}
                          </p>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          !notification.read ? 'text-neutral-700 dark:text-neutral-300' : 'text-neutral-500 dark:text-neutral-400'
                        } line-clamp-2`}>
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="mt-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
