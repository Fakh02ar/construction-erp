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
import { Plus, Phone, Mail, MapPin, Building2 } from 'lucide-react'

interface Party {
  id: string
  name: string
  party_type: string
  contact_person: string
  phone: string
  email: string
  address: string
  city: string
  balance: number
}

const partyTypeColors: { [key: string]: string } = {
  contractor: 'bg-purple-100 text-purple-800',
  client: 'bg-blue-100 text-blue-800',
  supplier: 'bg-amber-100 text-amber-800',
  laborer: 'bg-green-100 text-green-800',
}

const partyTypeIcons: { [key: string]: string } = {
  contractor: '👷',
  client: '👤',
  supplier: '📦',
  laborer: '👨‍💼',
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    party_type: 'supplier',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchParties()
  }, [])

  async function fetchParties() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Fetch error:', error)
        throw error
      }
      console.log('[v0] Fetched parties:', data)
      setParties(data || [])
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateParty(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const partyData = {
        name: formData.name,
        party_type: formData.party_type,
        contact_person: formData.contact_person,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        opening_balance: 0,
        balance: 0,
        created_by: 'demo-user-123',
      }

      console.log('[v0] Creating party:', partyData)

      const { data, error } = await supabase
        .from('parties')
        .insert([partyData])
        .select()

      if (error) {
        console.error('[v0] Insert error:', error)
        throw error
      }

      console.log('[v0] Party created:', data)

      setFormData({
        name: '',
        party_type: 'supplier',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
      })
      setIsDialogOpen(false)
      await fetchParties()
    } catch (error) {
      console.error('Error creating party:', error)
      alert('Failed to create party. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const contractors = parties.filter(p => p.party_type === 'contractor').length
  const clients = parties.filter(p => p.party_type === 'client').length
  const suppliers = parties.filter(p => p.party_type === 'supplier').length
  const laborers = parties.filter(p => p.party_type === 'laborer').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parties</h1>
          <p className="text-muted-foreground mt-2">Manage contractors, clients, suppliers, and laborers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>Create a new contractor, client, supplier, or laborer record</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateParty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Ahmed Construction Co."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="party_type">Type *</Label>
                <Select value={formData.party_type} onValueChange={(value) => setFormData({ ...formData, party_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="laborer">Laborer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  placeholder="Name of contact person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="info@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="e.g., Lahore, Karachi, Islamabad"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Adding...' : 'Add Party'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Contractors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{contractors}</div>
            <p className="text-xs text-gray-500 mt-2">Active contractors</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{clients}</div>
            <p className="text-xs text-gray-500 mt-2">Project clients</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Suppliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{suppliers}</div>
            <p className="text-xs text-gray-500 mt-2">Material suppliers</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Laborers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{laborers}</div>
            <p className="text-xs text-gray-500 mt-2">Skilled workers</p>
          </CardContent>
        </Card>
      </div>

      {/* Parties List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>All Parties</CardTitle>
          <CardDescription>
            {parties.length === 0 ? 'No parties added yet' : `${parties.length} part${parties.length !== 1 ? 'ies' : 'y'}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading parties...</div>
            </div>
          ) : parties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-gray-600 font-medium">No parties yet</p>
              <p className="text-gray-500 text-sm mt-1">Add contractors, clients, suppliers, or laborers to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {parties.map((party) => (
                <div
                  key={party.id}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{partyTypeIcons[party.party_type] || '👤'}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{party.name}</h3>
                        <Badge className={partyTypeColors[party.party_type] || 'bg-gray-100 text-gray-800'}>
                          {party.party_type}
                        </Badge>
                      </div>
                    </div>
                    {party.contact_person && (
                      <p className="text-sm text-gray-600 mt-2">Contact: {party.contact_person}</p>
                    )}
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {party.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {party.phone}
                        </div>
                      )}
                      {party.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {party.email}
                        </div>
                      )}
                      {party.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {party.city}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {party.balance > 0 ? (
                      <>
                        <div className="text-sm text-gray-600">Balance</div>
                        <div className="text-lg font-bold text-green-600">₨{party.balance?.toLocaleString('en-PK')}</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">No balance</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
