'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { DollarSign, Package, Briefcase, Users } from 'lucide-react'

interface DashboardContentProps {
  user: any
  userProfile: any
}

export function DashboardContent({ user, userProfile }: DashboardContentProps) {
  const [stats, setStats] = useState({
    projectCount: 0,
    totalBudget: 0,
    totalExpenses: 0,
    activeProjects: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<any[]>([])

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient()

      // Fetch projects
      const { data: projects, count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact' })
        .eq('created_by', user.id)

      // Calculate stats
      const totalBudget = projects?.reduce((sum, p) => sum + (p.estimated_budget || 0), 0) || 0
      const totalExpenses = projects?.reduce((sum, p) => sum + (p.actual_cost || 0), 0) || 0
      const activeProjects =
        projects?.filter((p) => ['planning', 'ongoing'].includes(p.status)).length || 0

      // Fetch monthly data for chart
      const { data: expenses } = await supabase
        .from('expenses')
        .select('expense_date, amount')
        .eq('created_by', user.id)

      const monthlyMap: Record<string, number> = {}
      expenses?.forEach((exp) => {
        const month = new Date(exp.expense_date).toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        })
        monthlyMap[month] = (monthlyMap[month] || 0) + exp.amount
      })

      const chartData = Object.entries(monthlyMap)
        .sort()
        .slice(-6)
        .map(([month, amount]) => ({
          month,
          expenses: amount,
        }))

      setStats({
        projectCount: projectCount || 0,
        totalBudget,
        totalExpenses,
        activeProjects,
      })

      setMonthlyData(chartData)
      setIsLoading(false)
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  const KPICard = ({ title, value, icon: Icon, change }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' && value > 1000
            ? `₹${(value / 1000).toFixed(1)}k`
            : value}
        </div>
        {change && <p className="text-xs text-muted-foreground mt-1">{change}</p>}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Active Projects"
            value={stats.activeProjects}
            icon={Briefcase}
            change={`${stats.projectCount} total`}
          />
          <KPICard
            title="Total Budget"
            value={stats.totalBudget}
            icon={DollarSign}
            change="This Period"
          />
          <KPICard
            title="Total Expenses"
            value={stats.totalExpenses}
            icon={DollarSign}
            change={`${((stats.totalExpenses / stats.totalBudget) * 100).toFixed(1)}% of budget`}
          />
          <KPICard
            title="Budget Balance"
            value={stats.totalBudget - stats.totalExpenses}
            icon={Package}
            change="Remaining"
          />
        </div>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList>
          <TabsTrigger value="expenses">Expenses Trend</TabsTrigger>
          <TabsTrigger value="projects">Projects Status</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
              <CardDescription>Expense trend over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString()}`}
                      contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      dot={{ fill: '#0ea5e9' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Status Distribution</CardTitle>
              <CardDescription>Overview of project statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Planning', value: stats.projectCount - stats.activeProjects },
                  { label: 'Ongoing', value: stats.activeProjects },
                  { label: 'Completed', value: 0 },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground">{item.value}</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${((item.value || 0) / (stats.projectCount || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Common actions you can take</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <button className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left">
            <p className="font-semibold">Create New Project</p>
            <p className="text-sm text-muted-foreground mt-1">Start a new construction project</p>
          </button>
          <button className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left">
            <p className="font-semibold">Add Party</p>
            <p className="text-sm text-muted-foreground mt-1">Register a contractor, supplier, or client</p>
          </button>
          <button className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left">
            <p className="font-semibold">Create Requisition</p>
            <p className="text-sm text-muted-foreground mt-1">Request materials for your project</p>
          </button>
          <button className="p-4 rounded-lg border border-border hover:bg-secondary transition-colors text-left">
            <p className="font-semibold">Record Expense</p>
            <p className="text-sm text-muted-foreground mt-1">Log project expenses</p>
          </button>
        </CardContent>
      </Card>
    </div>
  )
}
