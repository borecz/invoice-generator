-- Invoice Management Enhancements Migration
-- Adds soft delete, sharing, and tracking capabilities

-- Add new columns to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS public_url_token TEXT UNIQUE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS public_url_password TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS public_url_enabled BOOLEAN DEFAULT false;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_viewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_due_reminder_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS template_id TEXT DEFAULT 'default';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';

-- Create invoice_status_history table for tracking status changes
CREATE TABLE IF NOT EXISTS invoice_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    change_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_views table for tracking public views
CREATE TABLE IF NOT EXISTS invoice_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    viewer_ip TEXT,
    viewer_user_agent TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_duration_seconds INTEGER,
    referrer TEXT
);

-- Create invoice_emails table for tracking email sends
CREATE TABLE IF NOT EXISTS invoice_emails (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    subject TEXT NOT NULL,
    email_template_id TEXT DEFAULT 'default',
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    bounced_at TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create invoice_templates table for customizable templates
CREATE TABLE IF NOT EXISTS invoice_templates (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL DEFAULT '{}',
    is_default BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoices_archived_at ON invoices(archived_at);
CREATE INDEX IF NOT EXISTS idx_invoices_public_url_token ON invoices(public_url_token);
CREATE INDEX IF NOT EXISTS idx_invoices_email_sent_at ON invoices(email_sent_at);
CREATE INDEX IF NOT EXISTS idx_invoice_status_history_invoice_id ON invoice_status_history(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_views_invoice_id ON invoice_views(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_emails_invoice_id ON invoice_emails(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_emails_recipient_email ON invoice_emails(recipient_email);
CREATE INDEX IF NOT EXISTS idx_invoice_templates_user_id ON invoice_templates(user_id);

-- Update the status check constraint to include new statuses
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled', 'archived'));

-- Create updated_at triggers for new tables
CREATE TRIGGER update_invoice_templates_updated_at BEFORE UPDATE ON invoice_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security for new tables
ALTER TABLE invoice_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoice_status_history
CREATE POLICY "Users can view their invoice status history" ON invoice_status_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their invoice status history" ON invoice_status_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for invoice_views (public read for valid tokens)
CREATE POLICY "Users can view their invoice views" ON invoice_views
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_views.invoice_id 
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can insert invoice views for public invoices" ON invoice_views
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_views.invoice_id 
            AND invoices.public_url_enabled = true
        )
    );

-- Create RLS policies for invoice_emails
CREATE POLICY "Users can view their invoice emails" ON invoice_emails
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their invoice emails" ON invoice_emails
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their invoice emails" ON invoice_emails
    FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for invoice_templates
CREATE POLICY "Users can view their own templates and public templates" ON invoice_templates
    FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own templates" ON invoice_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON invoice_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON invoice_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Insert default invoice template
INSERT INTO invoice_templates (id, name, description, template_data, is_default, is_public) 
VALUES (
    'default',
    'Default Template',
    'Standard invoice template with company branding',
    '{"layout": "standard", "colors": {"primary": "#f97316", "secondary": "#ec4899"}, "fonts": {"heading": "Inter", "body": "Inter"}}',
    true,
    true
) ON CONFLICT (id) DO NOTHING;

-- Create function to generate public URL tokens
CREATE OR REPLACE FUNCTION generate_invoice_public_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to automatically update invoice status history
CREATE OR REPLACE FUNCTION track_invoice_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO invoice_status_history (
            invoice_id,
            user_id,
            old_status,
            new_status,
            changed_by,
            change_reason
        ) VALUES (
            NEW.id,
            NEW.user_id,
            OLD.status,
            NEW.status,
            auth.uid(),
            'Status updated'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic status history tracking
CREATE TRIGGER track_invoice_status_changes
    AFTER UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION track_invoice_status_change();

-- Create function to update view count and last viewed timestamp
CREATE OR REPLACE FUNCTION update_invoice_view_stats(invoice_uuid UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE invoices 
    SET 
        view_count = COALESCE(view_count, 0) + 1,
        last_viewed_at = NOW()
    WHERE id = invoice_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
