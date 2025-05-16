"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentCard } from "./appointment-card"
import { apiRequest } from "@/app/services/api"
import { getUserData } from "@/app/services/api"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Stethoscope } from "lucide-react"

interface Appointment {
  id: number
  startTime: string
  endTime: string
  notes: string
  status: "PENDING" | "COMPLETED" | "CANCELLED_BY_PATIENT" | "CANCELLED_BY_DOCTOR" | "RE_SCHEDULED" | "NOT_SHOW"
  patient: {
    id: number
    firstName: string
    lastName: string
    fullName: string
  }
  doctor: {
    id: number
    firstName: string
    lastName: string
    fullName: string
    specialty: {
      name: string
    }
  }
  appointmentType: {
    name: string
  }
}

interface FormattedAppointment {
  id: number
  doctorName: string
  patientName: string
  specialty: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled" | "pending"
  notes: string
}

export function UpcomingAppointments() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        const userData = getUserData()
        
        if (!userData) {
          throw new Error("No se encontraron datos de usuario")
        }

        // Determinar el endpoint según el rol
        let endpoint = "/appointments"
        const roles = JSON.parse(userData.role)
        const userRole = roles[0]?.authority

        if (userRole === "ROLE_DOCTOR") {
          endpoint = `/appointments/doctor/${userData.id}`
        } else if (userRole === "ROLE_USER") {
          endpoint = `/appointments/patient/${userData.id}`
        }

        // Obtener citas
        const response = await apiRequest(endpoint)
        
        if (response.error) {
          throw new Error(response.message)
        }

        // Formatear citas
        const formattedAppointments = response.data.map((appt: Appointment) => ({
          id: appt.id,
          doctorName: appt.doctor.fullName,
          patientName: appt.patient.fullName,
          specialty: appt.doctor.specialty?.name || "Sin especialidad",
          date: new Date(appt.startTime).toLocaleDateString(),
          time: `${new Date(appt.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${new Date(appt.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`,
          status: mapStatus(appt.status),
          notes: appt.notes
        }))

        setAppointments(formattedAppointments)
      } catch (err: any) {
        console.error("Error fetching appointments:", err)
        setError(err.message || "Error al obtener las citas")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  // Mapear estados del backend al frontend
  const mapStatus = (status: string): "scheduled" | "completed" | "cancelled" | "pending" => {
    switch(status) {
      case "PENDING": return "pending"
      case "COMPLETED": return "completed"
      case "CANCELLED_BY_PATIENT":
      case "CANCELLED_BY_DOCTOR": 
      case "NOT_SHOW": 
        return "cancelled"
      case "RE_SCHEDULED": 
      default: 
        return "scheduled"
    }
  }

  // Determinar qué información mostrar según el rol
  const shouldShowDoctor = () => {
    const userData = getUserData()
    if (!userData) return false
    
    const roles = JSON.parse(userData.role)
    const userRole = roles[0]?.authority
    
    return userRole !== "ROLE_DOCTOR"
  }

  const shouldShowPatient = () => {
    const userData = getUserData()
    if (!userData) return false
    
    const roles = JSON.parse(userData.role)
    const userRole = roles[0]?.authority
    
    return userRole === "ROLE_DOCTOR" || userRole === "ROLE_ADMIN"
  }

  // Filtrar citas
  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "pending",
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "cancelled",
  )

  // Handlers para acciones
  const handleViewDetails = (appointmentId: number) => {
    console.log("Ver detalles de la cita:", appointmentId)
  }

  const handleCancel = (appointmentId: number) => {
    console.log("Cancelar cita:", appointmentId)
  }

  const handleReschedule = (appointmentId: number) => {
    console.log("Reprogramar cita:", appointmentId)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-4">Cargando citas...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Citas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500 py-4">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Citas</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Próximas</TabsTrigger>
            <TabsTrigger value="past">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {upcomingAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay citas próximas programadas</p>
            ) : (
              upcomingAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  id={appointment.id}
                  doctorName={appointment.doctorName}
                  patientName={appointment.patientName}
                  specialty={appointment.specialty}
                  date={appointment.date}
                  time={appointment.time}
                  status={appointment.status}
                  showDoctor={shouldShowDoctor()}
                  showPatient={shouldShowPatient()}
                  onViewDetails={() => handleViewDetails(appointment.id)}
                  onCancel={() => handleCancel(appointment.id)}
                  onReschedule={() => handleReschedule(appointment.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {pastAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay historial de citas</p>
            ) : (
              pastAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  id={appointment.id}
                  doctorName={appointment.doctorName}
                  patientName={appointment.patientName}
                  specialty={appointment.specialty}
                  date={appointment.date}
                  time={appointment.time}
                  status={appointment.status}
                  showDoctor={shouldShowDoctor()}
                  showPatient={shouldShowPatient()}
                  onViewDetails={() => handleViewDetails(appointment.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}