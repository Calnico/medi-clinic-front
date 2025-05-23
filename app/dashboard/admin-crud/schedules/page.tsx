"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Search, Calendar, Clock, X, CalendarCheck, Calendar as CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSchedulesCrud } from "@/hooks/useSchedulesCrud"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

const daysOfWeek = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" }
]

export default function SchedulesPage() {
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [openAvailabilityDialog, setOpenAvailabilityDialog] = useState(false)
  const [selectedTab, setSelectedTab] = useState("availabilities")

  const {
    doctors,
    availabilities,
    slots,
    appointmentTypes,
    loading,
    loadingStates,
    availabilityForm,
    selectedAppointmentType,
    fetchDoctors,
    fetchDoctorAvailabilities,
    fetchSlots,
    fetchAppointmentTypes,
    handleAvailabilityChange,
    handleCreateAvailability,
    handleDeleteAvailability,
    resetAvailabilityForm,
    setSelectedAppointmentType,
    formatTimeDisplay,
    getDayLabel
  } = useSchedulesCrud()

  const handleDoctorSelect = async (doctorId: string) => {
    setSelectedDoctor(doctorId)
    if (doctorId) {
      const doctor = doctors.find(d => d.id.toString() === doctorId)
      if (doctor?.specialty?.id) {
        await Promise.all([
          fetchDoctorAvailabilities(doctorId),
          fetchAppointmentTypes(doctor.specialty.id.toString())
        ])
      }
    }
  }

  const handleAppointmentTypeChange = (typeId: string) => {
    setSelectedAppointmentType(typeId)
    if (selectedDoctor && typeId) {
      fetchSlots(selectedDoctor, typeId)
    }
  }

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDoctor) {
      await handleCreateAvailability(selectedDoctor)
      setOpenAvailabilityDialog(false)
    }
  }

  const selectedDoctorData = doctors.find(d => d.id.toString() === selectedDoctor)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Horarios</CardTitle>
          <CardDescription>
            Administra los horarios y disponibilidad de los doctores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Doctor selector */}
          <div className="mb-6">
            <Label>Seleccionar Doctor</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full sm:w-[400px] justify-start mt-2"
                  disabled={loadingStates.doctors}
                >
                  <Search className="mr-2 h-4 w-4" />
                  {selectedDoctor 
                    ? selectedDoctorData?.fullName 
                    : "Buscar y seleccionar un doctor"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar doctor..." />
                  <CommandEmpty>No se encontraron doctores.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {doctors.map((doctor) => (
                      <CommandItem 
                        key={doctor.id}
                        onSelect={() => handleDoctorSelect(doctor.id.toString())}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{doctor.fullName}</span>
                          <span className="text-sm text-muted-foreground">
                            {doctor.specialty?.name || "Sin especialidad"} - {doctor.physicalLocation?.name}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedDoctor && selectedDoctorData && (
            <>
              {/* Doctor info */}
              <div className="mb-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Doctor</span>
                    <p className="font-medium">{selectedDoctorData.fullName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Especialidad</span>
                    <p className="font-medium">{selectedDoctorData.specialty?.name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Ubicación</span>
                    <p className="font-medium">{selectedDoctorData.physicalLocation?.name || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="availabilities">
                    <CalendarCheck className="mr-2 h-4 w-4" />
                    Horarios Disponibles
                  </TabsTrigger>
                  <TabsTrigger value="slots">
                    <Clock className="mr-2 h-4 w-4" />
                    Slots de Citas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="availabilities" className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Horarios de Atención</h3>
                    <Button onClick={() => setOpenAvailabilityDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Horario
                    </Button>
                  </div>

                  {loading.availabilities ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : availabilities.length > 0 ? (
                    <div className="space-y-2">
                      {availabilities.map((availability) => (
                        <div 
                          key={availability.id} 
                          className="flex items-center justify-between p-4 border rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {availability.specificDate ? (
                                  <span>
                                    {format(new Date(availability.specificDate + 'T00:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                                  </span>
                                ) : (
                                  <span>{getDayLabel(availability.dayOfWeek)}</span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatTimeDisplay(availability.startTime)} - {formatTimeDisplay(availability.endTime)}
                                {availability.recurring && (
                                  <Badge variant="secondary" className="ml-2">Recurrente</Badge>
                                )}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAvailability(availability.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay horarios configurados para este doctor
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="slots" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Slots Disponibles por Tipo de Cita</h3>
                      <Select
                        value={selectedAppointmentType}
                        onValueChange={handleAppointmentTypeChange}
                        disabled={appointmentTypes.length === 0}
                      >
                        <SelectTrigger className="w-full sm:w-[300px]">
                          <SelectValue placeholder="Seleccione un tipo de cita" />
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

                    {selectedAppointmentType && (
                      <>
                        {loading.slots ? (
                          <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                          </div>
                        ) : slots.length > 0 ? (
                          <div className="space-y-4">
                            {/* Group slots by date */}
                            {Object.entries(
                              slots.reduce((acc, slot) => {
                                const date = slot.startTime.split('T')[0]
                                if (!acc[date]) acc[date] = []
                                acc[date].push(slot)
                                return acc
                              }, {} as Record<string, typeof slots>)
                            ).map(([date, dateSlots]) => (
                              <div key={date} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">
                                  {format(new Date(date + 'T00:00:00'), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es })}
                                </h4>
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {dateSlots.map((slot, idx) => (
                                    <Badge 
                                      key={idx} 
                                      variant="outline" 
                                      className="justify-center py-2"
                                    >
                                      {formatTimeDisplay(slot.startTime.split('T')[1])}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            No hay slots disponibles para este tipo de cita
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Availability Dialog */}
      <Dialog open={openAvailabilityDialog} onOpenChange={setOpenAvailabilityDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar Horario de Atención</DialogTitle>
            <DialogDescription>
              Configure un nuevo horario de atención para el doctor
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de horario</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={availabilityForm.recurring}
                  onCheckedChange={(checked) => handleAvailabilityChange("recurring", checked)}
                />
                <Label className="font-normal">
                  {availabilityForm.recurring ? "Horario recurrente (semanal)" : "Fecha específica"}
                </Label>
              </div>
            </div>

            {availabilityForm.recurring ? (
              <div className="space-y-2">
                <Label htmlFor="dayOfWeek">Día de la semana</Label>
                <Select
                  value={availabilityForm.dayOfWeek}
                  onValueChange={(value) => handleAvailabilityChange("dayOfWeek", value)}
                  required
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Seleccione un día" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Fecha específica</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !availabilityForm.specificDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {availabilityForm.specificDate ? (
                        format(new Date(availabilityForm.specificDate + 'T00:00:00'), "PPP", { locale: es })
                      ) : (
                        <span>Seleccione una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={availabilityForm.specificDate ? new Date(availabilityForm.specificDate + 'T00:00:00') : undefined}
                      onSelect={(date) => {
                        if (date) {
                          handleAvailabilityChange("specificDate", format(date, "yyyy-MM-dd"))
                        }
                      }}
                      locale={es}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora inicio</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={availabilityForm.startTime}
                  onChange={(e) => handleAvailabilityChange("startTime", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora fin</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={availabilityForm.endTime}
                  onChange={(e) => handleAvailabilityChange("endTime", e.target.value)}
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpenAvailabilityDialog(false)
                  resetAvailabilityForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading.submitting}>
                {loading.submitting ? "Guardando..." : "Guardar Horario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}