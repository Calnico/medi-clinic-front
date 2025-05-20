"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, Clock, List } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Specialty = {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

type AppointmentType = {
  id: string
  name: string
  durationInMinutes: number
  specialty: Specialty | null
  isGeneral: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AppointmentTypesPage() {
  const router = useRouter()
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentAppointmentType, setCurrentAppointmentType] = useState<AppointmentType | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    durationInMinutes: 30,
    specialtyId: "",
    isGeneral: false
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

  // Fetch appointment types
  const fetchAppointmentTypes = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        router.push("/dashboard")
        return
      }

      const [typesResponse, specialtiesResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })
      ])

      if (!typesResponse.ok) throw new Error("Error al obtener tipos de cita")
      if (!specialtiesResponse.ok) throw new Error("Error al obtener especialidades")

      const typesData = await typesResponse.json()
      const specialtiesData = await specialtiesResponse.json()

      setAppointmentTypes(typesData)
      setSpecialties(specialtiesData)
    } catch (error) {
      toast.error("Error al cargar los datos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointmentTypes()
  }, [])

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
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

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      const url = editMode && currentAppointmentType 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/${currentAppointmentType.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types`

      const method = editMode ? "PUT" : "POST"

      // Prepare payload according to API structure
      const payload = {
        name: formData.name,
        durationInMinutes: Number(formData.durationInMinutes),
        specialtyId: formData.specialtyId || null,
        isGeneral: formData.isGeneral
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(editMode ? "Error al actualizar" : "Error al crear")

      toast.success(editMode ? "Tipo de cita actualizado" : "Tipo de cita creado")
      fetchAppointmentTypes()
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      toast.error(editMode ? "Error al actualizar" : "Error al crear")
      console.error(error)
    }
  }

  // Delete appointment type
  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Tipo de cita eliminado")
      fetchAppointmentTypes()
    } catch (error) {
      toast.error("Error al eliminar")
      console.error(error)
    }
  }

  // Edit appointment type
  const handleEdit = (appointmentType: AppointmentType) => {
    setCurrentAppointmentType(appointmentType)
    setFormData({
      name: appointmentType.name,
      durationInMinutes: appointmentType.durationInMinutes,
      specialtyId: appointmentType.specialty?.id || "",
      isGeneral: appointmentType.isGeneral
    })
    setEditMode(true)
    setOpenDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      durationInMinutes: 30,
      specialtyId: "",
      isGeneral: false
    })
    setEditMode(false)
    setCurrentAppointmentType(null)
  }

  // Filter and paginate
  const filteredAppointmentTypes = appointmentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.specialty?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const totalPages = Math.ceil(filteredAppointmentTypes.length / itemsPerPage)
  const paginatedAppointmentTypes = filteredAppointmentTypes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Cita</CardTitle>
          <CardDescription>
            Gestiona los diferentes tipos de citas médicas y su duración
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tipos de cita..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Tipo
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
                    <TableHead>Duración</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAppointmentTypes.length > 0 ? (
                    paginatedAppointmentTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.durationInMinutes} minutos</TableCell>
                        <TableCell>{type.specialty?.name || "N/A"}</TableCell>
                        <TableCell>{type.isGeneral ? "General" : "Especializada"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(type)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(type.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        {searchTerm ? "No se encontraron resultados" : "No hay tipos de cita registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredAppointmentTypes.length > itemsPerPage && (
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Tipo de Cita" : "Nuevo Tipo de Cita"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del tipo de cita" : "Completa el formulario para agregar un nuevo tipo de cita"}
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
                <Label htmlFor="durationInMinutes" className="text-right">
                  Duración (minutos)
                </Label>
                <Input
                  id="durationInMinutes"
                  name="durationInMinutes"
                  type="number"
                  min="5"
                  step="5"
                  value={formData.durationInMinutes}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="isGeneral" className="text-right">
                  Tipo de cita
                </Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isGeneral"
                    name="isGeneral"
                    checked={formData.isGeneral}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="isGeneral">Cita general</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specialtyId" className="text-right">
                  Especialidad
                </Label>
                <Select
                  value={formData.specialtyId}
                  onValueChange={(value) => handleSelectChange("specialtyId", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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