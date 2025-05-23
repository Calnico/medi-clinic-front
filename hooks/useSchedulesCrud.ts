import { useState, useEffect } from "react"
import { getUserData } from "@/app/services/api"
import { toast } from "sonner"

// Types (se mantienen igual)
interface Role {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

interface Specialty {
  id: number
  name: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

interface PhysicalLocation {
  id: number
  name: string
  address: string
  active: boolean
}

interface User {
  id: number
  firstName: string
  lastName: string
  phone: string
  email: string
  documentType: string
  documentNumber: string
  gender: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  roles: Role[]
  physicalLocation?: PhysicalLocation
  specialty?: Specialty
  fullName: string
  physicalLocationAddress?: string
}

interface AppointmentType {
  id: number
  name: string
  durationInMinutes: number
  specialty: Specialty
  isGeneral: boolean
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

interface Availability {
  id: number
  doctor: User
  dayOfWeek: string
  startTime: string
  endTime: string
  specificDate: string | null
  createdAt: string
  updatedAt: string
  recurring: boolean
}

interface Unavailability {
  id: number
  doctor: User
  startDate: string
  endDate: string
  reason?: string
  createdAt: string
  updatedAt: string
}

interface TimeSlot {
  startTime: string
  endTime: string
}

interface AvailabilityForm {
  dayOfWeek: string
  startTime: string
  endTime: string
  specificDate: string | null
  recurring: boolean
}

interface UnavailabilityForm {
  startDate: string
  endDate: string
  reason: string
}

export function useSchedulesCrud() {
  // State (se mantiene igual)
  const [doctors, setDoctors] = useState<User[]>([])
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([])
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [selectedAppointmentType, setSelectedAppointmentType] = useState("")

  const [loading, setLoading] = useState({
    doctors: false,
    availabilities: false,
    unavailabilities: false,
    slots: false,
    submitting: false
  })

  const [loadingStates, setLoadingStates] = useState({
    doctors: false,
    appointmentTypes: false
  })

  const [availabilityForm, setAvailabilityForm] = useState<AvailabilityForm>({
    dayOfWeek: "MONDAY",
    startTime: "08:00",
    endTime: "17:00",
    specificDate: null,
    recurring: true
  })

  const [unavailabilityForm, setUnavailabilityForm] = useState<UnavailabilityForm>({
    startDate: "",
    endDate: "",
    reason: ""
  })

  // Load doctors on mount (se mantiene igual)
  useEffect(() => {
    const userData = getUserData()
    if (userData?.token) {
      fetchDoctors()
    }
  }, [])

  // Fetch doctors (se mantiene igual)
  const fetchDoctors = async () => {
    setLoadingStates(prev => ({ ...prev, doctors: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=DOCTOR`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: User[] = await response.json()
      setDoctors(data)
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast.error("Error al cargar los doctores")
    } finally {
      setLoadingStates(prev => ({ ...prev, doctors: false }))
    }
  }

  // Fetch availabilities for a specific doctor (se mantiene igual)
  const fetchDoctorAvailabilities = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, availabilities: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/doctor/${doctorId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: Availability[] = await response.json()
      setAvailabilities(data)
    } catch (error) {
      console.error("Error fetching doctor availabilities:", error)
      toast.error("Error al cargar los horarios del doctor")
    } finally {
      setLoading(prev => ({ ...prev, availabilities: false }))
    }
  }

  // Fetch unavailabilities for a specific doctor (se mantiene igual)
  const fetchDoctorUnavailabilities = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, unavailabilities: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/unavailabilities/doctor/${doctorId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: Unavailability[] = await response.json()
      setUnavailabilities(data)
    } catch (error) {
      console.error("Error fetching doctor unavailabilities:", error)
      toast.error("Error al cargar las no disponibilidades del doctor")
    } finally {
      setLoading(prev => ({ ...prev, unavailabilities: false }))
    }
  }

  // Fetch appointment types by specialty (se mantiene igual)
  const fetchAppointmentTypes = async (specialtyId: string) => {
    setLoadingStates(prev => ({ ...prev, appointmentTypes: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/specialty/${specialtyId}`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: AppointmentType[] = await response.json()
      setAppointmentTypes(data.filter(type => type.isActive))
    } catch (error) {
      console.error("Error fetching appointment types:", error)
      toast.error("Error al cargar los tipos de cita")
    } finally {
      setLoadingStates(prev => ({ ...prev, appointmentTypes: false }))
    }
  }

  // Fetch slots (se mantiene igual)
  const fetchSlots = async (doctorId: string, appointmentTypeId: string) => {
    setLoading(prev => ({ ...prev, slots: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/slots?doctorId=${doctorId}&appointmentTypeId=${appointmentTypeId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: TimeSlot[] = await response.json()
      setSlots(data)
    } catch (error) {
      console.error("Error fetching slots:", error)
      toast.error("Error al cargar los slots disponibles")
    } finally {
      setLoading(prev => ({ ...prev, slots: false }))
    }
  }

  // Create availability (CORREGIDO)
  const handleCreateAvailability = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, submitting: true }))
    try {
      const userData = getUserData()
      if (!userData?.token) throw new Error("Sesión inválida")

      // Formatear el tiempo para que tenga el formato HH:MM:SS
      const formatTime = (time: string) => {
        if (time.split(':').length === 2) {
          return `${time}:00`
        }
        return time
      }

      const requestData = {
        doctorId: parseInt(doctorId),
        dayOfWeek: availabilityForm.recurring ? availabilityForm.dayOfWeek : null,
        startTime: formatTime(availabilityForm.startTime),
        endTime: formatTime(availabilityForm.endTime),
        specificDate: availabilityForm.recurring ? null : availabilityForm.specificDate,
        recurring: availabilityForm.recurring
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear disponibilidad")
      }

      toast.success("Horario creado exitosamente")
      resetAvailabilityForm()
      await fetchDoctorAvailabilities(doctorId)
    } catch (error) {
      console.error("Error creating availability:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear el horario")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Create unavailability (CORREGIDO)
  const handleCreateUnavailability = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, submitting: true }))
    try {
      const userData = getUserData()
      if (!userData?.token) throw new Error("Sesión inválida")

      const requestData = {
        doctorId: parseInt(doctorId),
        startDate: unavailabilityForm.startDate,
        endDate: unavailabilityForm.endDate || unavailabilityForm.startDate,
        reason: unavailabilityForm.reason || null
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/unavailabilities`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify(requestData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear no disponibilidad")
      }

      toast.success("No disponibilidad creada exitosamente")
      resetUnavailabilityForm()
      await fetchDoctorUnavailabilities(doctorId)
    } catch (error) {
      console.error("Error creating unavailability:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la no disponibilidad")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Delete availability (se mantiene igual)
  const handleDeleteAvailability = async (availabilityId: number) => {
    if (!window.confirm("¿Está seguro de eliminar este horario?")) return

    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/${availabilityId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userData?.token}`
          }
        }
      )

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Horario eliminado exitosamente")
      setAvailabilities(prev => prev.filter(a => a.id !== availabilityId))
    } catch (error) {
      console.error("Error deleting availability:", error)
      toast.error("Error al eliminar el horario")
    }
  }

  // Delete unavailability (se mantiene igual)
  const handleDeleteUnavailability = async (unavailabilityId: number) => {
    if (!window.confirm("¿Está seguro de eliminar esta no disponibilidad?")) return

    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/unavailabilities/${unavailabilityId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${userData?.token}`
          }
        }
      )

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("No disponibilidad eliminada exitosamente")
      setUnavailabilities(prev => prev.filter(u => u.id !== unavailabilityId))
    } catch (error) {
      console.error("Error deleting unavailability:", error)
      toast.error("Error al eliminar la no disponibilidad")
    }
  }

  // Handle form changes (se mantiene igual)
  const handleAvailabilityChange = (field: keyof AvailabilityForm, value: any) => {
    setAvailabilityForm(prev => ({ ...prev, [field]: value }))
  }

  const handleUnavailabilityChange = (field: keyof UnavailabilityForm, value: any) => {
    setUnavailabilityForm(prev => ({ ...prev, [field]: value }))
  }

  // Reset forms (se mantiene igual)
  const resetAvailabilityForm = () => {
    setAvailabilityForm({
      dayOfWeek: "MONDAY",
      startTime: "08:00",
      endTime: "17:00",
      specificDate: null,
      recurring: true
    })
  }

  const resetUnavailabilityForm = () => {
    setUnavailabilityForm({
      startDate: "",
      endDate: "",
      reason: ""
    })
  }

  // Helper functions (se mantiene igual)
  const formatTimeDisplay = (timeStr: string) => {
    if (timeStr.includes('T')) {
      // Format: 2025-05-22T10:30:00
      const time = timeStr.split('T')[1].substring(0, 5)
      return time
    } else {
      // Format: 10:30:00
      return timeStr.substring(0, 5)
    }
  }

  const getDayLabel = (day: string) => {
    const days: Record<string, string> = {
      MONDAY: "Lunes",
      TUESDAY: "Martes",
      WEDNESDAY: "Miércoles",
      THURSDAY: "Jueves",
      FRIDAY: "Viernes",
      SATURDAY: "Sábado",
      SUNDAY: "Domingo"
    }
    return days[day] || day
  }

  return {
    doctors,
    availabilities,
    unavailabilities,
    slots,
    appointmentTypes,
    loading,
    loadingStates,
    availabilityForm,
    unavailabilityForm,
    selectedAppointmentType,
    fetchDoctors,
    fetchDoctorAvailabilities,
    fetchDoctorUnavailabilities,
    fetchSlots,
    fetchAppointmentTypes,
    handleAvailabilityChange,
    handleUnavailabilityChange,
    handleCreateAvailability,
    handleCreateUnavailability,
    handleDeleteAvailability,
    handleDeleteUnavailability,
    resetAvailabilityForm,
    resetUnavailabilityForm,
    setSelectedAppointmentType,
    formatTimeDisplay,
    getDayLabel
  }
}