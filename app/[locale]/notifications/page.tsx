import { Suspense } from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/app/components/layout/Header';
import { NotificationsList } from '@/app/components/notifications/NotificationsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const t = useTranslations('notifications');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your invoice and business activities
          </p>
        </div>

        {/* Notifications Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              {t('title')}
            </CardTitle>
            <CardDescription>
              Manage your notifications and stay informed about important updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            }>
              <NotificationsList />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
