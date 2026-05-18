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
import { Plus, Calendar, MapPin, Wallet, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  location: string
  status: string
  start_date: string
  end_date: string
  estimated_budget: number
  actual_cost: number
  client_id?: string
}

const statusColors: { [key: string]: string } = {
  planning: 'bg-blue-100 text-blue-800',
  ongoing: 'bg-amber-100 text-amber-800',
  completed: 'bg-green-100 text-green-800',
  on_hold: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

const statusIcons: { [key: string]: any } = {
  planning: Clock,
  ongoing: AlertCircle,
  completed: CheckCircle2,
  on_hold: AlertCircle,
  cancelled: AlertCircle,
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    status: 'planning',
    start_date: '',
    end_date: '',
    estimated_budget: '',
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProjects()
  }, [])

  async function fetchProjects() {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[v0] Fetch error:', error)
        throw error
      }
      console.log('[v0] Fetched projects:', data)
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault()
    setIsSaving(true)
    try {
      const projectData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        status: formData.status,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        estimated_budget: formData.estimated_budget ? parseFloat(formData.estimated_budget) : 0,
        actual_cost: 0,
        created_by: 'demo-user-123',
      }

      console.log('[v0] Creating project:', projectData)

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()

      if (error) {
        console.error('[v0] Insert error:', error)
        throw error
      }

      console.log('[v0] Project created:', data)

      setFormData({
        name: '',
        description: '',
        location: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        estimated_budget: '',
      })
      setIsDialogOpen(false)
      await fetchProjects()
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    const Icon = statusIcons[status] || Clock
    return Icon
  }

  const totalBudget = projects.reduce((sum, p) => sum + (p.estimated_budget || 0), 0)
  const totalActual = projects.reduce((sum, p) => sum + (p.actual_cost || 0), 0)
  const activeProjects = projects.filter(p => p.status === 'ongoing').length
  const completedProjects = projects.filter(p => p.status === 'completed').length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-2">Manage your construction projects and track progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>Add a new construction project to track and manage</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Commercial Complex - Downtown"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Project details and scope"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Lahore, Punjab"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Estimated Budget (PKR)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="0"
                  value={formData.estimated_budget}
                  onChange={(e) => setFormData({ ...formData, estimated_budget: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                  {isSaving ? 'Creating...' : 'Create Project'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeProjects}</div>
            <p className="text-xs text-gray-500 mt-2">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
            <p className="text-xs text-gray-500 mt-2">{completedProjects} completed</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₨{(totalBudget / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">Estimated allocation</p>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₨{(totalActual / 100000).toFixed(1)}L
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}% of budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>
            {projects.length === 0 ? 'No projects created yet' : `${projects.length} project${projects.length !== 1 ? 's' : ''}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading projects...</div>
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-600 font-medium">No projects yet</p>
              <p className="text-gray-500 text-sm mt-1">Create your first project to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const StatusIcon = getStatusIcon(project.status)
                return (
                  <div
                    key={project.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <Badge className={statusColors[project.status] || 'bg-gray-100 text-gray-800'}>
                          {project.status}
                        </Badge>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {project.location}
                        </div>
                        {project.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(project.start_date).toLocaleDateString('en-PK')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Budget</div>
                      <div className="text-lg font-bold text-blue-600">₨{project.estimated_budget?.toLocaleString('en-PK')}</div>
                      {project.actual_cost > 0 && (
                        <div className="text-xs text-orange-600 mt-1">
                          Spent: ₨{project.actual_cost?.toLocaleString('en-PK')}
                        </div>
                      )}
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
