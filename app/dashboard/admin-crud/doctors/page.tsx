"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, User, Mail, Phone, FileText } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Doctor = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  gender: string
  specialty: {
    id: string
    name: string
  } | null
  physicalLocation: {
    id: string
    name: string
  } | null
  defaultSchedule: boolean
  isActive: boolean
}

type Specialty = {
  id: string
  name: string
}

type PhysicalLocation = {
  id: string
  name: string
}

export default function DoctorsPage() {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [locations, setLocations] = useState<PhysicalLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentType: "CITIZENSHIP_CARD",
    documentNumber: "",
    gender: "MALE",
    password: "Contraseñ@1",
    role: "DOCTOR",
    defaultSchedule: false,
    specialtyId: "",
    physicalLocationId: ""
  })

  // Document types and genders
  const documentTypes = [
    { value: "CITIZENSHIP_CARD", label: "Cédula de ciudadanía" },
    { value: "FOREIGNERS_ID_CARD", label: "Cédula de extranjería" },
    { value: "PASSPORT", label: "Pasaporte" },
    { value: "IDENTITY_CARD", label: "Tarjeta de identidad" }
  ]

  const genders = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Femenino" }
  ]

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

  // Fetch doctors
  const fetchDoctors = async () => {
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=DOCTOR`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener los doctores")

      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      toast.error("Error al cargar los doctores")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch specialties
  const fetchSpecialties = async () => {
    try {
      setLoadingSpecialties(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las especialidades")

      const data = await response.json()
      setSpecialties(data.map((s: any) => ({
        id: s.id.toString(),
        name: s.name
      })))
    } catch (error) {
      toast.error("Error al cargar las especialidades")
      console.error(error)
    } finally {
      setLoadingSpecialties(false)
    }
  }

  // Fetch physical locations
  const fetchPhysicalLocations = async () => {
    try {
      setLoadingLocations(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las ubicaciones físicas")

      const data = await response.json()
      setLocations(data.map((l: any) => ({
        id: l.id.toString(),
        name: l.name
      })))
    } catch (error) {
      toast.error("Error al cargar las ubicaciones físicas")
      console.error(error)
    } finally {
      setLoadingLocations(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchSpecialties()
    fetchPhysicalLocations()
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

      const url = editMode && currentDoctor 
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${currentDoctor.id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`

      const method = editMode ? "PUT" : "POST"

      // Prepare payload according to API structure
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        gender: formData.gender,
        role: formData.role,
        defaultSchedule: formData.defaultSchedule,
        specialtyId: formData.specialtyId || null,
        physicalLocationId: formData.physicalLocationId || null
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || (editMode ? "Error al actualizar" : "Error al crear"))
      }

      toast.success(editMode ? "Doctor actualizado" : "Doctor creado")
      fetchDoctors()
      setOpenDialog(false)
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      toast.error(errorMessage)
      console.error(error)
    }
  }

  // Delete doctor
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Doctor eliminado")
      fetchDoctors()
    } catch (error) {
      toast.error("Error al eliminar")
      console.error(error)
    }
  }

  // Edit doctor
  const handleEdit = (doctor: Doctor) => {
    setCurrentDoctor(doctor)
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      documentType: doctor.documentType,
      documentNumber: doctor.documentNumber,
      gender: doctor.gender,
      password: "Contraseñ@1",
      role: "DOCTOR",
      defaultSchedule: doctor.defaultSchedule,
      specialtyId: doctor.specialty?.id || "",
      physicalLocationId: doctor.physicalLocation?.id || ""
    })
    setEditMode(true)
    setOpenDialog(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "CITIZENSHIP_CARD",
      documentNumber: "",
      gender: "MALE",
      password: "Contraseñ@1",
      role: "DOCTOR",
      defaultSchedule: false,
      specialtyId: "",
      physicalLocationId: ""
    })
    setEditMode(false)
    setCurrentDoctor(null)
  }

  // Filter and paginate
  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.documentNumber.includes(searchTerm)
  )

  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage)
  const paginatedDoctors = filteredDoctors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Helper functions for select display
  const getSelectedSpecialtyName = () => {
    return specialties.find(s => s.id === formData.specialtyId)?.name || ""
  }

  const getSelectedLocationName = () => {
    return locations.find(l => l.id === formData.physicalLocationId)?.name || ""
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Doctores</CardTitle>
          <CardDescription>
            Gestiona los médicos del sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar doctores..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Doctor
            </Button>
          </div>

          {loading || loadingSpecialties || loadingLocations ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Especialidad</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDoctors.length > 0 ? (
                    paginatedDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell className="font-medium">{doctor.firstName} {doctor.lastName}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.phone}</TableCell>
                        <TableCell>
                          {doctor.documentType === 'CITIZENSHIP_CARD' ? 'CC' : 
                           doctor.documentType === 'FOREIGNERS_ID_CARD' ? 'CE' :
                           doctor.documentType === 'PASSPORT' ? 'PA' : 'TI'} {doctor.documentNumber}
                        </TableCell>
                        <TableCell>{doctor.specialty?.name || "N/A"}</TableCell>
                        <TableCell>{doctor.physicalLocation?.name || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(doctor)}
                            className="mr-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {searchTerm ? "No se encontraron resultados" : "No hay doctores registrados"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredDoctors.length > itemsPerPage && (
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
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Doctor" : "Nuevo Doctor"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del doctor" : "Complete el formulario para registrar un nuevo doctor"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleSelectChange("documentType", value)}
                    required
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Seleccione un género" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialtyId">Especialidad</Label>
                  <Select
                    value={formData.specialtyId}
                    onValueChange={(value) => handleSelectChange("specialtyId", value)}
                    required
                    disabled={loadingSpecialties}
                  >
                    <SelectTrigger id="specialtyId">
                      <SelectValue placeholder={loadingSpecialties ? "Cargando..." : "Seleccione una especialidad"}>
                        {getSelectedSpecialtyName()}
                      </SelectValue>
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

                <div className="space-y-2">
                  <Label htmlFor="physicalLocationId">Ubicación Física</Label>
                  <Select
                    value={formData.physicalLocationId}
                    onValueChange={(value) => handleSelectChange("physicalLocationId", value)}
                    required
                    disabled={loadingLocations}
                  >
                    <SelectTrigger id="physicalLocationId">
                      <SelectValue placeholder={loadingLocations ? "Cargando..." : "Seleccione una ubicación"}>
                        {getSelectedLocationName()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="defaultSchedule"
                    name="defaultSchedule"
                    checked={formData.defaultSchedule}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="defaultSchedule">Horario por defecto</Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {editMode ? "Actualizar Doctor" : "Crear Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}