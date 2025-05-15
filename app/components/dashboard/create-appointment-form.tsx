"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { getUserData } from "@/app/services/api"

interface Specialty {
  id: number
  name: string
  description?: string
}

interface AppointmentType {
  id: number
  name: string
  durationInMinutes: number
  specialty: Specialty
  isGeneral: boolean
  isActive: boolean
}

interface Doctor {
  id: number
  firstName: string
  lastName: string
  email?: string
  fullName?: string
  specialty?: {
    id: number
    name: string
  }
  physicalLocation?: {
    name: string
    address: string
  }
  physicalLocationAddress?: string
}

interface TimeSlot {
  startTime: string
  endTime: string
}

interface FormDataType {
  specialty: string
  appointmentType: string
  doctor: string
  date: string
  time: string
  reason: string
}

export function CreateAppointmentForm() {
  const [formData, setFormData] = useState<FormDataType>({
    specialty: "",
    appointmentType: "",
    doctor: "",
    date: "",
    time: "",
    reason: ""
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [loadingSpecialties, setLoadingSpecialties] = useState(false)
  const [loadingAppointmentTypes, setLoadingAppointmentTypes] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  useEffect(() => {
    const userData = getUserData()
    if (userData && userData.token) {
      fetchSpecialties()
    } else {
      setError("No se encontró una sesión de usuario válida. Por favor, inicie sesión nuevamente.")
    }
  }, [])

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true)
    setError("")
    
    try {
      const userData = getUserData()
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.")
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error al cargar especialidades: ${response.status}`)
      }
      
      const data = await response.json()
      setSpecialties(data)
    } catch (err) {
      console.error("Error al cargar especialidades:", err)
      setError("No se pudieron cargar las especialidades. Por favor, refresque la página.")
    } finally {
      setLoadingSpecialties(false)
    }
  }

  const fetchAppointmentTypes = async (specialtyId: string) => {
    if (!specialtyId) return
    
    setLoadingAppointmentTypes(true)
    setError("")
    setAppointmentTypes([])
    setFormData(prev => ({ ...prev, appointmentType: "", doctor: "", date: "", time: "" }))
    
    try {
      const userData = getUserData()
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.")
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/specialty/${specialtyId}`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error al cargar tipos de cita: ${response.status}`)
      }
      
      const data = await response.json()
      setAppointmentTypes(data.filter((type: AppointmentType) => type.isActive))
    } catch (err) {
      console.error("Error al cargar tipos de cita:", err)
      setError("No se pudieron cargar los tipos de cita para esta especialidad.")
    } finally {
      setLoadingAppointmentTypes(false)
    }
  }

  const fetchDoctorsBySpecialty = async (specialtyId: string) => {
    if (!specialtyId) return
    
    setLoadingDoctors(true)
    setError("")
    setDoctors([])
    setFormData(prev => ({ ...prev, doctor: "", date: "", time: "" }))
    
    try {
      const userData = getUserData()
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.")
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/specialty/${specialtyId}`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Error al cargar doctores: ${response.status}`)
      }
      
      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      console.error("Error al cargar doctores:", err)
      setError("No se pudieron cargar los doctores para esta especialidad.")
    } finally {
      setLoadingDoctors(false)
    }
  }

  const fetchAvailableSlots = async (doctorId: string, appointmentTypeId: string) => {
    if (!doctorId || !appointmentTypeId) return
    
    setLoadingSlots(true)
    setError("")
    setAvailableSlots([])
    setFormData(prev => ({ ...prev, date: "", time: "" }))
    
    try {
      const userData = getUserData()
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.")
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/slots?doctorId=${doctorId}&appointmentTypeId=${appointmentTypeId}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error(`Error al cargar horarios disponibles: ${response.status}`)
      }
      
      const data = await response.json()
      setAvailableSlots(data)
    } catch (err) {
      console.error("Error al cargar horarios disponibles:", err)
      setError("No se pudo cargar la disponibilidad de horarios.")
    } finally {
      setLoadingSlots(false)
    }
  }

  const getAvailableDates = () => {
    const dates = new Map<string, string>()
    
    availableSlots.forEach(slot => {
      const dateStr = slot.startTime.split('T')[0]
      const dateObj = new Date(dateStr + 'T00:00:00')
      const displayDate = dateObj.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
      dates.set(dateStr, displayDate)
    })
    
    return Array.from(dates.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }

  const getSlotsForSelectedDate = () => {
    if (!formData.date) return []
    return availableSlots.filter(slot => slot.startTime.startsWith(formData.date))
  }

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return !!formData.specialty
      case 2: return !!formData.appointmentType
      case 3: return !!formData.doctor
      case 4: return !!formData.date && !!formData.time
      default: return true
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!formData.specialty
      case 2: return !!formData.appointmentType
      case 3: return !!formData.doctor
      case 4: return !!formData.date && !!formData.time
      case 5: return !!formData.reason
      default: return false
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    if (field === "specialty") {
      fetchAppointmentTypes(value)
      setFormData(prev => ({ 
        ...prev, 
        appointmentType: "", 
        doctor: "", 
        date: "", 
        time: "" 
      }))
    } else if (field === "appointmentType") {
      fetchDoctorsBySpecialty(formData.specialty)
      setFormData(prev => ({ 
        ...prev, 
        doctor: "", 
        date: "", 
        time: "" 
      }))
    } else if (field === "doctor") {
      fetchAvailableSlots(value, formData.appointmentType)
      setFormData(prev => ({ 
        ...prev, 
        date: "", 
        time: "" 
      }))
    } else if (field === "date") {
      setFormData(prev => ({ 
        ...prev, 
        time: "" 
      }))
    }
  }

  const formatTime = (isoTime: string) => {
    const timeStr = isoTime.substring(11, 16)
    const [hours, minutes] = timeStr.split(':')
    const hourNum = parseInt(hours, 10)
    const period = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      const userData = getUserData()
      
      if (!userData || !userData.id || !userData.token) {
        throw new Error("No se puede identificar al usuario o la sesión ha expirado. Por favor, inicie sesión nuevamente.")
      }

      const selectedSlot = availableSlots.find(slot => {
        const slotTimeStr = slot.startTime.substring(11, 19)
        return slotTimeStr === formData.time
      })

      if (!selectedSlot) {
        throw new Error("El horario seleccionado no es válido. Por favor, seleccione otro.")
      }

      const appointmentData = {
        patientId: parseInt(userData.id),
        doctorId: parseInt(formData.doctor),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: formData.reason,
        appointmentTypeId: parseInt(formData.appointmentType),
        parentAppointmentId: null
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify(appointmentData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al agendar la cita")
      }

      setSuccess(true)
      setFormData({
        specialty: "",
        appointmentType: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      })
      setAvailableSlots([])
      setCurrentStep(1)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error al agendar la cita"
      setError(errorMessage)
      console.error("Error al agendar cita:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Nueva Cita</CardTitle>
        <CardDescription>Complete el formulario paso a paso</CardDescription>
        
        {/* Barra de progreso */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    ${isStepComplete(step) ? 'ring-2 ring-green-500' : ''}`}
                >
                  {step}
                </div>
                <span className="text-sm mt-2 text-center">
                  {step === 1 && 'Especialidad'}
                  {step === 2 && 'Tipo de Cita'}
                  {step === 3 && 'Doctor'}
                  {step === 4 && 'Fecha/Hora'}
                  {step === 5 && 'Motivo'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-1/2 h-1 w-full bg-muted"></div>
            <div 
              className="absolute top-1/2 h-1 bg-primary transition-all duration-300"
              style={{ 
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Cita agendada exitosamente. Recibirá una confirmación por correo electrónico.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paso 1: Especialidad */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={(value) => handleChange("specialty", value)} 
                  disabled={loadingSpecialties}
                  required
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder={loadingSpecialties ? "Cargando especialidades..." : "Seleccione una especialidad"} />
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
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.specialty || loadingSpecialties}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Tipo de Cita */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentType">Tipo de Cita</Label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => handleChange("appointmentType", value)}
                  required
                  disabled={!formData.specialty || loadingAppointmentTypes}
                >
                  <SelectTrigger id="appointmentType">
                    <SelectValue 
                      placeholder={
                        !formData.specialty 
                          ? "Primero seleccione una especialidad" 
                          : loadingAppointmentTypes 
                            ? "Cargando tipos de cita..." 
                            : "Seleccione un tipo de cita"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.length === 0 && !loadingAppointmentTypes && (
                      <SelectItem value="no-types" disabled>
                        No hay tipos de cita disponibles para esta especialidad
                      </SelectItem>
                    )}
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.durationInMinutes} minutos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.appointmentType || loadingAppointmentTypes}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Doctor */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Doctor</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => handleChange("doctor", value)}
                  required
                  disabled={!formData.appointmentType || loadingDoctors}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue 
                      placeholder={
                        !formData.appointmentType 
                          ? "Primero seleccione un tipo de cita" 
                          : loadingDoctors 
                            ? "Cargando doctores..." 
                            : "Seleccione un doctor"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 && !loadingDoctors && (
                      <SelectItem value="no-doctors" disabled>
                        No hay doctores disponibles para esta especialidad
                      </SelectItem>
                    )}
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}
                        {doctor.specialty && ` - ${doctor.specialty.name}`}
                        {doctor.physicalLocationAddress && ` (${doctor.physicalLocationAddress})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.doctor || loadingDoctors}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 4: Fecha y Hora */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Select
                    value={formData.date}
                    onValueChange={(value) => handleChange("date", value)}
                    required
                    disabled={!formData.doctor || loadingSlots || availableSlots.length === 0}
                  >
                    <SelectTrigger id="date">
                      <SelectValue 
                        placeholder={
                          !formData.doctor 
                            ? "Primero seleccione un doctor" 
                            : loadingSlots 
                              ? "Cargando fechas disponibles..." 
                              : availableSlots.length === 0
                                ? "No hay fechas disponibles"
                                : "Seleccione una fecha"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map(([isoDate, displayDate]) => (
                        <SelectItem key={isoDate} value={isoDate}>
                          {displayDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => handleChange("time", value)} 
                    required
                    disabled={!formData.date || loadingSlots}
                  >
                    <SelectTrigger id="time">
                      <SelectValue 
                        placeholder={
                          !formData.date 
                            ? "Primero seleccione una fecha" 
                            : getSlotsForSelectedDate().length === 0
                              ? "No hay horarios disponibles para esta fecha"
                              : "Seleccione una hora"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getSlotsForSelectedDate().map((slot, index) => {
                        const timeStr = slot.startTime.substring(11, 19)
                        return (
                          <SelectItem key={index} value={timeStr}>
                            {formatTime(slot.startTime)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.date || !formData.time}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 5: Motivo y Envío */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la consulta</Label>
                <Textarea
                  id="reason"
                  placeholder="Describa brevemente el motivo de su consulta"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Agendando cita..." : "Agendar Cita"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}