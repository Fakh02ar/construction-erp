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
import { Plus, Mail, Phone, MapPin } from 'lucide-react'

interface Party {
  id: string
  name: string
  party_type: string
  contact_person: string
  phone: string
  email: string
  address: string
  city: string
  state: string
  balance: number
}

export default function PartiesPage() {
  const [parties, setParties] = useState<Party[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    party_type: 'supplier',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchParties()
  }, [])

  async function fetchParties() {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setParties(data || [])
    } catch (error) {
      console.error('Error fetching parties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateParty(e: React.FormEvent) {
    e.preventDefault()
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from('parties').insert([
        {
          ...formData,
          created_by: user.id,
        },
      ])

      if (error) throw error

      setFormData({
        name: '',
        party_type: 'supplier',
        contact_person: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        state: '',
      })
      setIsDialogOpen(false)
      fetchParties()
    } catch (error) {
      console.error('Error creating party:', error)
    }
  }

  const partyTypeColors: Record<string, string> = {
    contractor: 'bg-purple-100 text-purple-800',
    client: 'bg-blue-100 text-blue-800',
    supplier: 'bg-green-100 text-green-800',
    laborer: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Parties</h1>
          <p className="text-muted-foreground mt-2">Manage contractors, suppliers, clients & laborers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>
                Register a new contractor, supplier, client, or laborer
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateParty} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Company or person name"
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input
                    id="contact_person"
                    placeholder="Name"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                <Button type="submit">Add Party</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Parties List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading parties...</p>
        </div>
      ) : parties.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">No parties added yet</p>
            <p className="text-sm text-muted-foreground">Add contractors, suppliers, or clients to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parties.map((party) => (
            <Card key={party.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{party.name}</h3>
                      <Badge className={partyTypeColors[party.party_type] || 'bg-gray-100 text-gray-800'}>
                        {party.party_type}
                      </Badge>
                    </div>
                    {party.contact_person && (
                      <p className="text-sm text-muted-foreground mb-2">Contact: {party.contact_person}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm">
                      {party.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail size={16} />
                          {party.email}
                        </div>
                      )}
                      {party.phone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone size={16} />
                          {party.phone}
                        </div>
                      )}
                      {party.address && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin size={16} />
                          {party.address}
                          {party.city && `, ${party.city}`}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="text-lg font-semibold">₹{party.balance?.toLocaleString() || '0'}</p>
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
