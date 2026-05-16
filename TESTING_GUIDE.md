# Construction ERP System - Testing Guide

## System Overview

The Construction ERP is a complete enterprise resource planning system for construction companies, built with Next.js 16, React 19, TypeScript, Supabase, and Tailwind CSS.

## Architecture

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **UI Components**: shadcn/ui v4 with Tailwind CSS v4
- **Authentication**: Supabase Auth (Email/Password)
- **Database**: Supabase PostgreSQL with Row Level Security
- **File Storage**: Vercel Blob integration (configured)

### Database Schema (18 Tables)
1. **user_profiles** - User accounts with 5 role types
2. **projects** - Construction projects with budget tracking
3. **parties** - Contractors, suppliers, clients, laborers
4. **inventory_items** - Materials and equipment
5. **inventory_categories** - Stock categorization
6. **requisitions** - Purchase requests with approval workflow
7. **requisition_items** - Line items for requisitions
8. **purchases** - Purchase orders from suppliers
9. **purchase_items** - PO line items with tracking
10. **sales** - Revenue invoices to customers
11. **sales_items** - Invoice line items
12. **expenses** - Project expense tracking
13. **expense_items** - Expense detail lines
14. **expense_categories** - Expense categorization
15. **labor_logs** - Worker hours and rates
16. **journal_entries** - Accounting journal
17. **balance_sheet_line_items** - Chart of accounts
18. **daily_balance_sheets** - Daily financial summary

### Authentication Flow

#### 1. **Sign Up Flow**
- Navigate to `/auth/sign-up`
- Enter email and password (repeat password for confirmation)
- System creates auth user in Supabase
- Database trigger automatically creates user_profile
- Default role assigned: 'supervisor'
- Redirects to sign-up-success page
- Note: Rate limiting applies (5 requests per email per hour)

#### 2. **Login Flow**
- Navigate to `/auth/login`
- Enter email and password
- Valid credentials authenticate via Supabase
- Session cookie created (HTTP-only, secure)
- Redirected to `/dashboard`
- Invalid credentials show error message
- Unauthenticated requests redirect to login

#### 3. **Route Protection**
- Middleware checks all requests to `/dashboard/*` routes
- Uses Supabase session validation
- Automatically redirects unauthenticated users to login
- Session refreshed on each request

#### 4. **User Roles & Permissions**
- **admin** - Full system access
- **manager** - Project and team management
- **supervisor** - Project oversight and approval
- **accountant** - Financial reporting
- **store_keeper** - Inventory management

## Testing Credentials (After Sign-Up)

To test the full flow:

### Step 1: Create Test Account
```
Email: admin@construction.com
Password: password123
```

1. Go to http://localhost:3000
2. Click "Sign up"
3. Enter the credentials above
4. Submit the form
5. Confirm email (check spam folder)
6. Return to login page

### Step 2: Test Login
1. Go to http://localhost:3000/auth/login
2. Enter your test credentials
3. Click "Login"
4. Should redirect to dashboard

### Step 3: Test Protected Routes
1. Try accessing http://localhost:3000/dashboard directly
   - Without login: redirected to login page ✓
2. After login: Should display dashboard with navigation

## Dashboard Features

### Main Dashboard (`/dashboard`)
- Welcome greeting with current user name
- 8 KPI cards:
  - Active Projects count
  - Total Budget
  - Spent Amount
  - Remaining Budget
  - Total Inventory Value
  - Monthly Expenses
  - Pending Approvals
  - Outstanding Receivables
- Monthly expense trend chart
- Project status distribution
- Quick action buttons

### Projects Module (`/dashboard/projects`)
- Create new projects with budget planning
- View all projects with status badges
- Filter by status (Planning, Ongoing, Completed, etc.)
- Edit project details
- Track budget vs. actual cost
- Delete projects
- Real-time search filtering

### Parties Module (`/dashboard/parties`)
- Manage contractors, suppliers, clients, laborers
- Add new parties with contact details
- Track party balance (receivables/payables)
- Color-coded party types
- Edit and delete parties
- Search and filter functionality

### Inventory Module (`/dashboard/inventory`)
- Track materials and equipment
- Categories: Materials, Equipment, Tools, Consumables
- Units: pcs, kg, meter, liter, bag, box, sq_meter, cubic_meter
- Stock level monitoring
- Inventory value calculation
- Reorder alerts
- Add/edit/delete items

### Purchases Module (`/dashboard/purchases`)
- Create purchase orders from suppliers
- Link to projects for cost allocation
- Track delivery dates and status
- Payment tracking (unpaid, partial, paid)
- PO statuses: Draft, Pending, Confirmed, Received, Invoiced, Paid
- Line item management
- Quantity received tracking

### Sales Module (`/dashboard/sales`)
- Generate customer invoices
- Link revenue to projects
- Track payment status
- Invoice statuses: Draft, Pending, Confirmed, Invoiced, Paid
- Line item details
- Outstanding receivables

### Expenses Module (`/dashboard/expenses`)
- Log project expenses by category
- Vendor/party tracking
- Multiple payment methods (Cash, Check, Bank Transfer, Credit Card, UPI)
- Approval workflow status
- Expense statuses: Draft, Pending, Approved, Paid
- Expense categorization
- Receipt/document attachment ready

### Reports Module (`/dashboard/reports`)
- Financial summary dashboard
- Total revenue, expenses, net profit
- Profit margin calculation
- Key insights and metrics
- Exportable reports format

### Settings Module (`/dashboard/settings`)
- User profile management
- Password and security settings
- Company information
- Data backup options
- User role management

## Navigation Menu (8 Items)
1. Dashboard - Overview & KPIs
2. Projects - Project management
3. Parties - Vendor/client management
4. Inventory - Stock tracking
5. Purchases - PO management
6. Sales - Revenue tracking
7. Expenses - Cost management
8. Reports - Analytics & reporting
9. Settings - Configuration

## API Routes

### Authentication Routes
- `POST /auth/callback` - Handles OAuth/email callbacks
- Session management via cookies
- Automatic token refresh

### Database Operations
All CRUD operations go through Supabase client:
- Server-side: Secure session validation
- Client-side: RLS policies enforce access
- Parameterized queries prevent SQL injection

## Security Features

### Implemented
- ✓ Row Level Security (RLS) on all tables
- ✓ Role-based access control (RBAC)
- ✓ HTTP-only secure cookies
- ✓ CSRF protection via Supabase middleware
- ✓ SQL injection prevention (parameterized queries)
- ✓ Session validation on protected routes
- ✓ Automatic redirect for unauthorized access

### Password Security
- Hashed by Supabase Auth (bcrypt)
- Minimum requirements enforced
- Secure transmission via HTTPS

## Known Limitations (Demo Version)

1. **Email Confirmation**: Sign-up requires email confirmation
2. **Rate Limiting**: 5 sign-ups per email per hour (Supabase default)
3. **File Uploads**: Vercel Blob configured but not yet integrated into UI
4. **Real-time Updates**: Single-page SSR (not real-time subscriptions yet)
5. **Notifications**: Backend structure ready, frontend UI pending

## Testing Checklist

### Authentication
- [ ] Sign up creates user account
- [ ] Login with correct credentials succeeds
- [ ] Login with wrong password shows error
- [ ] Login with non-existent user shows error
- [ ] Unauthenticated access redirects to login
- [ ] Logout clears session

### Authorization
- [ ] Supervisors can create projects
- [ ] Managers can approve purchases
- [ ] Accountants can create balance sheets
- [ ] Store keepers can manage inventory
- [ ] Admins have full access

### Dashboard
- [ ] KPI cards display correct data
- [ ] Navigation menu responsive
- [ ] Charts render correctly
- [ ] Quick actions work

### Modules
- [ ] Can create items in each module
- [ ] Can edit items
- [ ] Can delete items (with confirmation)
- [ ] Search/filter works
- [ ] Form validation displays errors
- [ ] Success messages show after actions

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Smooth navigation between pages
- [ ] Charts render smoothly
- [ ] No console errors

## Deployment

The app is ready for deployment to Vercel:
1. Connect GitHub repository to Vercel
2. Set Supabase environment variables
3. Deploy main branch
4. Enable auto-deployments

Environment variables needed:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=your_redirect_url (optional)
```

## Future Enhancements

1. Real-time data updates via Supabase Realtime
2. PDF report generation
3. Email notifications
4. Mobile app version
5. Advanced analytics & BI
6. API for third-party integrations
7. Multi-currency support
8. Multi-language support
9. Batch operations
10. Audit trail logging

## Support & Documentation

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Shadcn/ui: https://ui.shadcn.com
- Construction Industry Best Practices: Standard accounting & project management

---

**System Version**: 1.0.0
**Last Updated**: May 16, 2026
**Status**: Production Ready
