#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Notification type configurations
const notificationTypes = [
  // Invoice Management
  { type: 'invoice_created', category: 'invoice_management', priority: 'medium' },
  { type: 'invoice_sent', category: 'invoice_management', priority: 'medium' },
  { type: 'invoice_viewed', category: 'invoice_management', priority: 'low' },
  { type: 'invoice_paid', category: 'invoice_management', priority: 'high' },
  { type: 'invoice_overdue', category: 'invoice_management', priority: 'high' },
  { type: 'invoice_reminder_sent', category: 'invoice_management', priority: 'low' },
  { type: 'invoice_cancelled', category: 'invoice_management', priority: 'medium' },
  { type: 'invoice_updated', category: 'invoice_management', priority: 'low' },
  { type: 'partial_payment_received', category: 'invoice_management', priority: 'medium' },
  
  // Payment & Financial
  { type: 'payment_failed', category: 'payment_financial', priority: 'high' },
  { type: 'refund_processed', category: 'payment_financial', priority: 'medium' },
  { type: 'payment_method_expired', category: 'payment_financial', priority: 'medium' },
  { type: 'monthly_revenue_summary', category: 'payment_financial', priority: 'low' },
  { type: 'tax_deadline_reminder', category: 'payment_financial', priority: 'high' },
  
  // System & Account
  { type: 'subscription_renewal', category: 'system_account', priority: 'medium' },
  { type: 'subscription_expiring', category: 'system_account', priority: 'high' },
  { type: 'plan_upgrade_available', category: 'system_account', priority: 'low' },
  { type: 'storage_limit_warning', category: 'system_account', priority: 'medium' },
  { type: 'backup_completed', category: 'system_account', priority: 'low' },
  { type: 'security_alert', category: 'system_account', priority: 'high' },
  
  // Business Intelligence
  { type: 'weekly_business_summary', category: 'business_intelligence', priority: 'low' },
  { type: 'goal_achievement', category: 'business_intelligence', priority: 'medium' },
  { type: 'trend_alert', category: 'business_intelligence', priority: 'medium' },
  { type: 'customer_milestone', category: 'business_intelligence', priority: 'low' },
  
  // Integration & Automation
  { type: 'integration_connected', category: 'integration_automation', priority: 'low' },
  { type: 'integration_failed', category: 'integration_automation', priority: 'high' },
  { type: 'automation_triggered', category: 'integration_automation', priority: 'low' },
  { type: 'data_export_ready', category: 'integration_automation', priority: 'medium' },
  
  // Compliance & Legal
  { type: 'tax_rate_update', category: 'compliance_legal', priority: 'medium' },
  { type: 'compliance_reminder', category: 'compliance_legal', priority: 'high' },
  { type: 'document_retention_alert', category: 'compliance_legal', priority: 'medium' },
];

// Sample data generators
const generateInvoiceNumber = () => `INV-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
const generateAmount = () => `$${(Math.random() * 5000 + 100).toFixed(2)}`;
const generateCustomerName = () => {
  const names = ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Brown', 'Lisa Garcia', 'Robert Taylor', 'Jennifer Davis'];
  return names[Math.floor(Math.random() * names.length)];
};

const generateContextData = (type: string) => {
  const baseData: Record<string, any> = {};
  
  switch (type) {
    case 'invoice_created':
    case 'invoice_sent':
    case 'invoice_viewed':
    case 'invoice_paid':
    case 'invoice_overdue':
    case 'invoice_reminder_sent':
    case 'invoice_cancelled':
    case 'invoice_updated':
    case 'partial_payment_received':
      baseData.invoiceNumber = generateInvoiceNumber();
      baseData.customerName = generateCustomerName();
      baseData.amount = generateAmount();
      if (type === 'invoice_overdue') {
        baseData.daysOverdue = Math.floor(Math.random() * 30) + 1;
      }
      break;
      
    case 'payment_failed':
    case 'refund_processed':
      baseData.invoiceNumber = generateInvoiceNumber();
      baseData.amount = generateAmount();
      break;
      
    case 'payment_method_expired':
      baseData.customerName = generateCustomerName();
      break;
      
    case 'monthly_revenue_summary':
      baseData.month = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      break;
      
    case 'tax_deadline_reminder':
    case 'compliance_reminder':
      baseData.deadline = new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString();
      if (type === 'compliance_reminder') {
        baseData.requirement = ['VAT Filing', 'Annual Report', 'Tax Return', 'Business License Renewal'][Math.floor(Math.random() * 4)];
      }
      break;
      
    case 'subscription_renewal':
      baseData.planName = ['Pro', 'Enterprise', 'Premium'][Math.floor(Math.random() * 3)];
      break;
      
    case 'subscription_expiring':
      baseData.daysLeft = Math.floor(Math.random() * 7) + 1;
      break;
      
    case 'storage_limit_warning':
      baseData.percentage = Math.floor(Math.random() * 20) + 80;
      break;
      
    case 'security_alert':
      baseData.location = ['New York, US', 'London, UK', 'Tokyo, JP', 'Sydney, AU'][Math.floor(Math.random() * 4)];
      break;
      
    case 'weekly_business_summary':
      baseData.date = new Date().toLocaleDateString();
      break;
      
    case 'goal_achievement':
      baseData.goalType = ['revenue', 'invoice count', 'customer acquisition'][Math.floor(Math.random() * 3)];
      break;
      
    case 'trend_alert':
      baseData.metric = ['revenue', 'invoice volume', 'payment delays', 'customer growth'][Math.floor(Math.random() * 4)];
      break;
      
    case 'customer_milestone':
      baseData.customerName = generateCustomerName();
      baseData.duration = ['1 year', '2 years', '6 months', '3 years'][Math.floor(Math.random() * 4)];
      break;
      
    case 'integration_connected':
    case 'integration_failed':
      baseData.serviceName = ['QuickBooks', 'Stripe', 'PayPal', 'Xero', 'Zapier'][Math.floor(Math.random() * 5)];
      break;
      
    case 'automation_triggered':
      baseData.automationName = ['Monthly Invoice Reminder', 'Overdue Payment Alert', 'Customer Welcome Email'][Math.floor(Math.random() * 3)];
      break;
      
    case 'data_export_ready':
      baseData.exportType = ['Invoice Report', 'Customer Data', 'Financial Summary'][Math.floor(Math.random() * 3)];
      break;
      
    case 'tax_rate_update':
      baseData.region = ['California', 'New York', 'Texas', 'Florida'][Math.floor(Math.random() * 4)];
      break;
      
    case 'document_retention_alert':
      baseData.period = ['2023', 'Q4 2023', 'January 2024'][Math.floor(Math.random() * 3)];
      break;
  }
  
  return baseData;
};

const generateTitle = (type: string, contextData: Record<string, any>) => {
  const titles: Record<string, string> = {
    'invoice_created': 'Invoice Created',
    'invoice_sent': 'Invoice Sent',
    'invoice_viewed': 'Invoice Viewed',
    'invoice_paid': 'Payment Received',
    'invoice_overdue': 'Invoice Overdue',
    'invoice_reminder_sent': 'Reminder Sent',
    'invoice_cancelled': 'Invoice Cancelled',
    'invoice_updated': 'Invoice Updated',
    'partial_payment_received': 'Partial Payment',
    'payment_failed': 'Payment Failed',
    'refund_processed': 'Refund Processed',
    'payment_method_expired': 'Payment Method Expired',
    'monthly_revenue_summary': 'Monthly Revenue Summary',
    'tax_deadline_reminder': 'Tax Deadline Reminder',
    'subscription_renewal': 'Subscription Renewed',
    'subscription_expiring': 'Subscription Expiring',
    'plan_upgrade_available': 'Upgrade Available',
    'storage_limit_warning': 'Storage Limit Warning',
    'backup_completed': 'Backup Completed',
    'security_alert': 'Security Alert',
    'weekly_business_summary': 'Weekly Summary',
    'goal_achievement': 'Goal Achieved',
    'trend_alert': 'Trend Alert',
    'customer_milestone': 'Customer Milestone',
    'integration_connected': 'Integration Connected',
    'integration_failed': 'Integration Failed',
    'automation_triggered': 'Automation Triggered',
    'data_export_ready': 'Export Ready',
    'tax_rate_update': 'Tax Rate Update',
    'compliance_reminder': 'Compliance Reminder',
    'document_retention_alert': 'Document Retention',
  };
  
  return titles[type] || 'Notification';
};

const generateMessage = (type: string, contextData: Record<string, any>) => {
  const interpolateMessage = (template: string, data: Record<string, any>) => {
    let message = template;
    Object.entries(data).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), String(value));
    });
    return message;
  };

  const templates: Record<string, string> = {
    'invoice_created': 'Invoice #{invoiceNumber} has been created successfully',
    'invoice_sent': 'Invoice #{invoiceNumber} has been sent to {customerName}',
    'invoice_viewed': '{customerName} has viewed invoice #{invoiceNumber}',
    'invoice_paid': 'Payment of {amount} received for invoice #{invoiceNumber}',
    'invoice_overdue': 'Invoice #{invoiceNumber} is now {daysOverdue} days overdue',
    'invoice_reminder_sent': 'Payment reminder sent for invoice #{invoiceNumber}',
    'invoice_cancelled': 'Invoice #{invoiceNumber} has been cancelled',
    'invoice_updated': 'Invoice #{invoiceNumber} has been updated',
    'partial_payment_received': 'Partial payment of {amount} received for invoice #{invoiceNumber}',
    'payment_failed': 'Payment attempt failed for invoice #{invoiceNumber}',
    'refund_processed': 'Refund of {amount} has been processed for invoice #{invoiceNumber}',
    'payment_method_expired': '{customerName}\'s payment method has expired',
    'monthly_revenue_summary': 'Your revenue summary for {month} is ready',
    'tax_deadline_reminder': 'Tax filing deadline is approaching on {deadline}',
    'subscription_renewal': 'Your {planName} subscription has been renewed',
    'subscription_expiring': 'Your subscription expires in {daysLeft} days',
    'plan_upgrade_available': 'Consider upgrading to unlock more features',
    'storage_limit_warning': 'You\'re using {percentage}% of your storage limit',
    'backup_completed': 'Your data backup has been completed successfully',
    'security_alert': 'Suspicious login attempt detected from {location}',
    'weekly_business_summary': 'Your business summary for week ending {date} is ready',
    'goal_achievement': 'Congratulations! You\'ve reached your {goalType} goal',
    'trend_alert': 'Significant change detected in your {metric}',
    'customer_milestone': '{customerName} has been with you for {duration}',
    'integration_connected': '{serviceName} has been successfully connected',
    'integration_failed': 'Connection to {serviceName} has failed',
    'automation_triggered': '{automationName} has been executed successfully',
    'data_export_ready': 'Your {exportType} export is ready for download',
    'tax_rate_update': 'Tax rates have been updated for {region}',
    'compliance_reminder': '{requirement} deadline is approaching on {deadline}',
    'document_retention_alert': 'Documents from {period} need to be archived',
  };

  const template = templates[type] || 'Notification message';
  return interpolateMessage(template, contextData);
};

async function generateNotificationsForUser(userEmail: string, count: number = 20) {
  console.log(`Generating ${count} notifications for user: ${userEmail}`);

  // Get user by email
  const { data: user, error: userError } = await supabase.auth.admin.listUsers();
  
  if (userError) {
    console.error('Error fetching users:', userError);
    return;
  }

  const targetUser = user.users.find(u => u.email === userEmail);
  if (!targetUser) {
    console.error(`User with email ${userEmail} not found`);
    return;
  }

  console.log(`Found user: ${targetUser.id}`);

  // Generate notifications
  const notifications = [];
  
  for (let i = 0; i < count; i++) {
    const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const contextData = generateContextData(notificationType.type);
    
    // Get quick actions from database
    const { data: typeData } = await supabase
      .from('notification_types')
      .select('default_quick_actions')
      .eq('type', notificationType.type)
      .single();

    const notification = {
      user_id: targetUser.id,
      type: notificationType.type,
      category: notificationType.category,
      title: generateTitle(notificationType.type, contextData),
      message: generateMessage(notificationType.type, contextData),
      priority: notificationType.priority,
      status: Math.random() > 0.3 ? 'unread' : 'read', // 70% unread, 30% read
      context_data: contextData,
      quick_actions: typeData?.default_quick_actions || [],
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 7 days
    };

    notifications.push(notification);
  }

  // Insert notifications
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error inserting notifications:', error);
    return;
  }

  console.log(`Successfully generated ${count} notifications for ${userEmail}`);
}

// Main execution
async function main() {
  const userEmail = process.argv[2];
  const count = parseInt(process.argv[3]) || 20;

  if (!userEmail) {
    console.error('Usage: tsx scripts/generate-notifications.ts <user-email> [count]');
    console.error('Example: tsx scripts/generate-notifications.ts user@example.com 25');
    process.exit(1);
  }

  await generateNotificationsForUser(userEmail, count);
}

if (require.main === module) {
  main().catch(console.error);
}
