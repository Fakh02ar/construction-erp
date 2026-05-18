'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Expense {
  id: string
  description: string
  amount: number
  expense_date: string
  status: string
  payment_method: string
  category: string
}

const statusColors: { [key: string]: string } = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
}

const statusIcons: { [key: string]: any } = {
  draft: AlertCircle,
  pending: Clock,
  approved: CheckCircle2,
  paid: CheckCircle2,
}

const categoryIcons: { [key: string]: string } = {
  labor: '👷',
  materials: '🏗️',
  equipment: '🚜',
  fuel: '⛽',
  utilities: '💡',
  rent: '🏢',
  other: '📝',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    category: 'materials',
    status: 'pending',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('expense_date', { ascending: false })

      if (error) {
        console.error('[v0] Fetch error:', error)
        throw error
      }
      console.log('[v0] Fetched expenses:', data)
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddExpense(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const expenseData = {
        description: formData.description,
        amount: formData.amount ? parseFloat(formData.amount) : 0,
        expense_date: formData.expense_date,
        payment_method: formData.payment_method,
        category: formData.category,
        status: formData.status,
        created_by: 'demo-user-123',
      }

      console.log('[v0] Creating expense:', expenseData)

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseData])
        .select()

      if (error) {
        console.error('[v0] Insert error:', error)
        throw error
      }

      console.log('[v0] Expense created:', data)

      setFormData({
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        category: 'materials',
        status: 'pending',
      })
      setIsDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error creating expense:', error)
      alert('Failed to record expense. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, exp) => sum + (exp.amount || 0), 0)
  const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + (exp.amount || 0), 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-2">Track and manage project expenses</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Record Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record Expense</DialogTitle>
              <DialogDescription>Add a new expense to your project</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  placeholder="e.g., Labor cost - Foundation work"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (PKR) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense_date">Date</Label>
                  <Input
                    id="expense_date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Recording...' : 'Record Expense'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₨{(totalExpenses / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">All expenses</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₨{(paidExpenses / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">Completed payments</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ₨{(pendingExpenses / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ₨{(approvedExpenses / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready to pay</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Expense Records</CardTitle>
          <CardDescription>
            {expenses.length === 0 ? 'No expenses recorded' : `${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading expenses...</div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-gray-600 font-medium">No expenses recorded</p>
              <p className="text-gray-500 text-sm mt-1">Start recording expenses to track project costs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => {
                const StatusIcon = statusIcons[expense.status] || Clock
                const categoryIcon = categoryIcons[expense.category] || '📝'
                return (
                  <div
                    key={expense.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcon}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                          <p className="text-sm text-gray-600">
                            {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)} • {expense.payment_method}
                          </p>
                        </div>
                        <Badge className={statusColors[expense.status] || 'bg-gray-100 text-gray-800'}>
                          {expense.status}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(expense.expense_date).toLocaleDateString('en-PK')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">₨{expense.amount?.toLocaleString('en-PK')}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
