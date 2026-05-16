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
import { Plus, Calendar, Truck } from 'lucide-react'

interface Purchase {
  id: string
  po_number: string
  project_id: string
  supplier_id: string
  purchase_date: string
  delivery_date: string
  status: string
  subtotal: number
  tax: number
  total_amount: number
  payment_status: string
}

interface Party {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [suppliers, setSuppliers] = useState<Party[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    po_number: '',
    project_id: '',
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'draft',
    subtotal: '',
    tax: '',
    total_amount: '',
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

      // Fetch purchases
      const { data: purchasesData } = await supabase
        .from('purchases')
        .select('*')
        .eq('created_by', user.id)
        .order('purchase_date', { ascending: false })

      // Fetch suppliers
      const { data: suppliersData } = await supabase
        .from('parties')
        .select('*')
        .eq('party_type', 'supplier')

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('created_by', user.id)

      setPurchases(purchasesData || [])
      setSuppliers(suppliersData || [])
      setProjects(projectsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreatePurchase(e: React.FormEvent) {
    e.preventDefault()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('purchases').insert([
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
        po_number: '',
        project_id: '',
        supplier_id: '',
        purchase_date: new Date().toISOString().split('T')[0],
        delivery_date: '',
        status: 'draft',
        subtotal: '',
        tax: '',
        total_amount: '',
      })
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error creating purchase:', error)
    }
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending: 'bg-blue-100 text-blue-800',
    confirmed: 'bg-purple-100 text-purple-800',
    received: 'bg-green-100 text-green-800',
    invoiced: 'bg-orange-100 text-orange-800',
    paid: 'bg-green-100 text-green-800',
  }

  const paymentStatusColors: Record<string, string> = {
    unpaid: 'text-red-600',
    partial: 'text-yellow-600',
    paid: 'text-green-600',
  }

  const getSupplierName = (supplierId: string) => {
    return suppliers.find((s) => s.id === supplierId)?.name || 'Unknown'
  }

  const getProjectName = (projectId: string) => {
    return projects.find((p) => p.id === projectId)?.name || 'General'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground mt-2">Manage purchase orders and vendor payments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              New Purchase Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
              <DialogDescription>
                Create a new purchase order for materials or equipment
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePurchase} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="po_number">PO Number *</Label>
                  <Input
                    id="po_number"
                    placeholder="e.g., PO-2025-001"
                    value={formData.po_number}
                    onChange={(e) => setFormData({ ...formData, po_number: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => setFormData({ ...formData, supplier_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supp) => (
                        <SelectItem key={supp.id} value={supp.id}>
                          {supp.name}
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="invoiced">Invoiced</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Expected Delivery</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
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
                <Button type="submit">Create PO</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Purchases List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading purchases...</p>
        </div>
      ) : purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No purchase orders yet</p>
            <p className="text-sm text-muted-foreground">Create your first purchase order to track vendor materials</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{purchase.po_number}</h3>
                      <Badge className={statusColors[purchase.status] || 'bg-gray-100 text-gray-800'}>
                        {purchase.status}
                      </Badge>
                      <Badge className={`border ${paymentStatusColors[purchase.payment_status]}`} variant="outline">
                        {purchase.payment_status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Supplier: <span className="font-medium">{getSupplierName(purchase.supplier_id)}</span>
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {purchase.project_id && (
                        <div>
                          <span className="text-muted-foreground">Project:</span>
                          <span className="font-medium ml-2">{getProjectName(purchase.project_id)}</span>
                        </div>
                      )}
                      {purchase.purchase_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={16} />
                          {new Date(purchase.purchase_date).toLocaleDateString()}
                        </div>
                      )}
                      {purchase.delivery_date && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Truck size={16} />
                          Delivery: {new Date(purchase.delivery_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4 min-w-fit">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">₹{purchase.total_amount.toLocaleString()}</p>
                    {purchase.subtotal && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Subtotal: ₹{purchase.subtotal.toLocaleString()}
                        {purchase.tax > 0 && ` + Tax: ₹${purchase.tax.toLocaleString()}`}
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
