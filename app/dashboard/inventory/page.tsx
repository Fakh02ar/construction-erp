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
import { Plus, AlertCircle, TrendingDown, Package } from 'lucide-react'

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
      const { data: categoriesData } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name')

      setCategories(categoriesData || [])

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
          current_quantity: parseFloat(formData.current_quantity || '0'),
          unit_price: parseFloat(formData.unit_price || '0'),
          min_stock_level: parseFloat(formData.min_stock_level || '0'),
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
      await fetchData()
    } catch (error) {
      console.error('Error adding item:', error)
    }
  }

  const lowStockItems = items.filter(
    (item) => item.current_quantity < (item.min_stock_level || 0)
  )
  const totalValue = items.reduce((sum, item) => sum + item.current_quantity * item.unit_price, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-2">Track materials and equipment stock levels</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Cement Bags"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Item details"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger id="unit">
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
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Storage location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="0"
                    value={formData.current_quantity}
                    onChange={(e) => setFormData({ ...formData, current_quantity: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Min Stock</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    placeholder="0"
                    value={formData.min_stock_level}
                    onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{items.length}</div>
              <Package className="w-8 h-8 text-primary opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">₹{totalValue.toLocaleString()}</div>
              <TrendingDown className="w-8 h-8 text-green-600 opacity-30" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-red-600">{lowStockItems.length}</div>
              <AlertCircle className="w-8 h-8 text-red-600 opacity-30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading inventory...</p>
          </div>
        </div>
      ) : items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-96">
            <div className="text-center">
              <Package className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No items in inventory</h3>
              <p className="text-muted-foreground mb-4">Add your first item to get started</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      {item.location && (
                        <span className="text-muted-foreground">
                          <strong>Location:</strong> {item.location}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        <strong>Unit:</strong> {item.unit}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {item.current_quantity}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Current Stock</p>
                    {item.current_quantity < (item.min_stock_level || 0) && (
                      <Badge variant="destructive" className="mt-2">
                        Low Stock
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Unit Price</p>
                    <p className="text-sm font-semibold">₹{item.unit_price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                    <p className="text-sm font-semibold">
                      ₹{(item.current_quantity * item.unit_price).toLocaleString()}
                    </p>
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
