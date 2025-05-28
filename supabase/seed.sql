-- Seed data for invoice generator application

-- Insert notification types
INSERT INTO notification_types (type, category, priority, description) VALUES
-- Invoice Management
('invoice_created', 'invoice_management', 'medium', 'New invoice has been created'),
('invoice_sent', 'invoice_management', 'medium', 'Invoice has been sent to customer'),
('invoice_viewed', 'invoice_management', 'low', 'Customer has viewed the invoice'),
('invoice_paid', 'invoice_management', 'high', 'Payment has been received for invoice'),
('invoice_overdue', 'invoice_management', 'high', 'Invoice payment is overdue'),
('invoice_reminder_sent', 'invoice_management', 'medium', 'Payment reminder has been sent'),
('invoice_cancelled', 'invoice_management', 'medium', 'Invoice has been cancelled'),
('invoice_updated', 'invoice_management', 'low', 'Invoice has been updated'),

-- Payment Processing
('payment_received', 'payment_processing', 'high', 'Payment has been received'),
('payment_failed', 'payment_processing', 'high', 'Payment processing failed'),
('partial_payment_received', 'payment_processing', 'medium', 'Partial payment received'),
('refund_processed', 'payment_processing', 'medium', 'Refund has been processed'),
('payment_method_expired', 'payment_processing', 'medium', 'Payment method has expired'),

-- System Notifications
('system_maintenance', 'system', 'medium', 'System maintenance notification'),
('feature_update', 'system', 'low', 'New feature announcement'),
('security_alert', 'system', 'high', 'Security-related alert'),
('backup_completed', 'system', 'low', 'Data backup completed'),
('export_ready', 'system', 'medium', 'Data export is ready for download'),

-- Business Intelligence
('monthly_report_ready', 'business_intelligence', 'medium', 'Monthly business report is ready'),
('revenue_milestone', 'business_intelligence', 'high', 'Revenue milestone achieved'),
('top_customer_alert', 'business_intelligence', 'medium', 'Top customer activity alert'),
('cash_flow_warning', 'business_intelligence', 'high', 'Cash flow warning'),

-- Integration Notifications
('api_limit_warning', 'integration', 'medium', 'API usage limit warning'),
('sync_completed', 'integration', 'low', 'Data synchronization completed'),
('sync_failed', 'integration', 'high', 'Data synchronization failed'),
('webhook_failed', 'integration', 'medium', 'Webhook delivery failed'),

-- Compliance & Legal
('tax_rate_update', 'compliance_legal', 'medium', 'Tax rate has been updated'),
('compliance_reminder', 'compliance_legal', 'high', 'Compliance deadline reminder'),
('document_retention_alert', 'compliance_legal', 'medium', 'Document retention policy alert')

ON CONFLICT (type) DO NOTHING;
