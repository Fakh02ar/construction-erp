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
import { Plus, AlertCircle, TrendingDown } from 'lucide-react'

interface InventoryItem {
  id: string
  name: string
  description: string
  category_id: string
  unit: string
  current_quantity: number
  unit_price: number
  min_stock_level: number
  location: string
}

interface Category {
  id: string
  name: string
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    unit: 'pcs',
    current_quantity: '',
    unit_price: '',
    min_stock_level: '',
    location: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name')

      setCategories(categoriesData || [])

      // Fetch inventory items
      const { data: itemsData } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name')

      setItems(itemsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await supabase.from('inventory_items').insert([
        {
          ...formData,
          current_quantity: parseFloat(formData.current_quantity),
          unit_price: parseFloat(formData.unit_price),
          min_stock_level: parseFloat(formData.min_stock_level),
        },
      ])

      if (error) throw error

      setFormData({
        name: '',
        description: '',
        category_id: '',
        unit: 'pcs',
        current_quantity: '',
        unit_price: '',
        min_stock_level: '',
        location: '',
      })
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const lowStockItems = items.filter(
    (item) => item.current_quantity <= (item.min_stock_level || 0)
  )

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Uncategorized'
  }

  const getStockStatus = (current: number, min: number) => {
    if (current <= min) return 'low'
    if (current <= min * 1.5) return 'medium'
    return 'healthy'
  }

  const statusColors = {
    low: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    healthy: 'bg-green-100 text-green-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">Manage materials and equipment stock levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>
                Register a new material or equipment item
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cement Bag 50kg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Item details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="kg">Kilograms</SelectItem>
                      <SelectItem value="meter">Meters</SelectItem>
                      <SelectItem value="liter">Liters</SelectItem>
                      <SelectItem value="bag">Bags</SelectItem>
                      <SelectItem value="box">Boxes</SelectItem>
                      <SelectItem value="sq_meter">Square Meters</SelectItem>
                      <SelectItem value="cubic_meter">Cubic Meters</SelectItem>
                      <SelectItem value="bundle">Bundles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Warehouse A"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Min Stock Level</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
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
                <Button type="submit">Add Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900">Low Stock Alert</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No items in inventory</p>
            <p className="text-sm text-muted-foreground">Add items to start tracking your inventory</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const status = getStockStatus(item.current_quantity, item.min_stock_level)
            const totalValue = item.current_quantity * item.unit_price
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <Badge className={statusColors[status]}>
                          {status === 'low' && '⚠ Low Stock'}
                          {status === 'medium' && '⚡ Medium'}
                          {status === 'healthy' && '✓ Healthy'}
                        </Badge>
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm mt-3">
                        <div>
                          <span className="text-muted-foreground">Category:</span>
                          <span className="font-medium ml-2">{getCategoryName(item.category_id)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium ml-2">{item.location || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Unit:</span>
                          <span className="font-medium ml-2">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-4 min-w-fit">
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground">Current Stock</p>
                        <p className="text-2xl font-bold">{item.current_quantity}</p>
                        {item.min_stock_level && (
                          <p className="text-xs text-muted-foreground">Min: {item.min_stock_level}</p>
                        )}
                      </div>
                      {item.unit_price && (
                        <div>
                          <p className="text-sm text-muted-foreground">Total Value</p>
                          <p className="text-xl font-semibold">₹{totalValue.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
