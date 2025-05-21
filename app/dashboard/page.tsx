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
      {/* Header con bienvenida y botón de acción principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {userName} {lastName}
          </p>
        </div>
        <Button className="sm:self-end">
          <Calendar className="mr-2 h-4 w-4" />
          Agendar Nueva Cita
        </Button>
      </div>

      <div className="space-y-6">
        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
              <Calendar className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Cargando...</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Historial Médico</CardTitle>
              <FileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Cargando...</p>
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

        {/* Tabs de contenido principal */}
        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto p-1">
            <TabsTrigger value="appointments" className="py-2">
              <Calendar className="mr-2 h-4 w-4 hidden sm:inline" />
              Mis Citas
            </TabsTrigger>
            <TabsTrigger value="new-appointment" className="py-2">
              <Calendar className="mr-2 h-4 w-4 hidden sm:inline" />
              Agendar Cita
            </TabsTrigger>
            <TabsTrigger value="medical-records" className="py-2">
              <FileText className="mr-2 h-4 w-4 hidden sm:inline" />
              Historial Médico
            </TabsTrigger>
            <TabsTrigger value="profile" className="py-2">
              <User className="mr-2 h-4 w-4 hidden sm:inline" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <UpcomingAppointments />
          </TabsContent>

          <TabsContent value="new-appointment">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Agendar Nueva Cita</CardTitle>
                <CardDescription>Complete el formulario para agendar su próxima cita médica</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateAppointmentForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical-records">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Historial Médico</CardTitle>
                <CardDescription>Consulte su historial médico completo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-lg font-medium mb-2">Funcionalidad en desarrollo</p>
                  <p className="max-w-md mx-auto">
                    Próximamente podrá consultar su historial médico completo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Información personal y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border bg-gray-50/50 dark:bg-gray-800/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Información Personal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Nombre:</span>
                          <span className="text-sm">{userName} {lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Email:</span>
                          <span className="text-sm">{userData?.email || "No disponible"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Documento:</span>
                          <span className="text-sm">
                            {userData?.documentType || ""}{" "}
                            {userData?.documentNumber || "No disponible"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border bg-gray-50/50 dark:bg-gray-800/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Preferencias</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Notificaciones:</span>
                          <span className="text-sm">Activadas</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Idioma:</span>
                          <span className="text-sm">Español</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline">
                      Cambiar Contraseña
                    </Button>
                    <Button>Editar Perfil</Button>
                  </div>
                </div>
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
            <CardHeader className="py-3">
              <CardTitle className="text-sm">Información de depuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs">
                <p>
                  <strong>Datos de usuario:</strong>
                </p>
                <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-auto max-h-40 text-xs">
                  {JSON.stringify(userData, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
