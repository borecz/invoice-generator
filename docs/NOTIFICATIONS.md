# Notifications System

A comprehensive notifications system for the invoice generator application with full internationalization support, accessibility compliance, and functional quick actions.

## Features

- **31 Notification Types** across 6 categories
- **Orange/Pink Gradient Theme** matching the application design
- **WCAG 2.1 AA Accessibility Compliance**
- **Full Internationalization** with next-intl
- **Functional Quick Actions** that perform real database operations
- **Real-time Status Updates** and filtering
- **Responsive Design** with mobile-first approach

## Notification Categories

### 1. Invoice Management (9 types)
- Invoice Created, Sent, Viewed, Paid, Overdue
- Invoice Reminder Sent, Cancelled, Updated
- Partial Payment Received

### 2. Payment & Financial (5 types)
- Payment Failed, Refund Processed
- Payment Method Expired
- Monthly Revenue Summary, Tax Deadline Reminder

### 3. System & Account (6 types)
- Subscription Renewal/Expiring, Plan Upgrade Available
- Storage Limit Warning, Backup Completed, Security Alert

### 4. Business Intelligence (4 types)
- Weekly Business Summary, Goal Achievement
- Trend Alert, Customer Milestone

### 5. Integration & Automation (4 types)
- Integration Connected/Failed
- Automation Triggered, Data Export Ready

### 6. Compliance & Legal (3 types)
- Tax Rate Update, Compliance Reminder
- Document Retention Alert

## Database Schema

### Tables Created
- `notifications` - Main notifications table
- `notification_types` - Reference table for notification configurations
- `notification_preferences` - User-specific notification settings

### Key Features
- Row Level Security (RLS) enabled
- Automatic timestamps with triggers
- Optimized indexes for performance
- JSONB fields for flexible context data and quick actions

## Quick Actions

Each notification type includes contextual quick action buttons:

- **View Invoice/Customer/Report** - Navigate to relevant pages
- **Send Invoice/Reminder** - Trigger email actions
- **Mark as Paid** - Update invoice status
- **Contact Customer/Support** - Open communication channels
- **Export Data/Records** - Download relevant information
- **Dismiss/Snooze** - Manage notification status

## API Endpoints

### Server Actions (`app/notifications/actions.ts`)
- `getNotificationsForUser()` - Fetch user notifications with filtering
- `createNotification()` - Create new notifications
- `markNotificationAsRead()` - Mark individual notification as read
- `markAllNotificationsAsRead()` - Mark all notifications as read
- `dismissNotification()` - Dismiss notification
- `markNotificationAsActed()` - Mark notification as acted upon
- `getNotificationCounts()` - Get notification counts by status

## UI Components

### Main Components
- `NotificationsList` - Main notifications interface with tabs and filters
- `NotificationItem` - Individual notification card with quick actions
- `NotificationFilters` - Category and status filtering

### Features
- **Tabs**: All, Unread, Read notifications
- **Filters**: By category and status
- **Real-time Updates**: Automatic refresh after actions
- **Accessibility**: WCAG 2.1 AA compliant with proper ARIA labels
- **Responsive**: Mobile-first design with touch-friendly targets

## Internationalization

### Supported Languages
- English (en)
- Italian (it)
- Czech (cs)
- Russian (ru)

### Translation Keys
All notification text is fully localized including:
- Notification titles and messages
- Quick action button labels
- Category and status names
- Time ago formatting
- Filter labels and descriptions

## Testing & Development

### Scripts Available

```bash
# Install dependencies (if not already installed)
npm install

# Test the notification system
npm run notifications:test

# Generate sample notifications for a user
npm run notifications:generate <user-email> [count]
```

### Testing the System

1. **Database Setup Test**:
   ```bash
   npm run notifications:test
   ```

2. **Generate Sample Data**:
   ```bash
   npm run notifications:generate user@example.com 25
   ```

3. **Access the UI**:
   - Visit `/notifications` in your application
   - Use the bell icon in the header to navigate
   - Test filtering, quick actions, and status updates

### Development Notes

- All quick actions perform real database operations
- Notifications are user-specific with RLS security
- Context data supports dynamic message interpolation
- Priority levels affect visual styling and urgency
- Status tracking enables comprehensive notification management

## Usage Examples

### Creating a Notification Programmatically

```typescript
import { createNotification } from '@/app/notifications/actions';

await createNotification({
  type: 'invoice_paid',
  title: 'Payment Received',
  message: 'Payment of $1,234.56 received for invoice #INV-001',
  priority: 'high',
  context_data: {
    invoiceNumber: 'INV-001',
    amount: '$1,234.56',
    customerName: 'John Doe'
  },
  related_entity_type: 'invoice',
  related_entity_id: 'invoice-uuid-here'
});
```

### Filtering Notifications

```typescript
// Get only unread invoice notifications
const { data } = await getNotificationsForUser(
  50, // limit
  0,  // offset
  'unread', // status filter
  'invoice_management' // category filter
);
```

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Touch Targets**: Minimum 44x44px touch targets
- **Color Contrast**: WCAG AA compliant color ratios
- **Focus Indicators**: Clear focus states for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark roles

## Performance Optimizations

- **Lazy Loading**: Components are lazy-loaded for better performance
- **Efficient Queries**: Optimized database queries with proper indexing
- **Pagination**: Built-in pagination support for large notification lists
- **Caching**: Efficient state management and update patterns

## Security

- **Row Level Security**: Users can only access their own notifications
- **Input Validation**: All inputs are validated and sanitized
- **XSS Protection**: Safe rendering of dynamic content
- **CSRF Protection**: Built-in Next.js CSRF protection

## Future Enhancements

- Email notification delivery
- Push notification support
- Notification scheduling
- Advanced filtering options
- Notification templates
- Bulk actions
- Notification analytics
