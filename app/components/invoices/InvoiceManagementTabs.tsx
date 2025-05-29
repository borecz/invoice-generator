'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Archive,
  Trash2,
  Plus,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { InvoiceActionsDropdown } from './InvoiceActionsDropdown';
import {
  getInvoicesForUser,
  getArchivedInvoices,
  getDeletedInvoices,
  restoreInvoice,
  permanentlyDeleteInvoice,
} from '@/app/invoices/actions';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name?: string | null;
  customers?: { name: string }[] | null;
  invoice_date: string;
  total_amount: number;
  status: string;
  deleted_at?: string | null;
  archived_at?: string | null;
}

export function InvoiceManagementTabs() {
  const [activeTab, setActiveTab] = useState('active');
  const [activeInvoices, setActiveInvoices] = useState<Invoice[]>([]);
  const [archivedInvoices, setArchivedInvoices] = useState<Invoice[]>([]);
  const [deletedInvoices, setDeletedInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('invoices');
  const tCommon = useTranslations('common');

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const [activeResult, archivedResult, deletedResult] = await Promise.all([
        getInvoicesForUser({ includeDeleted: false, includeArchived: false }),
        getArchivedInvoices(),
        getDeletedInvoices(),
      ]);

      if (activeResult.data) setActiveInvoices(activeResult.data);
      if (archivedResult.data) setArchivedInvoices(archivedResult.data);
      if (deletedResult.data) setDeletedInvoices(deletedResult.data);
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: t('failedToLoadInvoices'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleRestore = async (invoiceId: string) => {
    try {
      const result = await restoreInvoice(invoiceId);
      if (result.error) {
        toast({
          title: tCommon('error'),
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: tCommon('success'),
          description: t('invoiceRestored'),
        });
        loadInvoices();
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
    }
  };

  const handlePermanentDelete = async (invoiceId: string) => {
    try {
      const result = await permanentlyDeleteInvoice(invoiceId);
      if (result.error) {
        toast({
          title: tCommon('error'),
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: tCommon('success'),
          description: t('invoicePermanentlyDeleted'),
        });
        loadInvoices();
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'sent':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      case 'archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const InvoiceTable = ({ 
    invoices, 
    showActions = true, 
    showRestoreActions = false 
  }: { 
    invoices: Invoice[]; 
    showActions?: boolean;
    showRestoreActions?: boolean;
  }) => (
    <div className="space-y-4">
      {invoices.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('noInvoicesFound')}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'active' && t('createFirstInvoice')}
            {activeTab === 'archived' && t('noArchivedInvoices')}
            {activeTab === 'trash' && t('noDeletedInvoices')}
          </p>
          {activeTab === 'active' && (
            <Link href="/new">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                <Plus className="h-4 w-4 mr-2" />
                {t('createInvoice')}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table Header */}
          <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-500">
            <div>{t('invoiceNumber')}</div>
            <div>{t('customer')}</div>
            <div>{t('date')}</div>
            <div>{t('amount')}</div>
            <div>{t('status')}</div>
            <div>{t('actions')}</div>
          </div>

          {/* Invoice Rows */}
          {invoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors"
            >
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                <div className="md:col-span-1">
                  <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                  <p className="text-sm text-gray-500 md:hidden">
                    {invoice.customers?.[0]?.name || invoice.customer_name || t('noCustomer')}
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-gray-900">
                    {invoice.customers?.[0]?.name || invoice.customer_name || t('noCustomer')}
                  </p>
                </div>
                <div className="hidden md:block">
                  <p className="text-gray-900">{formatDate(invoice.invoice_date)}</p>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(invoice.total_amount)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusBadgeVariant(invoice.status) as any}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  {showRestoreActions ? (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestore(invoice.id)}
                      >
                        {t('restore')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handlePermanentDelete(invoice.id)}
                      >
                        {t('deletePermanently')}
                      </Button>
                    </div>
                  ) : showActions ? (
                    <InvoiceActionsDropdown 
                      invoice={invoice} 
                      onInvoiceUpdate={loadInvoices}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <CardTitle>{t('invoiceManagement')}</CardTitle>
            <CardDescription>{t('manageAllInvoices')}</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={loadInvoices} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t('filter')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              {t('export')}
            </Button>
            <Link href="/new">
              <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500">
                <Plus className="h-4 w-4 mr-2" />
                {t('newInvoice')}
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{t('active')}</span>
              <Badge variant="secondary" className="ml-1">
                {activeInvoices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center space-x-2">
              <Archive className="h-4 w-4" />
              <span>{t('archived')}</span>
              <Badge variant="secondary" className="ml-1">
                {archivedInvoices.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="trash" className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>{t('trash')}</span>
              <Badge variant="secondary" className="ml-1">
                {deletedInvoices.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <InvoiceTable invoices={activeInvoices} />
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            <InvoiceTable invoices={archivedInvoices} />
          </TabsContent>

          <TabsContent value="trash" className="mt-6">
            <InvoiceTable 
              invoices={deletedInvoices} 
              showActions={false}
              showRestoreActions={true}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
