// app/dashboard/admin-crud/doctors/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDoctorsCrud } from "@/hooks/useDoctorsCrud"
import { useState } from "react"

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentDoctor, setCurrentDoctor] = useState<string | null>(null)
  
  const itemsPerPage = 10
  
  const {
    doctors,
    specialties,
    locations,
    loading,
    formData,
    documentTypes,
    genders,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    getSelectedSpecialtyName,
    getSelectedLocationName,
    resetForm,
    fetchDoctors
  } = useDoctorsCrud()

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    if (editMode && currentDoctor) {
      await handleUpdate(currentDoctor)
    } else {
      await handleSubmit(e)
    }
    setOpenDialog(false)
  }

  const handleEditClick = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId)
    if (doctor) {
      handleEdit(doctor)
      setCurrentDoctor(doctorId)
      setEditMode(true)
      setOpenDialog(true)
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
      setEditMode(false)
      setCurrentDoctor(null)
    }
    setOpenDialog(open)
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

          {loading.doctors || loading.specialties || loading.locations ? (
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
                            onClick={() => handleEditClick(doctor.id)}
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
      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[650px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Doctor" : "Nuevo Doctor"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del doctor" : "Complete el formulario para registrar un nuevo doctor"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
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
                    disabled={loading.specialties}
                  >
                    <SelectTrigger id="specialtyId">
                      <SelectValue placeholder={loading.specialties ? "Cargando..." : "Seleccione una especialidad"}>
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
                    disabled={loading.locations}
                  >
                    <SelectTrigger id="physicalLocationId">
                      <SelectValue placeholder={loading.locations ? "Cargando..." : "Seleccione una ubicación"}>
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
              <Button type="submit" disabled={loading.submitting}>
                {loading.submitting ? "Procesando..." : editMode ? "Actualizar Doctor" : "Crear Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}