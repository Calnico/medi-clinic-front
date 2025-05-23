"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { AppointmentCard } from "./appointment-card"
import { apiRequest } from "@/app/services/api"
import { getUserData } from "@/app/services/api"

interface Appointment {
  id: number
  startTime: string
  endTime: string
  notes: string
  status:
    | "PENDING"
    | "COMPLETED"
    | "CANCELLED_BY_PATIENT"
    | "CANCELLED_BY_DOCTOR"
    | "RE_SCHEDULED"
    | "NOT_SHOW"
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

interface UpcomingAppointmentsProps {
  userId: number
  filterStatus?: "upcoming" | "past"
  onDeleteSuccess?: () => void
  pageSize?: number // <-- Aquí lo agregas
}

export function UpcomingAppointments({
  userId,
  filterStatus = "upcoming",
  onDeleteSuccess,
  pageSize = 5
}: UpcomingAppointmentsProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">(filterStatus)
  const [appointments, setAppointments] = useState<FormattedAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)


  const userData = getUserData()

  const mapStatus = (status: string): "scheduled" | "completed" | "cancelled" | "pending" => {
    switch (status) {
      case "PENDING":
        return "pending"
      case "COMPLETED":
        return "completed"
      case "CANCELLED_BY_PATIENT":
      case "CANCELLED_BY_DOCTOR":
      case "NOT_SHOW":
        return "cancelled"
      case "RE_SCHEDULED":
      default:
        return "scheduled"
    }
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        if (!userData) throw new Error("No se encontraron datos de usuario")

        let endpoint = `/appointments`
        const roles = JSON.parse(userData.role)
        const userRole = roles[0]?.authority

        if (userRole === "ROLE_DOCTOR") {
          endpoint = `/appointments/doctor/${userData.id}`
        } else if (userRole === "ROLE_USER") {
          endpoint = `/appointments/patient/${userData.id}`
        }

        const response = await apiRequest(endpoint)

        if (response.error) throw new Error(response.message)

        const formattedAppointments = response.data.map((appt: Appointment) => ({
          id: appt.id,
          doctorName: appt.doctor.fullName,
          patientName: appt.patient.fullName,
          specialty: appt.doctor.specialty?.name || "Sin especialidad",
          date: new Date(appt.startTime).toLocaleDateString(),
          time: `${new Date(appt.startTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })} - ${new Date(appt.endTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          status: mapStatus(appt.status),
          notes: appt.notes,
        }))

        setAppointments(formattedAppointments)
        setCurrentPage(0) // Reset a página 0 cuando carga nuevos datos
      } catch (err: any) {
        console.error("Error fetching appointments:", err)
        setError(err.message || "Error al obtener las citas")
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userData?.id])

  // Cancelar cita
  const handleCancelAppointment = async (appointmentId: number, cancellationReason: string) => {
    if (!userData) return
    try {
      const response = await apiRequest(
        `/appointments/${appointmentId}/cancel/${userData.id}`,
        "PATCH",
        { cancellationReason }
      )
      if (response.error) {
        alert("Error al cancelar la cita: " + response.message)
      } else {
        alert("Cita cancelada correctamente")
        setAppointments((prev) =>
          prev.map((appt) => (appt.id === appointmentId ? { ...appt, status: "cancelled" } : appt))
        )
        onDeleteSuccess?.()
      }
    } catch {
      alert("Error al conectar con el servidor")
    }
  }

  const shouldShowDoctor = () => {
    if (!userData) return false
    const roles = JSON.parse(userData.role)
    const userRole = roles[0]?.authority
    return userRole !== "ROLE_DOCTOR"
  }

  const shouldShowPatient = () => {
    if (!userData) return false
    const roles = JSON.parse(userData.role)
    const userRole = roles[0]?.authority
    return userRole === "ROLE_DOCTOR" || userRole === "ROLE_ADMIN"
  }

  // Filtra citas según estado
  const filteredAppointments = appointments.filter((appointment) => {
    if (activeTab === "upcoming") {
      return appointment.status === "scheduled" || appointment.status === "pending"
    }
    if (activeTab === "past") {
      return appointment.status === "completed" || appointment.status === "cancelled"
    }
    return true
  })

  // Paginación local
  const totalPages = Math.ceil(filteredAppointments.length / pageSize)
  const paginatedAppointments = filteredAppointments.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  )

  const handleViewDetails = (appointmentId: number) => {
    console.log("Ver detalles de la cita:", appointmentId)
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
        <CardTitle>{activeTab === "upcoming" ? "Próximas Citas" : "Historial de Citas"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue={filterStatus === "past" ? "past" : "upcoming"}
          onValueChange={(value) => {
            // TS requiere cast porque onValueChange manda string
            setActiveTab(value as "upcoming" | "past")
            setCurrentPage(0) // Resetea página al cambiar tab
          }}
        >
          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {paginatedAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay citas próximas programadas</p>
            ) : (
              paginatedAppointments.map((appointment) => (
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
                  onCancel={(cancellationReason) =>
                    handleCancelAppointment(appointment.id, cancellationReason)
                  }
                  onReschedule={() => handleReschedule(appointment.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4 space-y-4">
            {paginatedAppointments.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No hay historial de citas</p>
            ) : (
              paginatedAppointments.map((appointment) => (
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

        {/* Paginación */}
<nav
  aria-label="Paginación"
  className="flex justify-between items-center mt-4"
>
  <button
    type="button"
    className={`btn px-4 py-2 rounded ${
      currentPage === 0
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-200"
    }`}
    onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
    disabled={currentPage === 0}
    aria-disabled={currentPage === 0}
    aria-label="Página anterior"
  >
    Anterior
  </button>

  <span className="text-sm text-gray-700">
    Página <strong>{currentPage + 1}</strong> de <strong>{totalPages}</strong>
  </span>

  <button
    type="button"
    className={`btn px-4 py-2 rounded ${
      currentPage + 1 >= totalPages
        ? "opacity-50 cursor-not-allowed"
        : "hover:bg-gray-200"
    }`}
    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
    disabled={currentPage + 1 >= totalPages}
    aria-disabled={currentPage + 1 >= totalPages}
    aria-label="Página siguiente"
  >
    Siguiente
  </button>
</nav>

      </CardContent>
    </Card>
  )
}
