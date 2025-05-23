"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Plus, Search, Calendar, ChevronLeft, ChevronRight, Filter, X, Edit, CheckCircle, User, Stethoscope } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppointmentsCrud } from "@/hooks/useAppointmentsCrud"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"

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
  
  // Filter states
  const [filterType, setFilterType] = useState<"all" | "patient" | "doctor">("all")
  const [selectedPatientFilter, setSelectedPatientFilter] = useState("")
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("")
  const [patientsList, setPatientsList] = useState<any[]>([])
  const [doctorsList, setDoctorsList] = useState<any[]>([])
  const [loadingFilters, setLoadingFilters] = useState(false)
  
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
    fetchUsersByRole,
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

  // Load patients and doctors lists when filter type changes
  useEffect(() => {
    const loadFilterLists = async () => {
      setLoadingFilters(true)
      try {
        if (filterType === "patient" && patientsList.length === 0) {
          const patients = await fetchUsersByRole("USER")
          setPatientsList(patients)
        } else if (filterType === "doctor" && doctorsList.length === 0) {
          const doctors = await fetchUsersByRole("DOCTOR")
          setDoctorsList(doctors)
        }
      } catch (error) {
        console.error("Error loading filter lists:", error)
      } finally {
        setLoadingFilters(false)
      }
    }

    loadFilterLists()
  }, [filterType])

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

  const handleFilterTypeChange = async (value: "all" | "patient" | "doctor") => {
    setFilterType(value)
    setSelectedPatientFilter("")
    setSelectedDoctorFilter("")
    setCurrentPage(1)
    
    if (value === "all") {
      await fetchAppointments()
    }
  }

  const handlePatientFilterChange = async (patientId: string) => {
    setSelectedPatientFilter(patientId)
    if (patientId) {
      await fetchAppointmentsByPatient(patientId)
    } else {
      await fetchAppointments()
    }
  }

  const handleDoctorFilterChange = async (doctorId: string) => {
    setSelectedDoctorFilter(doctorId)
    if (doctorId) {
      await fetchAppointmentsByDoctor(doctorId)
    } else {
      await fetchAppointments()
    }
  }

  const handleCancelClick = (appointmentId: string) => {
    setCurrentAppointment(appointmentId)
    setCancelReason("")
    setOpenCancelDialog(true)
  }

  const handleCancelSubmit = async () => {
    if (currentAppointment && cancelReason.trim()) {
      await handleCancel(currentAppointment, cancelReason)
      setOpenCancelDialog(false)
      setCurrentAppointment(null)
      setCancelReason("")
    }
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
              
              {/* Filter by type */}
              <Select value={filterType} onValueChange={handleFilterTypeChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las citas</SelectItem>
                  <SelectItem value="patient">Por paciente</SelectItem>
                  <SelectItem value="doctor">Por doctor</SelectItem>
                </SelectContent>
              </Select>

              {/* Patient filter */}
              {filterType === "patient" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[240px] justify-start">
                      <User className="mr-2 h-4 w-4" />
                      {selectedPatientFilter 
                        ? patientsList.find(p => p.id.toString() === selectedPatientFilter)?.fullName 
                        : "Seleccionar paciente"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar paciente..." />
                      <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        <CommandItem onSelect={() => handlePatientFilterChange("")}>
                          Todos los pacientes
                        </CommandItem>
                        {patientsList.map((patient) => (
                          <CommandItem 
                            key={patient.id}
                            onSelect={() => handlePatientFilterChange(patient.id.toString())}
                          >
                            {patient.fullName} - {patient.documentNumber}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}

              {/* Doctor filter */}
              {filterType === "doctor" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-[240px] justify-start">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      {selectedDoctorFilter 
                        ? doctorsList.find(d => d.id.toString() === selectedDoctorFilter)?.fullName 
                        : "Seleccionar doctor"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Buscar doctor..." />
                      <CommandEmpty>No se encontraron doctores.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        <CommandItem onSelect={() => handleDoctorFilterChange("")}>
                          Todos los doctores
                        </CommandItem>
                        {doctorsList.map((doctor) => (
                          <CommandItem 
                            key={doctor.id}
                            onSelect={() => handleDoctorFilterChange(doctor.id.toString())}
                          >
                            {doctor.fullName} - {doctor.specialty?.name || "Sin especialidad"}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        disabled={loadingStates.patients}
                      >
                        {formData.patientId 
                          ? patients.find(p => p.id.toString() === formData.patientId)?.fullName 
                          : "Seleccione un paciente"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar paciente..." />
                        <CommandEmpty>No se encontraron pacientes.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {patients.map((patient) => (
                            <CommandItem 
                              key={patient.id}
                              onSelect={() => handleChange("patientId", patient.id.toString())}
                            >
                              {patient.fullName} - {patient.documentNumber}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                      {/* Aquí irían las citas anteriores del paciente */}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidad</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        disabled={loadingStates.specialties}
                      >
                        {formData.specialty 
                          ? specialties.find(s => s.id.toString() === formData.specialty)?.name 
                          : "Seleccione una especialidad"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar especialidad..." />
                        <CommandEmpty>No se encontraron especialidades.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {specialties.map((specialty) => (
                            <CommandItem 
                              key={specialty.id}
                              onSelect={() => handleChange("specialty", specialty.id.toString())}
                            >
                              {specialty.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">Tipo de Cita</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        disabled={loadingStates.appointmentTypes}
                      >
                        {formData.appointmentType 
                          ? appointmentTypes.find(t => t.id.toString() === formData.appointmentType)?.name 
                          : "Seleccione el tipo de cita"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Buscar tipo de cita..." />
                        <CommandEmpty>No se encontraron tipos de cita.</CommandEmpty>
                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                          {appointmentTypes.map((type) => (
                            <CommandItem 
                              key={type.id}
                              onSelect={() => handleChange("appointmentType", type.id.toString())}
                            >
                              {type.name} ({type.durationInMinutes} min)
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  {doctors.length === 0 && !loadingStates.doctors ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md">
                      No hay doctores disponibles para la especialidad seleccionada.
                    </div>
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          disabled={loadingStates.doctors || doctors.length === 0}
                        >
                          {formData.doctor 
                            ? doctors.find(d => d.id.toString() === formData.doctor)?.fullName 
                            : "Seleccione un doctor"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Buscar doctor..." />
                          <CommandEmpty>No se encontraron doctores.</CommandEmpty>
                          <CommandGroup className="max-h-[300px] overflow-y-auto">
                            {doctors.map((doctor) => (
                              <CommandItem 
                                key={doctor.id}
                                onSelect={() => handleChange("doctor", doctor.id.toString())}
                              >
                                {doctor.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-4">
                  {availableSlots.length === 0 && !loadingStates.slots ? (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                      <p className="font-semibold mb-1">No hay horarios disponibles</p>
                      <p className="text-sm">
                        El doctor seleccionado no tiene horarios disponibles para este tipo de cita. 
                        Por favor, seleccione otro doctor o intente más tarde.
                      </p>
                    </div>
                  ) : (
                    <>
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
                            {getAvailableDates().map(([value, display]) => {
                              const isPast = isDateInPast(value)
                              const hasSlots = hasAvailableSlotsForDate(value)
                              
                              return (
                                <SelectItem 
                                  key={value} 
                                  value={value}
                                  disabled={isPast || !hasSlots}
                                >
                                  <span className={cn(
                                    isPast && "line-through text-muted-foreground",
                                    !hasSlots && "text-muted-foreground"
                                  )}>
                                    {display}
                                    {isPast && " (Fecha pasada)"}
                                    {!isPast && !hasSlots && " (Sin horarios disponibles)"}
                                  </span>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.date && getSlotsForSelectedDate().length === 0 && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                          No hay horarios disponibles para la fecha seleccionada. Por favor, seleccione otra fecha.
                        </div>
                      )}

                      {formData.date && getSlotsForSelectedDate().length > 0 && (
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
                    </>
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
                      disabled={!isStepComplete(currentStep) || (currentStep === 5 && doctors.length === 0)}
                    >
                      Siguiente
                    </Button>
                  )}
                </div>
                {currentStep === totalSteps && (
                  <Button 
                    type="submit" 
                    disabled={loading.submitting || !isStepComplete(currentStep) || availableSlots.length === 0}
                  >
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cancelar Cita</DialogTitle>
            <DialogDescription>
              Por favor, proporcione una razón para la cancelación
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Razón de cancelación</Label>
              <Textarea
                id="cancelReason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ingrese el motivo de la cancelación..."
                rows={4}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenCancelDialog(false)
                setCancelReason("")
                setCurrentAppointment(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCancelSubmit}
              disabled={!cancelReason.trim() || loading.submitting}
              variant="destructive"
            >
              {loading.submitting ? "Cancelando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}