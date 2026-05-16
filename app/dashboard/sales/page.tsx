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
import { Plus, Calendar, FileText } from 'lucide-react'

interface Sale {
  id: string
  invoice_number: string
  project_id: string
  client_id: string
  invoice_date: string
  due_date: string
  description: string
  subtotal: number
  tax: number
  total_amount: number
  payment_status: string
}

interface Project {
  id: string
  name: string
}

interface Party {
  id: string
  name: string
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    invoice_number: '',
    project_id: '',
    client_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: '',
    subtotal: '',
    tax: '',
    total_amount: '',
    payment_status: 'pending',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Fetch sales/invoices
      const { data: salesData } = await supabase
        .from('sales')
        .select('*')
        .eq('created_by', user.id)
        .order('invoice_date', { ascending: false })

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)

      // Fetch clients
      const { data: clientsData } = await supabase
        .from('parties')
        .select('*')
        .eq('party_type', 'client')

      setSales(salesData || [])
      setProjects(projectsData || [])
      setClients(clientsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateSale(e: React.FormEvent) {
    e.preventDefault()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('sales').insert([
        {
          ...formData,
          subtotal: parseFloat(formData.subtotal),
          tax: parseFloat(formData.tax),
          total_amount: parseFloat(formData.total_amount),
          created_by: user.id,
        },
      ])

      if (error) throw error

      setFormData({
        invoice_number: '',
        project_id: '',
        client_id: '',
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: '',
        description: '',
        subtotal: '',
        tax: '',
        total_amount: '',
        payment_status: 'pending',
      })
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error creating sale:', error)
    }
  }

  const paymentStatusColors: Record<string, string> = {
    pending: 'bg-blue-100 text-blue-800',
    partial: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
  }

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'General'
  }

  const getClientName = (clientId: string) => {
    return clients.find((c) => c.id === clientId)?.name || 'Unknown'
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0)
  const paidAmount = sales
    .filter((s) => s.payment_status === 'paid')
    .reduce((sum, sale) => sum + sale.total_amount, 0)
  const pendingAmount = sales
    .filter((s) => s.payment_status !== 'paid')
    .reduce((sum, sale) => sum + sale.total_amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales & Invoices</h1>
          <p className="text-muted-foreground mt-2">Manage customer invoices and revenue tracking</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              New Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>
                Create a new sales invoice for a project
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSale} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_number">Invoice Number *</Label>
                  <Input
                    id="invoice_number"
                    placeholder="e.g., INV-2025-001"
                    value={formData.invoice_number}
                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((proj) => (
                        <SelectItem key={proj.id} value={proj.id}>
                          {proj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select value={formData.payment_status} onValueChange={(value) => setFormData({ ...formData, payment_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Invoice Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Civil works completion - Phase 2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_date">Invoice Date</Label>
                  <Input
                    id="invoice_date"
                    type="date"
                    value={formData.invoice_date}
                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal (₹)</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.subtotal}
                    onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax">Tax (₹)</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total (₹)</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{sales.length} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Amount Received</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Outstanding</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading sales data...</p>
        </div>
      ) : sales.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No invoices created yet</p>
            <p className="text-sm text-muted-foreground">Create your first invoice to track revenue</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <Card key={sale.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{sale.invoice_number}</h3>
                      <Badge className={paymentStatusColors[sale.payment_status] || 'bg-gray-100 text-gray-800'}>
                        {sale.payment_status}
                      </Badge>
                    </div>
                    {sale.description && (
                      <p className="text-sm text-foreground mb-3">{sale.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium ml-2">{getClientName(sale.client_id)}</span>
                      </div>
                      {sale.project_id && (
                        <div>
                          <span className="text-muted-foreground">Project:</span>
                          <span className="font-medium ml-2">{getProjectName(sale.project_id)}</span>
                        </div>
                      )}
                      {sale.invoice_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          {new Date(sale.invoice_date).toLocaleDateString()}
                        </div>
                      )}
                      {sale.due_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FileText size={16} />
                          Due: {new Date(sale.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4 min-w-fit">
                    <p className="text-sm text-muted-foreground">Invoice Amount</p>
                    <p className="text-2xl font-bold">₹{sale.total_amount.toLocaleString()}</p>
                    {sale.subtotal && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Subtotal: ₹{sale.subtotal.toLocaleString()}
                        {sale.tax > 0 && ` + Tax: ₹${sale.tax.toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
