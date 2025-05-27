'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  markNotificationAsRead, 
  dismissNotification, 
  markNotificationAsActed,
  type Notification 
} from '@/app/notifications/actions';
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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onUpdate: () => void;
}

export function NotificationItem({ notification, onUpdate }: NotificationItemProps) {
  const t = useTranslations('notifications');
  const [isProcessing, setIsProcessing] = useState(false);

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
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) return t('timeAgo.weekAgo');
    if (diffInWeeks < 4) return t('timeAgo.weeksAgo', { weeks: diffInWeeks });
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) return t('timeAgo.monthAgo');
    return t('timeAgo.monthsAgo', { months: diffInMonths });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice_management':
        return <FileText className="h-5 w-5" />;
      case 'payment_financial':
        return <DollarSign className="h-5 w-5" />;
      case 'system_account':
        return <Settings className="h-5 w-5" />;
      case 'business_intelligence':
        return <BarChart3 className="h-5 w-5" />;
      case 'integration_automation':
        return <Zap className="h-5 w-5" />;
      case 'compliance_legal':
        return <Shield className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'dismissed':
        return <X className="h-4 w-4" />;
      case 'acted_upon':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleMarkAsRead = async () => {
    if (notification.status === 'read') return;
    
    setIsProcessing(true);
    try {
      await markNotificationAsRead(notification.id);
      onUpdate();
    } catch (error) {
      console.error('Error marking as read:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = async () => {
    setIsProcessing(true);
    try {
      await dismissNotification(notification.id);
      onUpdate();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickAction = async (action: string) => {
    setIsProcessing(true);
    try {
      // Mark as acted upon for most actions
      if (action !== 'dismiss') {
        await markNotificationAsActed(notification.id);
      }
      
      // Handle specific actions
      switch (action) {
        case 'view_invoice':
          // Navigate to invoice view
          if (notification.related_entity_id) {
            window.open(`/invoices/${notification.related_entity_id}`, '_blank');
          }
          break;
        case 'send_invoice':
          // Navigate to send invoice
          if (notification.related_entity_id) {
            window.open(`/invoices/${notification.related_entity_id}/send`, '_blank');
          }
          break;
        case 'view_customer':
          // Navigate to customer view
          if (notification.related_entity_id) {
            window.open(`/customers/${notification.related_entity_id}`, '_blank');
          }
          break;
        case 'view_report':
          // Navigate to reports
          window.open('/reports', '_blank');
          break;
        case 'view_billing':
          // Navigate to billing settings
          window.open('/settings?tab=billing', '_blank');
          break;
        case 'contact_support':
          // Open support contact
          window.open('mailto:support@invoiceagent.com', '_blank');
          break;
        case 'dismiss':
          await handleDismiss();
          return; // Don't mark as acted upon for dismiss
        default:
          console.log(`Quick action: ${action}`);
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error handling quick action:', error);
    } finally {
      setIsProcessing(false);
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
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        notification.status === 'unread' && "border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20",
        notification.status === 'dismissed' && "opacity-60",
        isProcessing && "opacity-50 pointer-events-none"
      )}
      onClick={handleMarkAsRead}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn(
            "p-2 rounded-lg flex-shrink-0",
            notification.priority === 'high' ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" :
            notification.priority === 'medium' ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400" :
            "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
          )}>
            {getCategoryIcon(notification.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {notification.title}
                  </h3>
                  <Badge className={getPriorityColor(notification.priority)}>
                    {t(`priority.${notification.priority}`)}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {getStatusIcon(notification.status)}
                    {t(`status.${notification.status}`)}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {interpolateMessage(notification.message, notification.context_data)}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(notification.created_at)}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {t(`categories.${notification.category}`)}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {notification.quick_actions && notification.quick_actions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                {notification.quick_actions.slice(0, 4).map((action) => (
                  <Button
                    key={action}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickAction(action);
                    }}
                    disabled={isProcessing}
                    className="text-xs h-7 px-2"
                  >
                    {action === 'view_invoice' && <Eye className="h-3 w-3 mr-1" />}
                    {action === 'send_invoice' && <Send className="h-3 w-3 mr-1" />}
                    {action === 'view_details' && <ExternalLink className="h-3 w-3 mr-1" />}
                    {action === 'download_export' && <Download className="h-3 w-3 mr-1" />}
                    {action === 'dismiss' && <X className="h-3 w-3 mr-1" />}
                    {t(`quickActions.${action}`)}
                  </Button>
                ))}
                
                {notification.quick_actions.length > 4 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2 text-gray-500"
                  >
                    +{notification.quick_actions.length - 4} more
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
