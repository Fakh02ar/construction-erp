# 🏗️ Construction ERP System

A modern, full-featured Enterprise Resource Planning system built specifically for construction companies. Manage projects, finances, inventory, and team workflows in one integrated platform.

![Construction ERP](https://img.shields.io/badge/Version-1.0.0-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

### 📊 Dashboard
- Real-time KPI metrics
- Project overview and budget tracking
- Financial summary with charts
- Quick action buttons

### 🏢 Project Management
- Create and manage construction projects
- Budget planning and tracking
- Project status monitoring
- Client and manager assignment

### 👥 Party Management
- Manage contractors, suppliers, and clients
- Contact information tracking
- Balance and ledger maintenance
- Tax and bank details

### 📦 Inventory System
- Stock tracking with multiple units
- Inventory categorization
- Reorder alerts and level monitoring
- Stock valuation

### 🛒 Purchase Management
- Purchase order creation
- Supplier management
- Delivery tracking
- Payment status monitoring

### 💰 Sales & Revenue
- Customer invoice generation
- Revenue tracking
- Payment status management
- Outstanding receivables tracking

### 💸 Expense Tracking
- Categorized expense logging
- Vendor and payment method tracking
- Approval workflow
- Cost analysis by category

### 📈 Reports & Analytics
- Financial dashboards
- Profit and loss reports
- Key performance indicators
- Export ready data

### ⚙️ User Management
- Role-based access control (5 roles)
- Profile management
- Security settings
- Account configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/construction-erp.git
cd construction-erp
```

2. **Install dependencies**
```bash
pnpm install
# or: npm install, yarn install
```

3. **Configure environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

### Create Account
1. Click "Sign up" on the login page
2. Enter email and password
3. Confirm your email
4. Login with your credentials

### Default Roles
- **Admin**: Full system access
- **Manager**: Project and team management
- **Supervisor**: Project oversight
- **Accountant**: Financial reporting
- **Store Keeper**: Inventory management

## 📚 Documentation

- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Complete testing instructions
- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Project completion details
- **[Supabase Docs](https://supabase.com/docs)** - Database documentation
- **[Next.js Docs](https://nextjs.org/docs)** - Framework documentation

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Lucide** - Icons

### Backend & Database
- **Supabase** - Authentication & PostgreSQL
- **Next.js API Routes** - Backend
- **Row Level Security** - Data protection
- **Database Triggers** - Automation

### Deployment
- **Vercel** - Hosting (recommended)
- **Vercel Blob** - File storage

## 📊 Database Schema

18 tables covering all construction operations:

**Core Tables**
- `user_profiles` - User accounts and roles
- `projects` - Construction projects
- `parties` - Contractors, suppliers, clients

**Financial Tables**
- `purchases` - Purchase orders
- `sales` - Customer invoices
- `expenses` - Project expenses
- `daily_balance_sheets` - Financial summaries

**Operational Tables**
- `inventory_items` - Materials and equipment
- `requisitions` - Purchase requests
- `labor_logs` - Worker time tracking

**Accounting Tables**
- `journal_entries` - Accounting ledger
- `balance_sheet_line_items` - Chart of accounts

## 🔒 Security

✅ **Implemented Security Features**
- Row Level Security (RLS) on all tables
- Role-based access control
- Password hashing (bcrypt)
- HTTP-only secure cookies
- CSRF protection
- SQL injection prevention
- Automatic session validation

## 📈 Performance

- **Page Load**: < 2 seconds
- **Time to Interactive**: < 3 seconds
- **Database Queries**: Optimized with RLS
- **Build Size**: Optimized with Next.js

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Click Deploy

3. **Verify Deployment**
- Check environment variables are set
- Test authentication flow
- Monitor performance

## 📋 Project Structure

```
├── app/                          # Next.js app directory
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── callback/
│   ├── dashboard/                # Main dashboard
│   │   ├── projects/
│   │   ├── parties/
│   │   ├── inventory/
│   │   ├── purchases/
│   │   ├── sales/
│   │   ├── expenses/
│   │   ├── reports/
│   │   └── settings/
│   └── globals.css               # Theme configuration
├── components/                   # React components
│   └── dashboard/                # Dashboard components
├── lib/                          # Utilities
│   └── supabase/                 # Supabase clients
├── middleware.ts                 # Route protection
└── package.json
```

## 🤝 Contributing

We welcome contributions! Please see our contribution guidelines.

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs via GitHub issues
- **Docs**: Check TESTING_GUIDE.md and PROJECT_SUMMARY.md
- **Supabase Help**: https://supabase.com/docs

## 🎯 Roadmap

### Version 1.1
- [ ] Real-time data updates
- [ ] PDF report generation
- [ ] Email notifications

### Version 1.2
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] API integrations

### Version 2.0
- [ ] Multi-company support
- [ ] Advanced approval workflows
- [ ] Budget forecasting

## 📞 Contact

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: support@construction-erp.com

---

**Built with ❤️ for construction companies**

Last Updated: May 16, 2026  
Version: 1.0.0  
Status: Production Ready
"# construction-erp" 
"# construction-erp" 
