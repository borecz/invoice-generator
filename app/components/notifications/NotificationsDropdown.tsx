'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Bell,
  Clock,
  CheckCircle,
  X,
  AlertCircle,
  DollarSign,
  FileText,
  Settings,
  BarChart3,
  Zap,
  Shield,
  Eye,
  Send,
  CreditCard,
  Download,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import {
  getNotificationsForUser,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  dismissNotification,
  markNotificationAsActed,
  getNotificationCounts,
  type Notification
} from '@/app/notifications/actions';
import { cn } from '@/lib/utils';

interface NotificationsDropdownProps {
  pendingCount?: number;
  onCountUpdate?: (count: number) => void;
}

export function NotificationsDropdown({ pendingCount = 0, onCountUpdate }: NotificationsDropdownProps) {
  const t = useTranslations('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState({ total: 0, unread: 0, read: 0, dismissed: 0, acted_upon: 0 });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsResult, countsResult] = await Promise.all([
        getNotificationsForUser(8, 0, 'unread'), // Get 8 most recent unread notifications
        getNotificationCounts()
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (countsResult.data) {
        setCounts(countsResult.data);
        onCountUpdate?.(countsResult.data.unread);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('timeAgo.justNow');
    if (diffInMinutes === 1) return t('timeAgo.minuteAgo');
    if (diffInMinutes < 60) return t('timeAgo.minutesAgo', { minutes: diffInMinutes });

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) return t('timeAgo.hourAgo');
    if (diffInHours < 24) return t('timeAgo.hoursAgo', { hours: diffInHours });

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return t('timeAgo.dayAgo');
    if (diffInDays < 7) return t('timeAgo.daysAgo', { days: diffInDays });

    return new Date(dateString).toLocaleDateString();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice_management':
        return <FileText className="h-4 w-4" />;
      case 'payment_financial':
        return <DollarSign className="h-4 w-4" />;
      case 'system_account':
        return <Settings className="h-4 w-4" />;
      case 'business_intelligence':
        return <BarChart3 className="h-4 w-4" />;
      case 'integration_automation':
        return <Zap className="h-4 w-4" />;
      case 'compliance_legal':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20';
      case 'low':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const handleQuickAction = async (notification: Notification, action: string) => {
    try {
      // Mark as acted upon for most actions
      if (action !== 'dismiss') {
        await markNotificationAsActed(notification.id);
      }

      // Handle specific actions
      switch (action) {
        case 'view_invoice':
          if (notification.related_entity_id) {
            window.open(`/invoices/${notification.related_entity_id}`, '_blank');
          }
          break;
        case 'send_invoice':
          if (notification.related_entity_id) {
            window.open(`/invoices/${notification.related_entity_id}/send`, '_blank');
          }
          break;
        case 'view_customer':
          if (notification.related_entity_id) {
            window.open(`/customers/${notification.related_entity_id}`, '_blank');
          }
          break;
        case 'dismiss':
          await dismissNotification(notification.id);
          break;
        default:
          console.log(`Quick action: ${action}`);
      }

      // Reload notifications after action
      await loadNotifications();
    } catch (error) {
      console.error('Error handling quick action:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const interpolateMessage = (message: string, contextData: Record<string, any>) => {
    let interpolated = message;
    Object.entries(contextData).forEach(([key, value]) => {
      interpolated = interpolated.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return interpolated;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative min-w-[44px] min-h-[44px] p-2 focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-accent/50 transition-colors"
          aria-label={`Notifications${counts.unread > 0 ? ` (${counts.unread} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {counts.unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-orange-500 to-pink-500"
              aria-hidden="true"
            >
              {counts.unread > 99 ? '99+' : counts.unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-96 max-h-[80vh] overflow-hidden p-0"
        align="end"
        sideOffset={8}
        aria-label="Notifications dropdown"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-foreground">{t('title')}</h3>
            {counts.unread > 0 && (
              <Badge className="bg-gradient-to-r from-orange-500 to-pink-500">
                {counts.unread}
              </Badge>
            )}
          </div>
          {counts.unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t('markAllAsRead')}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 px-4">
              <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{t('noNotifications')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('noNotificationsDescription')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-accent/50 transition-colors cursor-pointer border-l-4",
                    getPriorityColor(notification.priority)
                  )}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                      {getCategoryIcon(notification.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {interpolateMessage(notification.message, notification.context_data)}
                      </p>

                      {/* Quick Actions */}
                      {notification.quick_actions && notification.quick_actions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {notification.quick_actions.slice(0, 2).map((action) => (
                            <Button
                              key={action}
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleQuickAction(notification, action);
                              }}
                              className="text-xs h-6 px-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-800 dark:hover:border-orange-700 dark:hover:bg-orange-950/20"
                            >
                              {action === 'view_invoice' && <Eye className="h-3 w-3 mr-1" />}
                              {action === 'send_invoice' && <Send className="h-3 w-3 mr-1" />}
                              {action === 'dismiss' && <X className="h-3 w-3 mr-1" />}
                              {t(`quickActions.${action}`)}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <DropdownMenuSeparator />
        <div className="p-3">
          <Link href="/notifications" onClick={() => setIsOpen(false)}>
            <Button
              variant="ghost"
              className="w-full justify-between text-sm hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 dark:hover:from-orange-950/20 dark:hover:to-pink-950/20"
            >
              <span>{t('dropdown.viewAllNotifications')}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
