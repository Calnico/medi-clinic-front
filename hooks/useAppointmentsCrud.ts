import { useState, useEffect } from "react"
import { getUserData } from "@/app/services/api"
import { toast } from "sonner"

// Types
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

interface Appointment {
  id: number
  startTime: string
  endTime: string
  notes: string
  createdAt: string
  updatedAt: string
  status: string
  patient: User
  doctor: User
  physicalLocation: PhysicalLocation
  appointmentType: AppointmentType
  parentAppointment: Appointment | null
  derivedAppointments: Appointment[]
}

interface TimeSlot {
  startTime: string
  endTime: string
}

interface FormData {
  patientId: string
  parentAppointmentId: string
  specialty: string
  appointmentType: string
  doctor: string
  date: string
  time: string
  reason: string
}

interface EditFormData {
  patientName: string
  doctorName: string
  appointmentTypeName: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

interface AppointmentsResponse {
  content: Appointment[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

interface CancelReason {
  cancelationReazon: string
}

export function useAppointmentsCrud() {
  // Main state
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState({
    appointments: false,
    submitting: false
  })

  // Form state for creation
  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    parentAppointmentId: "",
    specialty: "",
    appointmentType: "",
    doctor: "",
    date: "",
    time: "",
    reason: ""
  })

  // Form state for editing
  const [editFormData, setEditFormData] = useState<EditFormData>({
    patientName: "",
    doctorName: "",
    appointmentTypeName: "",
    date: "",
    startTime: "",
    endTime: "",
    notes: ""
  })

  // Related data
  const [patients, setPatients] = useState<User[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([])
  const [doctors, setDoctors] = useState<User[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    patients: false,
    parentAppointments: false,
    specialties: false,
    appointmentTypes: false,
    doctors: false,
    slots: false
  })

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 6

  useEffect(() => {
    const userData = getUserData()
    if (userData?.token) {
      fetchAppointments()
      fetchPatients()
      fetchSpecialties()
    }
  }, [])

  // Fetch appointments
  const fetchAppointments = async () => {
    setLoading(prev => ({ ...prev, appointments: true }))
    try {
      const userData = getUserData()
      let allAppointments: Appointment[] = []
      let currentPage = 0
      let hasMore = true

      // Fetch all pages to get complete history
      while (hasMore) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments?page=${currentPage}&size=100`,
          {
            headers: { 
              'Authorization': `Bearer ${userData?.token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (!response.ok) throw new Error(`Error: ${response.status}`)

        const data: AppointmentsResponse = await response.json()
        allAppointments = [...allAppointments, ...data.content]
        
        hasMore = currentPage < data.totalPages - 1
        currentPage++
      }

      setAppointments(allAppointments)
    } catch (error) {
      console.error("Error fetching appointments:", error)
      toast.error("Error al cargar las citas")
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }))
    }
  }

  // Fetch appointments by patient
  const fetchAppointmentsByPatient = async (patientId: string) => {
    setLoading(prev => ({ ...prev, appointments: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/patient/${patientId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: Appointment[] = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments by patient:", error)
      toast.error("Error al cargar las citas del paciente")
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }))
    }
  }

  // Fetch appointments by doctor
  const fetchAppointmentsByDoctor = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, appointments: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/doctor/${doctorId}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: Appointment[] = await response.json()
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments by doctor:", error)
      toast.error("Error al cargar las citas del doctor")
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }))
    }
  }

  // Fetch filtered appointments
  const fetchFilteredAppointments = async (startDate?: string, endDate?: string, status?: string) => {
    setLoading(prev => ({ ...prev, appointments: true }))
    try {
      const userData = getUserData()
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (status) params.append('status', status)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments?${params.toString()}`,
        {
          headers: { 
            'Authorization': `Bearer ${userData?.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: AppointmentsResponse = await response.json()
      setAppointments(data.content)
    } catch (error) {
      console.error("Error fetching filtered appointments:", error)
      toast.error("Error al filtrar las citas")
    } finally {
      setLoading(prev => ({ ...prev, appointments: false }))
    }
  }

  // Fetch patients
  const fetchPatients = async () => {
    setLoadingStates(prev => ({ ...prev, patients: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=USER`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: User[] = await response.json()
      setPatients(data)
    } catch (error) {
      console.error("Error fetching patients:", error)
      toast.error("Error al cargar pacientes")
    } finally {
      setLoadingStates(prev => ({ ...prev, patients: false }))
    }
  }

  // Fetch specialties
  const fetchSpecialties = async () => {
    setLoadingStates(prev => ({ ...prev, specialties: true }))
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: Specialty[] = await response.json()
      setSpecialties(data)
    } catch (error) {
      console.error("Error fetching specialties:", error)
      toast.error("Error al cargar especialidades")
    } finally {
      setLoadingStates(prev => ({ ...prev, specialties: false }))
    }
  }

  // Fetch appointment types
  const fetchAppointmentTypes = async (specialtyId: string) => {
    if (!specialtyId) return

    setLoadingStates(prev => ({ ...prev, appointmentTypes: true }))
    setAppointmentTypes([])
    setFormData(prev => ({ ...prev, appointmentType: "", doctor: "", date: "", time: "" }))

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
      toast.error("Error al cargar tipos de cita")
    } finally {
      setLoadingStates(prev => ({ ...prev, appointmentTypes: false }))
    }
  }

  // Fetch doctors by specialty
  const fetchDoctorsBySpecialty = async (specialtyId: string) => {
    if (!specialtyId) return

    setLoadingStates(prev => ({ ...prev, doctors: true }))
    setDoctors([])
    setFormData(prev => ({ ...prev, doctor: "", date: "", time: "" }))

    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/specialty/${specialtyId}`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: User[] = await response.json()
      setDoctors(data.filter(user =>
        user.roles.some((role: Role) => role.name === 'ROLE_DOCTOR')
      ))
    } catch (error) {
      console.error("Error fetching doctors:", error)
      toast.error("Error al cargar doctores")
    } finally {
      setLoadingStates(prev => ({ ...prev, doctors: false }))
    }
  }

  // Fetch available slots
  const fetchAvailableSlots = async (doctorId: string, appointmentTypeId: string) => {
    if (!doctorId || !appointmentTypeId) return

    setLoadingStates(prev => ({ ...prev, slots: true }))
    setAvailableSlots([])
    setFormData(prev => ({ ...prev, date: "", time: "" }))

    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/slots?doctorId=${doctorId}&appointmentTypeId=${appointmentTypeId}`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: TimeSlot[] = await response.json()
      setAvailableSlots(data)
    } catch (error) {
      console.error("Error fetching available slots:", error)
      toast.error("Error al cargar horarios disponibles")
    } finally {
      setLoadingStates(prev => ({ ...prev, slots: false }))
    }
  }

  // Handle form changes
  const handleChange = (field: string, value: string) => {
    const finalValue = field === "parentAppointmentId" && value === "none" ? "" : value
    setFormData(prev => ({ ...prev, [field]: finalValue }))

    if (field === "patientId") {
      setFormData(prev => ({
        ...prev,
        parentAppointmentId: "",
        specialty: "",
        appointmentType: "",
        doctor: "",
        date: "",
        time: ""
      }))
    } else if (field === "specialty") {
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

  // Handle edit form changes
  const handleEditChange = (field: string, value: string) => {
    setEditFormData(prev => ({ ...prev, [field]: value }))
  }

  // Create appointment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, submitting: true }))

    try {
      const userData = getUserData()
      if (!userData?.token) throw new Error("Sesión inválida")

      const selectedSlot = availableSlots.find((slot: TimeSlot) =>
        slot.startTime.substring(11, 19) === formData.time
      )

      if (!selectedSlot) throw new Error("Horario no válido")

      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctor),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: formData.reason,
        appointmentTypeId: parseInt(formData.appointmentType),
        parentAppointmentId: formData.parentAppointmentId ? parseInt(formData.parentAppointmentId) : null
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify(appointmentData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear cita")
      }

      toast.success("Cita creada exitosamente")
      resetForm()
      await fetchAppointments()
    } catch (error) {
      console.error("Error creating appointment:", error)
      toast.error(error instanceof Error ? error.message : "Error al crear la cita")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Update appointment
  const handleUpdate = async (appointmentId: string) => {
    setLoading(prev => ({ ...prev, submitting: true }))

    try {
      const userData = getUserData()
      if (!userData?.token) throw new Error("Sesión inválida")

      const updateData = {
        notes: editFormData.notes
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${appointmentId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`
          },
          body: JSON.stringify(updateData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar cita")
      }

      toast.success("Cita actualizada exitosamente")
      await fetchAppointments()
    } catch (error) {
      console.error("Error updating appointment:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar la cita")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Cancel appointment
  const handleCancel = async (appointmentId: string, reason: string) => {
    setLoading(prev => ({ ...prev, submitting: true }))

    try {
      const userData = getUserData()
      if (!userData?.token || !userData.id) throw new Error("Sesión inválida")

      const cancelData: CancelReason = {
        cancelationReazon: reason
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${appointmentId}/cancel/${userData.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${userData.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cancelData)
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cancelar cita")
      }

      toast.success("Cita cancelada exitosamente")
      await fetchAppointments()
    } catch (error) {
      console.error("Error canceling appointment:", error)
      toast.error(error instanceof Error ? error.message : "Error al cancelar la cita")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Change appointment status
  const handleStatusChange = async (appointmentId: string, status: string) => {
    setLoading(prev => ({ ...prev, submitting: true }))

    try {
      const userData = getUserData()
      if (!userData?.token) throw new Error("Sesión inválida")

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/${appointmentId}/status/${status}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al cambiar estado")
      }

      toast.success("Estado actualizado exitosamente")
      await fetchAppointments()
    } catch (error) {
      console.error("Error changing status:", error)
      toast.error(error instanceof Error ? error.message : "Error al cambiar estado")
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }

  // Set edit mode
  const setEditMode = (appointment: Appointment) => {
    setEditFormData({
      patientName: appointment.patient.fullName,
      doctorName: appointment.doctor.fullName,
      appointmentTypeName: appointment.appointmentType.name,
      date: new Date(appointment.startTime).toLocaleDateString('es-CO'),
      startTime: new Date(appointment.startTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      endTime: new Date(appointment.endTime).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      notes: appointment.notes
    })
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      patientId: "",
      parentAppointmentId: "",
      specialty: "",
      appointmentType: "",
      doctor: "",
      date: "",
      time: "",
      reason: ""
    })
    setEditFormData({
      patientName: "",
      doctorName: "",
      appointmentTypeName: "",
      date: "",
      startTime: "",
      endTime: "",
      notes: ""
    })
    setCurrentStep(1)
  }

  // Stepper functions
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
      case 1: return !!formData.patientId
      case 2: return true // Parent appointment is optional
      case 3: return !!formData.specialty
      case 4: return !!formData.appointmentType
      case 5: return !!formData.doctor || doctors.length === 0 // Allow to proceed if no doctors
      case 6: return !!formData.date && !!formData.time && availableSlots.length > 0
      default: return true
    }
  }

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!formData.patientId
      case 2: return true // Parent appointment is optional
      case 3: return !!formData.specialty
      case 4: return !!formData.appointmentType
      case 5: return !!formData.doctor || doctors.length === 0 // Allow to proceed if no doctors
      case 6: return !!formData.date && !!formData.time && availableSlots.length > 0
      default: return false
    }
  }

  // Fetch users by role
  const fetchUsersByRole = async (roleName: string) => {
    try {
      const userData = getUserData()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=${roleName}`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      )

      if (!response.ok) throw new Error(`Error: ${response.status}`)

      const data: User[] = await response.json()
      return data
    } catch (error) {
      console.error(`Error fetching ${roleName}s:`, error)
      toast.error(`Error al cargar ${roleName === 'USER' ? 'pacientes' : 'doctores'}`)
      return []
    }
  }

  // Helper function to check if date has available slots
  const hasAvailableSlotsForDate = (date: string): boolean => {
    return availableSlots.some(slot => slot.startTime.startsWith(date))
  }

  // Helper function to check if date is in the past
  const isDateInPast = (dateStr: string): boolean => {
    const date = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }
  const getAvailableDates = () => {
    const dates = new Map<string, string>()

    availableSlots.forEach((slot: TimeSlot) => {
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

  const getSlotsForSelectedDate = (): TimeSlot[] => {
    if (!formData.date) return []
    return availableSlots.filter((slot: TimeSlot) => slot.startTime.startsWith(formData.date))
  }

  const formatTime = (isoTime: string) => {
    const timeStr = isoTime.substring(11, 16)
    const [hours, minutes] = timeStr.split(':')
    const hourNum = parseInt(hours, 10)
    const period = hourNum >= 12 ? 'PM' : 'AM'
    const displayHour = hourNum % 12 || 12
    return `${displayHour}:${minutes} ${period}`
  }

  return {
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
    setEditMode,
    nextStep,
    prevStep,
    isStepComplete,
    getAvailableDates,
    getSlotsForSelectedDate,
    formatTime,
    hasAvailableSlotsForDate,
    isDateInPast
  }
}