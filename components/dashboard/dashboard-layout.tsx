'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: React.ReactNode
  userProfile: any
}

export function DashboardLayout({ children, userProfile }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = async () => {
    // Clear demo mode
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_mode')
    }
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
    router.push('/auth/login')
  }

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Projects', icon: Briefcase, href: '/dashboard/projects' },
    { label: 'Parties', icon: Users, href: '/dashboard/parties' },
    { label: 'Inventory', icon: Package, href: '/dashboard/inventory' },
    { label: 'Purchases', icon: ShoppingCart, href: '/dashboard/purchases' },
    { label: 'Sales', icon: TrendingUp, href: '/dashboard/sales' },
    { label: 'Expenses', icon: DollarSign, href: '/dashboard/expenses' },
    { label: 'Reports', icon: BarChart3, href: '/dashboard/reports' },
    { label: 'Settings', icon: Settings, href: '/dashboard/settings' },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo Area */}
        <div className="h-20 border-b border-sidebar-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <h1 className="font-bold text-lg text-sidebar-foreground">ERP</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-sidebar-accent rounded-md text-sidebar-foreground"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          {sidebarOpen && (
            <div className="text-xs">
              <p className="font-semibold text-sidebar-foreground truncate">
                {userProfile?.full_name || 'User'}
              </p>
              <p className="text-sidebar-foreground/60 truncate capitalize">
                {userProfile?.role || 'User'}
              </p>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <LogOut size={18} />
            {sidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-20 border-b border-border bg-card flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-foreground">Construction ERP</h2>
          <div className="text-sm text-muted-foreground">
            Welcome, {userProfile?.full_name?.split(' ')[0]}
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
