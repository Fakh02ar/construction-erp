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
import { Plus, Mail, Phone, MapPin, Users } from 'lucide-react'

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
}

const typeColors: { [key: string]: string } = {
  supplier: 'bg-blue-100 text-blue-800',
  contractor: 'bg-purple-100 text-purple-800',
  client: 'bg-green-100 text-green-800',
  laborer: 'bg-orange-100 text-orange-800',
  other: 'bg-gray-100 text-gray-800',
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
        .order('name')

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
      const { error } = await supabase.from('parties').insert([
        {
          ...formData,
          created_by: 'demo-user-123',
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
      await fetchParties()
    } catch (error) {
      console.error('Error creating party:', error)
    }
  }

  const partiesByType = parties.reduce(
    (acc, party) => {
      if (!acc[party.party_type]) acc[party.party_type] = 0
      acc[party.party_type]++
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parties</h1>
          <p className="text-muted-foreground mt-2">Manage contractors, suppliers, clients & laborers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Party
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Party</DialogTitle>
              <DialogDescription>Add a contractor, supplier, client, or laborer</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateParty} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Party Name *</Label>
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
                <Select
                  value={formData.party_type}
                  onValueChange={(value) => setFormData({ ...formData, party_type: value })}
                >
                  <SelectTrigger id="party_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="contractor">Contractor</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="laborer">Laborer</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
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
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
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
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Party</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {Object.keys(partiesByType).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{parties.length}</div>
                <Users className="w-8 h-8 text-primary opacity-30" />
              </div>
            </CardContent>
          </Card>
          {Object.entries(partiesByType).map(([type, count]) => (
            <Card key={type}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground capitalize">{type}s</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Parties List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading parties...</p>
          </div>
        </div>
      ) : parties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-96">
            <div className="text-center">
              <Users className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No parties added yet</h3>
              <p className="text-muted-foreground mb-4">Add contractors, suppliers, or clients to get started</p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Party
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {parties.map((party) => (
            <Card key={party.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{party.name}</h3>
                      <Badge className={typeColors[party.party_type] || typeColors.other}>
                        {party.party_type}
                      </Badge>
                    </div>
                    {party.contact_person && (
                      <p className="text-sm text-muted-foreground mb-2">Contact: {party.contact_person}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-3">
                      {party.phone && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          {party.phone}
                        </span>
                      )}
                      {party.email && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          {party.email}
                        </span>
                      )}
                      {party.city && (
                        <span className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {party.city}, {party.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
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
