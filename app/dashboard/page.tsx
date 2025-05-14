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

// Datos de ejemplo
const mockAppointments = [
  {
    id: 1,
    doctorName: "Dr. Carlos Rodríguez",
    patientName: "Juan Pérez",
    specialty: "Medicina General",
    date: "15 de Mayo, 2023",
    time: "10:30 AM",
    status: "scheduled" as const,
  },
  {
    id: 2,
    doctorName: "Dra. Ana Martínez",
    patientName: "María García",
    specialty: "Pediatría",
    date: "20 de Mayo, 2023",
    time: "09:00 AM",
    status: "scheduled" as const,
  },
  {
    id: 3,
    doctorName: "Dr. Miguel Sánchez",
    patientName: "Pedro López",
    specialty: "Cardiología",
    date: "10 de Abril, 2023",
    time: "11:15 AM",
    status: "completed" as const,
  },
  {
    id: 4,
    doctorName: "Dra. Laura Gómez",
    patientName: "Ana Rodríguez",
    specialty: "Dermatología",
    date: "5 de Mayo, 2023",
    time: "16:00 PM",
    status: "cancelled" as const,
  },
]

const mockPatients = [
  {
    id: 1,
    name: "Juan Pérez",
    documentType: "CC",
    documentNumber: "1234567890",
    email: "juan.perez@ejemplo.com",
    phone: "3001234567",
    lastVisit: "10 de Abril, 2023",
    status: "active" as const,
  },
  {
    id: 2,
    name: "María García",
    documentType: "CC",
    documentNumber: "0987654321",
    email: "maria.garcia@ejemplo.com",
    phone: "3109876543",
    lastVisit: "15 de Marzo, 2023",
    status: "active" as const,
  },
  {
    id: 3,
    name: "Pedro López",
    documentType: "CE",
    documentNumber: "5678901234",
    email: "pedro.lopez@ejemplo.com",
    phone: "3205678901",
    lastVisit: "20 de Febrero, 2023",
    status: "inactive" as const,
  },
]

// Función para obtener el nombre del usuario
function getUserName(userData: any): string {
  if (!userData) return "Usuario"

  // Intentar diferentes propiedades donde podría estar el nombre
  if (userData.username) return userData.username
  if (userData.firstName) return userData.firstName
  if (userData.name) return userData.name

  // Si no hay ninguna de las propiedades anteriores, usar el email o documentNumber
  if (userData.email) return userData.email.split("@")[0]
  if (userData.documentNumber) return `Usuario ${userData.documentNumber}`

  return "Usuario"
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDebug, setShowDebug] = useState(false)

  useEffect(() => {
    try {
      // Obtener datos del usuario
      const data = getUserData()
      console.log("Datos de usuario obtenidos:", data)

      if (data) {
        setUserData(data)
      } else {
        console.log("No se pudieron obtener datos de usuario")
        setError("No se pudieron obtener datos de usuario. Por favor, inicie sesión nuevamente.")
      }
    } catch (err) {
      console.error("Error al obtener datos de usuario:", err)
      setError(`Error al cargar datos: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleViewAppointmentDetails = (appointmentId: string | number) => {
    console.log("Ver detalles de la cita:", appointmentId)
  }

  const handleCancelAppointment = (appointmentId: string | number) => {
    console.log("Cancelar cita:", appointmentId)
  }

  const handleRescheduleAppointment = (appointmentId: string | number) => {
    console.log("Reprogramar cita:", appointmentId)
  }

  const handleViewPatientDetails = (patientId: string | number) => {
    console.log("Ver detalles del paciente:", patientId)
  }

  const handleViewPatientHistory = (patientId: string | number) => {
    console.log("Ver historial del paciente:", patientId)
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  // Si hay un error, mostrar mensaje de error
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>Por favor, inicie sesión para acceder al dashboard</CardDescription>
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

  // Obtener el nombre del usuario para mostrar
  const userName = getUserName(userData)
  const lastName = userData?.lastName || ""

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido, {userName} {lastName}
          </p>
        </div>

        <Button>Agendar Nueva Cita</Button>
      </div>

      {/* Dashboard Universal */}
      <div className="space-y-6">
        {/* Mostrar estadísticas básicas para todos los usuarios */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Citas Programadas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Próximos 30 días</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próxima Cita</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15 Mayo</div>
              <p className="text-xs text-muted-foreground">10:30 AM - Dr. Carlos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Historial Médico</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Consultas registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Mi Perfil</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Completo</div>
              <p className="text-xs text-muted-foreground">Información actualizada</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="appointments" className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
            <TabsTrigger value="appointments">Mis Citas</TabsTrigger>
            <TabsTrigger value="new-appointment">Agendar Cita</TabsTrigger>
            <TabsTrigger value="medical-records">Historial Médico</TabsTrigger>
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            <UpcomingAppointments
              appointments={mockAppointments}
              showDoctor={true}
              onViewDetails={handleViewAppointmentDetails}
              onCancel={handleCancelAppointment}
              onReschedule={handleRescheduleAppointment}
            />
          </TabsContent>

          <TabsContent value="new-appointment">
            <CreateAppointmentForm />
          </TabsContent>

          <TabsContent value="medical-records">
            <Card>
              <CardHeader>
                <CardTitle>Historial Médico</CardTitle>
                <CardDescription>Consulte su historial médico completo</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-4">
                  Funcionalidad en desarrollo. Próximamente podrá consultar su historial médico completo.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil</CardTitle>
                <CardDescription>Información personal y preferencias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Información Personal</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Nombre:</span> {userName} {lastName}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Email:</span> {userData?.email || "No disponible"}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Documento:</span> {userData?.documentType || ""}{" "}
                          {userData?.documentNumber || "No disponible"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Preferencias</h3>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium">Notificaciones:</span> Activadas
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Idioma:</span> Español
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="outline" className="mr-2">
                      Cambiar Contraseña
                    </Button>
                    <Button>Editar Perfil</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Botón de depuración discreto */}
      <div className="mt-8 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-muted-foreground"
        >
          {showDebug ? "Ocultar información de depuración" : "Mostrar información de depuración"}
        </Button>

        {showDebug && (
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Información de depuración</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs">
                <p>
                  <strong>Datos de usuario:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-40">
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
