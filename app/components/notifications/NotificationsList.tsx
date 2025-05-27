'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationItem } from './NotificationItem';
import { NotificationFilters } from './NotificationFilters';
import { getNotificationsForUser, markAllNotificationsAsRead, getNotificationCounts, type Notification } from '@/app/notifications/actions';
import { Bell, CheckCheck, Filter } from 'lucide-react';

interface NotificationCounts {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  acted_upon: number;
}

export function NotificationsList() {
  const t = useTranslations('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [counts, setCounts] = useState<NotificationCounts>({ total: 0, unread: 0, read: 0, dismissed: 0, acted_upon: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [notificationsResult, countsResult] = await Promise.all([
        getNotificationsForUser(50, 0, selectedStatus || undefined, selectedCategory || undefined),
        getNotificationCounts()
      ]);

      if (notificationsResult.data) {
        setNotifications(notificationsResult.data);
      }

      if (countsResult.data) {
        setCounts(countsResult.data);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [selectedStatus, selectedCategory]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      await loadNotifications(); // Reload to get updated data
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationUpdate = () => {
    loadNotifications(); // Reload notifications when one is updated
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return notification.status === 'unread';
    if (activeTab === 'read') return notification.status === 'read';
    return true; // 'all' tab shows everything
  });

  const categories = [
    { value: '', label: t('categories.all') },
    { value: 'invoice_management', label: t('categories.invoice_management') },
    { value: 'payment_financial', label: t('categories.payment_financial') },
    { value: 'system_account', label: t('categories.system_account') },
    { value: 'business_intelligence', label: t('categories.business_intelligence') },
    { value: 'integration_automation', label: t('categories.integration_automation') },
    { value: 'compliance_legal', label: t('categories.compliance_legal') },
  ];

  const statuses = [
    { value: '', label: t('categories.all') },
    { value: 'unread', label: t('status.unread') },
    { value: 'read', label: t('status.read') },
    { value: 'dismissed', label: t('status.dismissed') },
    { value: 'acted_upon', label: t('status.acted_upon') },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          {counts.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              {t('markAllAsRead')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            {counts.total}
          </Badge>
          {counts.unread > 0 && (
            <Badge className="bg-orange-500 hover:bg-orange-600">
              {counts.unread} {t('status.unread').toLowerCase()}
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <NotificationFilters
          categories={categories}
          statuses={statuses}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
        />
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            {t('categories.all')}
            <Badge variant="secondary" className="ml-1">
              {counts.total}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="flex items-center gap-2">
            {t('status.unread')}
            {counts.unread > 0 && (
              <Badge className="bg-orange-500 hover:bg-orange-600 ml-1">
                {counts.unread}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" className="flex items-center gap-2">
            {t('status.read')}
            <Badge variant="secondary" className="ml-1">
              {counts.read}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <NotificationContent 
            notifications={filteredNotifications} 
            onUpdate={handleNotificationUpdate}
          />
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <NotificationContent 
            notifications={filteredNotifications} 
            onUpdate={handleNotificationUpdate}
          />
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          <NotificationContent 
            notifications={filteredNotifications} 
            onUpdate={handleNotificationUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationContent({ 
  notifications, 
  onUpdate 
}: { 
  notifications: Notification[];
  onUpdate: () => void;
}) {
  const t = useTranslations('notifications');

  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {t('noNotifications')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {t('noNotificationsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
