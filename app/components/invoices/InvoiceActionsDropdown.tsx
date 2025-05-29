'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Download,
  Mail,
  Archive,
  ArchiveRestore,
  Trash2,
  Share,
} from 'lucide-react';
import {
  deleteInvoice,
  duplicateInvoice,
  toggleArchiveInvoice,
  updateInvoiceStatus,
} from '@/app/invoices/actions';

interface Invoice {
  id: string;
  invoice_number: string;
  status: string;
  archived_at?: string | null;
  deleted_at?: string | null;
  customer_name?: string | null;
  customers?: { name: string }[] | null;
}

interface InvoiceActionsDropdownProps {
  invoice: Invoice;
  onInvoiceUpdate?: () => void;
}

export function InvoiceActionsDropdown({ 
  invoice, 
  onInvoiceUpdate 
}: InvoiceActionsDropdownProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('invoices.actions');
  const tCommon = useTranslations('common');

  const customerName = invoice.customers?.[0]?.name || invoice.customer_name || 'Unknown Customer';
  const isArchived = !!invoice.archived_at;
  const canEdit = invoice.status === 'draft' && !isArchived;

  const handleAction = async (action: () => Promise<any>, successMessage: string) => {
    setIsLoading(true);
    try {
      const result = await action();
      if (result.error) {
        toast({
          title: tCommon('error'),
          description: result.error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: tCommon('success'),
          description: successMessage,
        });
        onInvoiceUpdate?.();
      }
    } catch (error) {
      toast({
        title: tCommon('error'),
        description: tCommon('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = () => {
    router.push(`/invoices/${invoice.id}`);
  };

  const handleEdit = () => {
    router.push(`/invoices/${invoice.id}/edit`);
  };

  const handleDuplicate = () => {
    handleAction(
      () => duplicateInvoice(invoice.id),
      t('duplicateSuccess', { number: invoice.invoice_number })
    );
  };

  const handleArchiveToggle = () => {
    handleAction(
      () => toggleArchiveInvoice(invoice.id, !isArchived),
      isArchived 
        ? t('unarchiveSuccess', { number: invoice.invoice_number })
        : t('archiveSuccess', { number: invoice.invoice_number })
    );
  };

  const handleDelete = () => {
    handleAction(
      () => deleteInvoice(invoice.id),
      t('deleteSuccess', { number: invoice.invoice_number })
    );
    setIsDeleteDialogOpen(false);
  };

  const handleSendEmail = () => {
    // TODO: Implement email sending
    toast({
      title: tCommon('comingSoon'),
      description: t('emailFeatureComingSoon'),
    });
  };

  const handleShare = () => {
    // TODO: Implement public URL sharing
    toast({
      title: tCommon('comingSoon'),
      description: t('shareFeatureComingSoon'),
    });
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    toast({
      title: tCommon('comingSoon'),
      description: t('downloadFeatureComingSoon'),
    });
  };

  const handleMarkAsSent = () => {
    handleAction(
      () => updateInvoiceStatus(invoice.id, 'sent'),
      t('markAsSentSuccess', { number: invoice.invoice_number })
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={isLoading}
            aria-label={t('openActionsMenu')}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            {t('view')}
          </DropdownMenuItem>
          
          {canEdit && (
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {t('edit')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            {t('duplicate')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            {t('downloadPdf')}
          </DropdownMenuItem>
          
          {invoice.status === 'draft' && (
            <DropdownMenuItem onClick={handleMarkAsSent}>
              <Mail className="h-4 w-4 mr-2" />
              {t('markAsSent')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={handleSendEmail}>
            <Mail className="h-4 w-4 mr-2" />
            {t('sendEmail')}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleShare}>
            <Share className="h-4 w-4 mr-2" />
            {t('sharePublicLink')}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleArchiveToggle}>
            {isArchived ? (
              <>
                <ArchiveRestore className="h-4 w-4 mr-2" />
                {t('unarchive')}
              </>
            ) : (
              <>
                <Archive className="h-4 w-4 mr-2" />
                {t('archive')}
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription', { 
                number: invoice.invoice_number,
                customer: customerName 
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? tCommon('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
