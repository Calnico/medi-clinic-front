// app/dashboard/admin-crud/doctors/page.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Trash2, Edit, ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
    resetForm
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

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find(dt => dt.value === type)
    return docType ? docType.label.split(' ')[0] : type
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-900">Gestión de Doctores</CardTitle>
              <CardDescription className="text-blue-700">
                Administra el personal médico del sistema - {doctors.length} doctores registrados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o documento..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button onClick={() => setOpenDialog(true)} className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Nuevo Doctor
            </Button>
          </div>

          {loading.doctors || loading.specialties || loading.locations ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Cargando doctores...</p>
            </div>
          ) : (
            <>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Nombre Completo</TableHead>
                      <TableHead className="font-semibold">Contacto</TableHead>
                      <TableHead className="font-semibold">Documento</TableHead>
                      <TableHead className="font-semibold">Especialidad</TableHead>
                      <TableHead className="font-semibold">Ubicación</TableHead>
                      <TableHead className="font-semibold">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDoctors.length > 0 ? (
                      paginatedDoctors.map((doctor) => (
                        <TableRow key={doctor.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="font-medium text-gray-900">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {doctor.gender === 'MALE' ? 'Masculino' : 'Femenino'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-gray-900">{doctor.email}</div>
                            <div className="text-sm text-gray-500">{doctor.phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-sm">
                              <Badge variant="outline" className="text-xs">
                                {getDocumentTypeLabel(doctor.documentType)}
                              </Badge>
                              <div className="mt-1">{doctor.documentNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {doctor.specialty ? (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {doctor.specialty.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin especialidad</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {doctor.physicalLocation ? (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {doctor.physicalLocation.name}
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">Sin ubicación</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={doctor.isActive ? "default" : "secondary"} 
                                   className={doctor.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                              {doctor.isActive ? "Activo" : "Inactivo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 bg-gray-100 rounded-full">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-600 font-medium">
                                {searchTerm ? "No se encontraron resultados" : "No hay doctores registrados"}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {searchTerm ? "Intenta con otros términos de búsqueda" : "Comienza agregando un nuevo doctor"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {filteredDoctors.length > itemsPerPage && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDoctors.length)} de {filteredDoctors.length} doctores
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <span className="text-sm text-muted-foreground px-2">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" />
              {editMode ? "Editar Doctor" : "Registrar Nuevo Doctor"}
            </DialogTitle>
            <DialogDescription>
              {editMode ? "Modifica los datos del doctor seleccionado" : "Complete todos los campos para registrar un nuevo doctor en el sistema"}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna izquierda */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    Nombres <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="Ej: Juan Carlos"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium">
                    Apellidos <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Ej: García López"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="doctor@hospital.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Teléfono <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="Ej: +57 300 123 4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {!editMode && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña Temporal <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      El doctor deberá cambiar esta contraseña en su primer acceso
                    </p>
                  </div>
                )}
              </div>

              {/* Columna derecha */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="documentType" className="text-sm font-medium">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleSelectChange("documentType", value)}
                    required
                  >
                    <SelectTrigger id="documentType" className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Seleccione el tipo" />
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
                  <Label htmlFor="documentNumber" className="text-sm font-medium">
                    Número de Documento <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    placeholder="Ej: 12345678"
                    value={formData.documentNumber}
                    onChange={handleInputChange}
                    required
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium">
                    Género <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleSelectChange("gender", value)}
                    required
                  >
                    <SelectTrigger id="gender" className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Seleccione el género" />
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
                  <Label htmlFor="specialtyId" className="text-sm font-medium">
                    Especialidad Médica <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.specialtyId}
                    onValueChange={(value) => handleSelectChange("specialtyId", value)}
                    required
                    disabled={loading.specialties}
                  >
                    <SelectTrigger id="specialtyId" className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder={loading.specialties ? "Cargando especialidades..." : "Seleccione la especialidad"}>
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
                  <Label htmlFor="physicalLocationId" className="text-sm font-medium">
                    Ubicación Física <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.physicalLocationId}
                    onValueChange={(value) => handleSelectChange("physicalLocationId", value)}
                    required
                    disabled={loading.locations}
                  >
                    <SelectTrigger id="physicalLocationId" className="focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder={loading.locations ? "Cargando ubicaciones..." : "Seleccione la ubicación"}>
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
              </div>
            </div>
            
            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                disabled={loading.submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading.submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading.submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  editMode ? "Actualizar Doctor" : "Crear Doctor"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}