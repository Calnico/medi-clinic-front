"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserData, apiRequest } from "../services/api"
import { CreateAppointmentForm } from "../components/dashboard/create-appointment-form"
import { UpcomingAppointments } from "../components/dashboard/upcoming-appointments"
import { AlertCircle, User, Calendar, FileText } from "lucide-react"

interface ClosestAppointment {
  id: number
  startTime: string
  endTime: string
  notes: string
  status: string
  patient: {
    fullName: string
  }
  doctor: {
    fullName: string
  }
  appointmentType: {
    name: string
  }
}


// Helper: obtiene nombre de usuario disponible
function getUserName(data: any): string {
  if (!data) return "Usuario"
  return (
    data.username ||
    data.firstName ||
    data.name ||
    (data.email && data.email.split("@")[0]) ||
    (data.documentNumber && `Usuario ${data.documentNumber}`) ||
    "Usuario"
  )
}

export default function DashboardPage() {
  const [showDebug, setShowDebug] = useState(false)
  const userData = getUserData()

// Estado para contar citas programadas
  const [scheduledCount, setScheduledCount] = useState<number | null>(null)
  const [loadingCount, setLoadingCount] = useState(true)
  const [errorCount, setErrorCount] = useState<string | null>(null)
// Estado para ver la proxima cita
  const [closestAppointment, setClosestAppointment] = useState<ClosestAppointment | null>(null)
  const [loadingClosest, setLoadingClosest] = useState(true)
  const [errorClosest, setErrorClosest] = useState<string | null>(null)
// Estado para contar el historial de citas
const [historyCount, setHistoryCount] = useState<number | null>(null)
const [loadingHistoryCount, setLoadingHistoryCount] = useState(true)
const [errorHistoryCount, setErrorHistoryCount] = useState<string | null>(null)

 // — Funciones de fetch —
  async function fetchScheduledCount() {
    setLoadingCount(true)
    setErrorCount(null)
    try {
      const res = await apiRequest(
        `/appointments/count?status=PENDING&userId=${userData.id}`
      )
      if (res.error) {
        setErrorCount(res.message)
        setScheduledCount(null)
      } else {
        setScheduledCount(res.data?.count ?? 0)
      }
    } catch {
      setErrorCount("Error de conexión")
      setScheduledCount(null)
    } finally {
      setLoadingCount(false)
    }
  }

  async function fetchClosestAppointment() {
    setLoadingClosest(true)
    setErrorClosest(null)
    try {
      const res = await apiRequest(
        `/appointments/closest-appointment/${userData.id}`
      )
      if (res.error) {
        setErrorClosest(res.message)
        setClosestAppointment(null)
      } else {
        setClosestAppointment(res.data)
      }
    } catch {
      setErrorClosest("Error de conexión")
      setClosestAppointment(null)
    } finally {
      setLoadingClosest(false)
    }
  }

  async function fetchHistoryCount() {
    setLoadingHistoryCount(true)
    setErrorHistoryCount(null)
    try {
      const statuses = [
        "COMPLETED",
        "CANCELLED_BY_PATIENT",
        "CANCELLED_BY_DOCTOR",
      ]
      let total = 0
      for (const status of statuses) {
        const res = await apiRequest(
          `/appointments/count?status=${status}&userId=${userData.id}`
        )
        if (res.error) throw new Error(res.message)
        total += res.data?.count || 0
      }
      setHistoryCount(total)
    } catch (e: any) {
      setErrorHistoryCount(e.message)
      setHistoryCount(null)
    } finally {
      setLoadingHistoryCount(false)
    }
  }

  // Refresca los tres datos a la vez
  const refreshAll = () => {
    fetchScheduledCount()
    fetchClosestAppointment()
    fetchHistoryCount()
  }

  // Solo un useEffect, al montar o cuando userData.id cambie
  useEffect(() => {
    if (!userData?.id) return
    refreshAll()
  }, [userData?.id])

  if (!userData) {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Por favor, inicie sesión para acceder al dashboard.
          </AlertDescription>
        </Alert>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Necesita autenticación.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Ir a iniciar sesión</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userName = getUserName(userData)
  const lastName = userData.lastName || ""

  // Normalizar rol desde JSON string
  let authority: string | undefined
  try {
    const parsed = JSON.parse(userData.role || "[]")
    authority = Array.isArray(parsed) ? parsed[0]?.authority : undefined
  } catch {
    authority = userData.role
  }
  const isPatient = authority === "ROLE_USER"
  const isDoctor  = authority === "ROLE_DOCTOR"
  const isAdmin   = authority === "ROLE_ADMIN"

 return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {userName} {lastName}
          </p>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingCount ? (
                  "Cargando..."
                ) : errorCount ? (
                  <span className="text-red-500 text-sm">{errorCount}</span>
                ) : (
                  scheduledCount ?? "-"
                )}
              </div>
              <p className="text-xs text-muted-foreground">Citas pendientes</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loadingClosest ? (
                <p className="text-xs text-muted-foreground">Cargando...</p>
              ) : errorClosest ? (
                <p className="text-red-500 text-sm">{errorClosest}</p>
              ) : closestAppointment ? (
                <>
                  <p className="text-lg font-semibold">
                    {new Date(closestAppointment.startTime).toLocaleDateString()}{" "}
                    {new Date(closestAppointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {" - "}
                    {new Date(closestAppointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPatient
                      ? `Doctor: ${closestAppointment.doctor.fullName}`
                      : `Paciente: ${closestAppointment.patient.fullName}`}
                  </p>
                  <p className="text-sm">{closestAppointment.appointmentType?.name || "Sin tipo"}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No hay próxima cita programada</p>
              )}
            </CardContent>
          </Card>


            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Historial Médico</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingHistoryCount
                  ? "Cargando..."
                  : errorHistoryCount
                  ? <span className="text-red-500 text-sm">{errorHistoryCount}</span>
                  : historyCount ?? "-"}
              </div>
              <p className="text-xs text-muted-foreground">Citas completadas o canceladas</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mi Perfil</CardTitle>
              <User className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Completo</div>
              <p className="text-xs text-muted-foreground">Información actualizada</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards adicionales para doctor */}
        {isDoctor && (
          <>
            {/* Aquí puedes agregar las cards específicas para doctor */}
            <Card className="border-l-4 border-l-teal-500 shadow-sm hover:shadow transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pacientes Asignados</CardTitle>
                <User className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
          </>
        )}

        {/* Cards adicionales para admin */}
        {isAdmin && (
          <>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Usuarios Totales</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
            {/* Puedes agregar más cards para admin aquí */}
          </>
        )}
      </div>

      {/* Pestañas y contenido */}
      <Tabs
        defaultValue={
          isPatient ? "appointments" :
          isDoctor  ? "assigned"     :
          isAdmin   ? "users"        :
                     "appointments"
        }
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          {isPatient && (
            <>
              <TabsTrigger value="appointments">Mis Citas</TabsTrigger>
              <TabsTrigger value="new-appointment">Agendar Cita</TabsTrigger>
              <TabsTrigger value="medical-records">Historial Médico</TabsTrigger>
              <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            </>
          )}
          {isDoctor && (
            <>
              <TabsTrigger value="assigned">Citas Asignadas</TabsTrigger>
              <TabsTrigger value="patients">Mis Pacientes</TabsTrigger>
              <TabsTrigger value="doctor-profile">Mi Perfil</TabsTrigger>
            </>
          )}
          {isAdmin && (
            <>
              <TabsTrigger value="users">Usuarios</TabsTrigger>
              <TabsTrigger value="reports">Reportes</TabsTrigger>
              <TabsTrigger value="admin-profile">Mi Perfil</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Contenido Paciente */}
        {isPatient && (
          <>
            <TabsContent value="appointments">
              <UpcomingAppointments 
                filterStatus="upcoming" 
                userId={userData.id}
                onDeleteSuccess={refreshAll}
              />
            </TabsContent>
            <TabsContent value="new-appointment">
              <CreateAppointmentForm
                userId={userData.id}
                onSuccess={refreshAll} 
              />
            </TabsContent>
            <TabsContent value="medical-records">
              <UpcomingAppointments 
                filterStatus="past"
                userId={userData.id}
              />
            </TabsContent>
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Información personal y contacto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nombre:</strong> {userName} {lastName}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Documento:</strong> {userData.documentNumber}</p>
                  <p><strong>Teléfono:</strong> {userData.phone || userData.phoneNumber || "No disponible"}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* Contenido Doctor */}
        {isDoctor && (
          <>
            <TabsContent value="assigned">
              <UpcomingAppointments  
              userId={userData.id}
              />
            </TabsContent>
            <TabsContent value="patients">
              <Card>
                <CardHeader>
                  <CardTitle>Mis Pacientes</CardTitle>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="doctor-profile">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Información personal y especialidad</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nombre:</strong> {userName} {lastName}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                  <p><strong>Especialidad ID:</strong> {userData.specialtyId}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}

        {/* Contenido Admin */}
        {isAdmin && (
          <>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes</CardTitle>
                </CardHeader>
              </Card>
            </TabsContent>
            <TabsContent value="admin-profile">
              <Card>
                <CardHeader>
                  <CardTitle>Mi Perfil</CardTitle>
                  <CardDescription>Información personal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Nombre:</strong> {userName} {lastName}</p>
                  <p><strong>Email:</strong> {userData.email}</p>
                </CardContent>
              </Card>
              
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
