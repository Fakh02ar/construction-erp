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
import { Plus, AlertCircle, TrendingDown, Package, Boxes } from 'lucide-react'

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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
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
      setIsLoading(true)
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Fetch error:', error)
        throw error
      }
      console.log('[v0] Fetched inventory:', data)
      setItems(data || [])
    } catch (error) {
      console.error('Error fetching inventory:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const itemData = {
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        current_quantity: formData.current_quantity ? parseInt(formData.current_quantity) : 0,
        unit_price: formData.unit_price ? parseFloat(formData.unit_price) : 0,
        min_stock_level: formData.min_stock_level ? parseInt(formData.min_stock_level) : 0,
        location: formData.location,
        created_by: 'demo-user-123',
      }

      console.log('[v0] Creating inventory item:', itemData)

      const { data, error } = await supabase
        .from('inventory_items')
        .insert([itemData])
        .select()

      if (error) {
        console.error('[v0] Insert error:', error)
        throw error
      }

      console.log('[v0] Item created:', data)

      setFormData({
        name: '',
        description: '',
        unit: 'pcs',
        current_quantity: '',
        unit_price: '',
        min_stock_level: '',
        location: '',
      })
      setIsDialogOpen(false)
      await fetchData()
    } catch (error) {
      console.error('Error creating item:', error)
      alert('Failed to add item. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const totalValue = items.reduce((sum, item) => sum + (item.unit_price * item.current_quantity), 0)
  const lowStockItems = items.filter(item => item.current_quantity <= item.min_stock_level).length
  const totalItems = items.reduce((sum, item) => sum + item.current_quantity, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-2">Track materials, equipment, and supplies</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new material or equipment to inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cement Bag (50kg)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Product details and specifications"
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
                      <SelectItem value="kg">Kilogram</SelectItem>
                      <SelectItem value="ltr">Liter</SelectItem>
                      <SelectItem value="meter">Meter</SelectItem>
                      <SelectItem value="bag">Bag</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_quantity">Quantity</Label>
                  <Input
                    id="current_quantity"
                    type="number"
                    placeholder="0"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price (PKR)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    placeholder="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock_level">Min Stock Level</Label>
                  <Input
                    id="min_stock_level"
                    type="number"
                    placeholder="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Storage Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Warehouse A, Shelf 3"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Adding...' : 'Add Item'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
            <p className="text-xs text-gray-500 mt-2">Units in stock</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₨{(totalValue / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">Total stock value</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{lowStockItems}</div>
            <p className="text-xs text-gray-500 mt-2">Below minimum level</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Unique Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{items.length}</div>
            <p className="text-xs text-gray-500 mt-2">Different SKUs</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>All Items</CardTitle>
          <CardDescription>
            {items.length === 0 ? 'No items in inventory' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading inventory...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-600 font-medium">No items yet</p>
              <p className="text-gray-500 text-sm mt-1">Add materials and equipment to manage inventory</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const isLowStock = item.current_quantity <= item.min_stock_level
                return (
                  <div
                    key={item.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Boxes className="w-5 h-5 text-gray-500" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                        {isLowStock && (
                          <Badge className="bg-orange-100 text-orange-800">Low Stock</Badge>
                        )}
                      </div>
                      <div className="flex gap-6 mt-2 text-sm text-gray-500">
                        <div>
                          <span className="text-gray-600">Quantity:</span> {item.current_quantity} {item.unit}
                        </div>
                        {item.location && (
                          <div>
                            <span className="text-gray-600">Location:</span> {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Unit Price</div>
                      <div className="text-lg font-bold text-blue-600">₨{item.unit_price?.toLocaleString('en-PK')}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Total: ₨{(item.unit_price * item.current_quantity)?.toLocaleString('en-PK')}
                      </div>
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
