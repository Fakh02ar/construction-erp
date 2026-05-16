'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart3, FileText, TrendingUp, Wallet } from 'lucide-react'

interface Report {
  title: string
  description: string
  icon: React.ReactNode
  action: string
  metrics: {
    label: string
    value: string | number
    color?: string
  }[]
}

export default function ReportsPage() {
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [profitMargin, setProfitMargin] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch total revenue
      const { data: salesData } = await supabase
        .from('sales')
        .select('total_amount')
        .eq('created_by', user.id)

      const revenue = salesData?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0

      // Fetch total expenses
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('amount')
        .eq('created_by', user.id)

      const expenses = expensesData?.reduce((sum, exp) => sum + (exp.amount || 0), 0) || 0

      setTotalRevenue(revenue)
      setTotalExpenses(expenses)
      setProfitMargin(revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const reports: Report[] = [
    {
      title: 'Financial Summary',
      description: 'Overview of your financial performance',
      icon: <Wallet className="w-8 h-8" />,
      action: 'View Details',
      metrics: [
        { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` },
        { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString()}` },
        { label: 'Net Profit', value: `₹${(totalRevenue - totalExpenses).toLocaleString()}` },
        { label: 'Profit Margin', value: `${profitMargin.toFixed(1)}%` },
      ],
    },
    {
      title: 'Project Performance',
      description: 'Analyze your project costs and profitability',
      icon: <TrendingUp className="w-8 h-8" />,
      action: 'Generate Report',
      metrics: [
        { label: 'Active Projects', value: '—' },
        { label: 'Avg Project Cost', value: '—' },
        { label: 'On-time Completion', value: '—' },
        { label: 'Budget Variance', value: '—' },
      ],
    },
    {
      title: 'Inventory Analysis',
      description: 'Monitor stock levels and material costs',
      icon: <BarChart3 className="w-8 h-8" />,
      action: 'View Inventory',
      metrics: [
        { label: 'Total Items', value: '—' },
        { label: 'Low Stock Items', value: '—' },
        { label: 'Total Value', value: '—' },
        { label: 'Turnover Rate', value: '—' },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Track financial performance and project metrics</p>
        </div>
        <Button>
          <FileText className="mr-2" size={18} />
          Download Report
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{(totalRevenue - totalExpenses).toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profitMargin.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {reports.map((report, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-muted rounded-lg text-foreground">{report.icon}</div>
                        <CardTitle>{report.title}</CardTitle>
                      </div>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {report.metrics.map((metric, midx) => (
                      <div key={midx} className="space-y-1">
                        <p className="text-xs text-muted-foreground font-medium">{metric.label}</p>
                        <p className="text-lg font-semibold">{metric.value}</p>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full">
                    {report.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Important metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Revenue Growth</span>
                  <Badge>Up 12%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expense Management</span>
                  <Badge variant="outline">Stable</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Efficiency</span>
                  <Badge>Good</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Cash Flow</span>
                  <Badge variant="outline">Healthy</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
