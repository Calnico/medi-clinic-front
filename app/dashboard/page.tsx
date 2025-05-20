"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserData } from "../services/api"
import { CreateAppointmentForm } from "../components/dashboard/create-appointment-form"
import { UpcomingAppointments } from "../components/dashboard/upcoming-appointments"
import { AlertCircle, User, Calendar, FileText } from "lucide-react"

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

  if (!userData) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            Por favor, inicie sesión para acceder al dashboard.
          </AlertDescription>
        </Alert>
        <Card>
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {userName} {lastName}
          </p>
        </div>
        <Button>
          {isPatient && "Agendar Nueva Cita"}
          {isDoctor  && "Ver Citas Asignadas"}
          {isAdmin   && "Gestionar Usuarios"}
        </Button>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isPatient && (
          <>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
            {/* ... otras cards para paciente ... */}
          </>
        )}
        {isDoctor && (
          <>
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Citas Asignadas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
            {/* ... otras cards para doctor ... */}
          </>
        )}
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
            {/* ... otras cards para admin ... */}
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
              <UpcomingAppointments />
            </TabsContent>
            <TabsContent value="new-appointment">
              <CreateAppointmentForm />
            </TabsContent>
            <TabsContent value="medical-records">
              <Card>
                <CardHeader>
                  <CardTitle>Historial Médico</CardTitle>
                  <CardDescription>Funcionalidad en desarrollo</CardDescription>
                </CardHeader>
              </Card>
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
              <UpcomingAppointments />
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

      {/* Debug */}
      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Ocultar depuración" : "Mostrar depuración"}
        </Button>
        {showDebug && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Depuración</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
