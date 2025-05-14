"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppointmentCard } from "./appointment-card"

interface Appointment {
  id: string | number
  doctorName?: string
  patientName?: string
  specialty?: string
  date: string | Date
  time: string
  status: "scheduled" | "completed" | "cancelled" | "pending"
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[]
  showDoctor?: boolean
  showPatient?: boolean
  onViewDetails: (appointmentId: string | number) => void
  onCancel: (appointmentId: string | number) => void
  onReschedule: (appointmentId: string | number) => void
}

export function UpcomingAppointments({
  appointments,
  showDoctor = false,
  showPatient = false,
  onViewDetails,
  onCancel,
  onReschedule,
}: UpcomingAppointmentsProps) {
  const [activeTab, setActiveTab] = useState("upcoming")

  const upcomingAppointments = appointments.filter(
    (appointment) => appointment.status === "scheduled" || appointment.status === "pending",
  )

  const pastAppointments = appointments.filter(
    (appointment) => appointment.status === "completed" || appointment.status === "cancelled",
  )

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
                  showDoctor={showDoctor}
                  showPatient={showPatient}
                  onViewDetails={() => onViewDetails(appointment.id)}
                  onCancel={() => onCancel(appointment.id)}
                  onReschedule={() => onReschedule(appointment.id)}
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
                  showDoctor={showDoctor}
                  showPatient={showPatient}
                  onViewDetails={() => onViewDetails(appointment.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
