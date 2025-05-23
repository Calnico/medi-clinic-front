// app/dashboard/admin-crud/specialties/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Specialty = {
  id: string
  name: string
  description: string
}

export default function SpecialtiesPage() {
  const router = useRouter()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentSpecialty, setCurrentSpecialty] = useState<Specialty | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  // Verify admin role
  const verifyAdmin = () => {
    const userData = localStorage.getItem("user_data")
    if (!userData) return false
    
    try {
      const user = JSON.parse(userData)
      if (!user.role) return false
      
      const roles = JSON.parse(user.role)
      return Array.isArray(roles) && roles.some((r: any) => 
        r && typeof r === 'object' && r.authority === "ROLE_ADMIN"
      )
    } catch (error) {
      console.error("Error parsing roles:", error)
      return false
    }
  }

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      // Verify admin role
      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        router.push("/dashboard")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las especialidades")

      const data = await response.json()
      setSpecialties(data)
    } catch (error) {
      toast.error("Error al cargar las especialidades")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      // Verify admin role
      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      const url = editMode && currentSpecialty 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties/${currentSpecialty.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`

      const method = editMode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error(editMode ? "Error al actualizar" : "Error al crear")

      toast.success(editMode ? "Especialidad actualizada" : "Especialidad creada")
      fetchSpecialties()
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      toast.error(editMode ? "Error al actualizar" : "Error al crear")
      console.error(error)
    }
  }

  

  // Edit specialty
  const handleEdit = (specialty: Specialty) => {
    setCurrentSpecialty(specialty)
    setFormData({
      name: specialty.name,
      description: specialty.description
    })
    setEditMode(true)
    setOpenDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: ""
    })
    setEditMode(false)
    setCurrentSpecialty(null)
  }

  // Filter and paginate
  const filteredSpecialties = specialties.filter(specialty =>
    specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    specialty.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredSpecialties.length / itemsPerPage)
  const paginatedSpecialties = filteredSpecialties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Especialidades Médicas</CardTitle>
          <CardDescription>
            Gestiona las especialidades que pueden tener los médicos
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar especialidades..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Especialidad
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSpecialties.length > 0 ? (
                    paginatedSpecialties.map((specialty) => (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium">{specialty.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{specialty.description}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(specialty)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        {searchTerm ? "No se encontraron resultados" : "No hay especialidades registradas"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredSpecialties.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={(open) => {
        if (!open) resetForm()
        setOpenDialog(open)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Especialidad" : "Nueva Especialidad"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos de la especialidad" : "Completa el formulario para agregar una nueva especialidad"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descripción
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  rows={4}
                  required
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {editMode ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}