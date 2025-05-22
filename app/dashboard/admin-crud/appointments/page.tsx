"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Calendar, ChevronLeft, ChevronRight, Filter, X, Edit, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointmentsCrud } from "@/hooks/useAppointmentsCrud"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

const statusOptions = [
  { value: "PENDING", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "COMPLETED", label: "Completada", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED_BY_PATIENT", label: "Cancelada por paciente", color: "bg-red-100 text-red-800" },
  { value: "CANCELLED_BY_DOCTOR", label: "Cancelada por doctor", color: "bg-red-100 text-red-800" },
  { value: "RE_SCHEDULED", label: "Reprogramada", color: "bg-blue-100 text-blue-800" },
  { value: "NOT_SHOW", label: "No asistió", color: "bg-gray-100 text-gray-800" }
]

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [openStatusDialog, setOpenStatusDialog] = useState(false)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentAppointment, setCurrentAppointment] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [dateRange, setDateRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined
  })
  
  const itemsPerPage = 10
  
  const {
    appointments,
    loading,
    formData,
    patients,
    specialties,
    appointmentTypes,
    doctors,
    availableSlots,
    loadingStates,
    currentStep,
    totalSteps,
    editFormData,
    handleChange,
    handleEditChange,
    handleSubmit,
    handleUpdate,
    handleCancel,
    handleStatusChange,
    fetchAppointments,
    fetchFilteredAppointments,
    fetchAppointmentsByPatient,
    fetchAppointmentsByDoctor,
    resetForm,
    setEditMode: setEditModeHook,
    nextStep,
    prevStep,
    isStepComplete,
    getAvailableDates,
    getSlotsForSelectedDate,
    formatTime,
    hasAvailableSlotsForDate,
    isDateInPast
  } = useAppointmentsCrud()

  // Filter appointments
  const filteredAppointments = appointments.filter(appointment => {
    const searchMatch = 
      appointment.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentType.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return searchMatch
  })

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDateRangeFilter = async () => {
    if (dateRange.start || dateRange.end) {
      await fetchFilteredAppointments(
        dateRange.start?.toISOString(),
        dateRange.end?.toISOString()
      )
    }
  }

  const clearDateFilter = async () => {
    setDateRange({ start: undefined, end: undefined })
    await fetchAppointments()
  }

  const handleEditClick = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id.toString() === appointmentId)
    if (appointment) {
      setEditModeHook(appointment)
      setEditMode(true)
      setCurrentAppointment(appointmentId)
      setOpenDialog(true)
    }
  }

  const handleStatusClick = (appointmentId: string) => {
    const appointment = appointments.find(a => a.id.toString() === appointmentId)
    if (appointment) {
      setCurrentAppointment(appointmentId)
      setSelectedStatus(appointment.status)
      setOpenStatusDialog(true)
    }
  }

  const handleCancelClick = (appointmentId: string) => {
    setCurrentAppointment(appointmentId)
    setOpenCancelDialog(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editMode && currentAppointment) {
        await handleUpdate(currentAppointment)
      } else {
        await handleSubmit(e)
      }
      setOpenDialog(false)
      resetForm()
      setEditMode(false)
      setCurrentAppointment(null)
    } catch (error) {
      console.error("Error en formulario:", error)
    }
  }

  const handleStatusSubmit = async () => {
    if (currentAppointment && selectedStatus) {
      await handleStatusChange(currentAppointment, selectedStatus)
      setOpenStatusDialog(false)
      setCurrentAppointment(null)
      setSelectedStatus("")
    }
  }

  const handleCancelSubmit = async () => {
    if (currentAppointment && cancelReason) {
      await handleCancel(currentAppointment, cancelReason)
      setOpenCancelDialog(false)
      setCurrentAppointment(null)
      setCancelReason("")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status)
    return statusConfig || { label: status, color: "bg-gray-100 text-gray-800" }
  }

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
      setEditMode(false)
      setCurrentAppointment(null)
    }
    setOpenDialog(open)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Citas Médicas</CardTitle>
          <CardDescription>
            Gestiona las citas médicas del sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar citas..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.start ? (
                        dateRange.end ? (
                          <>
                            {format(dateRange.start, "dd/MM/yyyy")} -{" "}
                            {format(dateRange.end, "dd/MM/yyyy")}
                          </>
                        ) : (
                          format(dateRange.start, "dd/MM/yyyy")
                        )
                      ) : (
                        <span>Filtrar por fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-4 space-y-4">
                      <div className="space-y-2">
                        <Label>Fecha inicio</Label>
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.start}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, start: date }))}
                          locale={es}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fecha fin</Label>
                        <CalendarComponent
                          mode="single"
                          selected={dateRange.end}
                          onSelect={(date) => setDateRange(prev => ({ ...prev, end: date }))}
                          locale={es}
                        />
                      </div>
                      <Button onClick={handleDateRangeFilter} className="w-full">
                        Aplicar filtro
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                {(dateRange.start || dateRange.end) && (
                  <Button variant="ghost" size="icon" onClick={clearDateFilter}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <Button onClick={() => setOpenDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Button>
          </div>

          {loading.appointments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Tipo de Cita</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAppointments.length > 0 ? (
                    paginatedAppointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {format(new Date(appointment.startTime), "dd/MM/yyyy", { locale: es })}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(appointment.startTime), "HH:mm")} - 
                              {format(new Date(appointment.endTime), "HH:mm")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.patient.fullName}</TableCell>
                        <TableCell>
                          <div>
                            <div>{appointment.doctor.fullName}</div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.doctor.specialty?.name}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{appointment.appointmentType.name}</TableCell>
                        <TableCell>
                          <Badge className={cn(getStatusBadge(appointment.status).color)}>
                            {getStatusBadge(appointment.status).label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {appointment.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditClick(appointment.id.toString())}
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancelClick(appointment.id.toString())}
                                  title="Cancelar"
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusClick(appointment.id.toString())}
                              title="Cambiar estado"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        {searchTerm || dateRange.start || dateRange.end 
                          ? "No se encontraron resultados" 
                          : "No hay citas registradas"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {filteredAppointments.length > itemsPerPage && (
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Editar Cita" : "Nueva Cita"}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? "Modifica los datos de la cita" 
                : `Paso ${currentStep} de ${totalSteps}`}
            </DialogDescription>
          </DialogHeader>
          
          {editMode ? (
            // Edit form
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <Input value={editFormData.patientName} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Doctor</Label>
                  <Input value={editFormData.doctorName} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Tipo de Cita</Label>
                  <Input value={editFormData.appointmentTypeName} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input value={editFormData.date} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Hora Inicio</Label>
                  <Input value={editFormData.startTime} disabled />
                </div>
                
                <div className="space-y-2">
                  <Label>Hora Fin</Label>
                  <Input value={editFormData.endTime} disabled />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas / Razón</Label>
                <Textarea
                  id="notes"
                  value={editFormData.notes}
                  onChange={(e) => handleEditChange("notes", e.target.value)}
                  rows={3}
                  placeholder="Actualizar notas de la cita..."
                />
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={loading.submitting}>
                  {loading.submitting ? "Actualizando..." : "Actualizar Cita"}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            // Create form with steps
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {currentStep === 1 && (
                <div className="space-y-2">
                  <Label htmlFor="patientId">Paciente</Label>
                  <Select
                    value={formData.patientId}
                    onValueChange={(value) => handleChange("patientId", value)}
                    disabled={loadingStates.patients}
                  >
                    <SelectTrigger id="patientId">
                      <SelectValue placeholder="Seleccione un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.fullName} - {patient.documentNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-2">
                  <Label htmlFor="parentAppointmentId">Cita Anterior (Opcional)</Label>
                  <Select
                    value={formData.parentAppointmentId || "none"}
                    onValueChange={(value) => handleChange("parentAppointmentId", value)}
                    disabled={loadingStates.parentAppointments}
                  >
                    <SelectTrigger id="parentAppointmentId">
                      <SelectValue placeholder="Seleccione una cita anterior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguna</SelectItem>
                      {formData.patientId && appointments
                        .filter(a => a.patient.id.toString() === formData.patientId)
                        .map(appointment => (
                          <SelectItem 
                            key={appointment.id} 
                            value={appointment.id.toString()}
                          >
                            {format(new Date(appointment.startTime), "dd/MM/yyyy HH:mm")} - {appointment.appointmentType.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(value) => handleChange("specialty", value)}
                    disabled={loadingStates.specialties}
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Seleccione una especialidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id.toString()}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Tipo de Cita</Label>
                  <Select
                    value={formData.appointmentType}
                    onValueChange={(value) => handleChange("appointmentType", value)}
                    disabled={loadingStates.appointmentTypes}
                  >
                    <SelectTrigger id="appointmentType">
                      <SelectValue placeholder="Seleccione el tipo de cita" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name} ({type.durationInMinutes} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select
                    value={formData.doctor}
                    onValueChange={(value) => handleChange("doctor", value)}
                    disabled={loadingStates.doctors}
                  >
                    <SelectTrigger id="doctor">
                      <SelectValue placeholder="Seleccione un doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Select
                      value={formData.date}
                      onValueChange={(value) => handleChange("date", value)}
                      disabled={loadingStates.slots}
                    >
                      <SelectTrigger id="date">
                        <SelectValue placeholder="Seleccione una fecha" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableDates().map(([value, display]) => (
                          <SelectItem key={value} value={value}>
                            {display}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.date && (
                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) => handleChange("time", value)}
                      >
                        <SelectTrigger id="time">
                          <SelectValue placeholder="Seleccione una hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSlotsForSelectedDate().map((slot) => (
                            <SelectItem 
                              key={slot.startTime} 
                              value={slot.startTime.substring(11, 19)}
                            >
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Razón de la consulta</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                      rows={3}
                      placeholder="Describa el motivo de la consulta..."
                    />
                  </div>
                </div>
              )}

              <DialogFooter className="flex justify-between">
                <div className="flex gap-2">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      Anterior
                    </Button>
                  )}
                  {currentStep < totalSteps && (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!isStepComplete(currentStep)}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
                {currentStep === totalSteps && (
                  <Button type="submit" disabled={loading.submitting || !isStepComplete(currentStep)}>
                    {loading.submitting ? "Creando..." : "Crear Cita"}
                  </Button>
                )}
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={openStatusDialog} onOpenChange={setOpenStatusDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Cita</DialogTitle>
            <DialogDescription>
              Seleccione el nuevo estado para la cita
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleStatusSubmit}
              disabled={!selectedStatus || loading.submitting}
            >
              {loading.submitting ? "Actualizando..." : "Cambiar Estado"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              Por favor ingrese la razón de la cancelación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Razón de cancelación</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                placeholder="Ingrese la razón de la cancelación..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleCancelSubmit}
              disabled={!cancelReason || loading.submitting}
            >
              {loading.submitting ? "Cancelando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}