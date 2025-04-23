"use client"

import { Home, Users, Settings, Bell, Search, User, Calendar, FileText, BarChart, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function AdminMobileApp() {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/mobile">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Volver</span>
              </Button>
            </Link>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <span className="text-sm font-bold text-primary-foreground">MC</span>
            </div>
            <span className="font-bold">MediClinic</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <Badge className="h-2 w-2 absolute top-2 right-2 bg-red-500" />
              <span className="sr-only">Notificaciones</span>
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 pb-20">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Administrador del Sistema</p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-muted-foreground">Pacientes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <User className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Doctores</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">48</p>
                  <p className="text-sm text-muted-foreground">Citas Hoy</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <BarChart className="h-8 w-8 text-primary mb-2" />
                  <p className="text-2xl font-bold">92%</p>
                  <p className="text-sm text-muted-foreground">Ocupación</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-4">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  {[
                    { action: "Nueva cita agendada", user: "Juan Pérez", time: "Hace 10 minutos" },
                    { action: "Cita cancelada", user: "María García", time: "Hace 45 minutos" },
                    { action: "Nuevo paciente registrado", user: "Pedro López", time: "Hace 2 horas" },
                    { action: "Historial médico actualizado", user: "Dr. Carlos Rodríguez", time: "Hace 3 horas" },
                  ].map((activity, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">Ver Reporte Completo</Button>
          </TabsContent>
          <TabsContent value="users" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
              />
            </div>

            <div className="space-y-3">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Doctores</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {[
                      { name: "Dr. Carlos Rodríguez", specialty: "Medicina General", status: "active" },
                      { name: "Dra. Ana Martínez", specialty: "Pediatría", status: "active" },
                      { name: "Dr. Miguel Sánchez", specialty: "Cardiología", status: "inactive" },
                    ].map((doctor, i) => (
                      <div key={i} className="flex justify-between items-center p-2 border-b last:border-0">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={doctor.name} />
                            <AvatarFallback>
                              {doctor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                          </div>
                        </div>
                        <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                          {doctor.status === "active" ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Ver Todos
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Pacientes Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    {[
                      { name: "Juan Pérez", date: "Registrado hoy" },
                      { name: "María García", date: "Registrado ayer" },
                      { name: "Pedro López", date: "Registrado hace 3 días" },
                    ].map((patient, i) => (
                      <div key={i} className="flex justify-between items-center p-2 border-b last:border-0">
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={patient.name} />
                            <AvatarFallback>
                              {patient.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">{patient.date}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    Ver Todos
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="settings" className="mt-4">
            <Card className="mb-4">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Configuración General</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Horario de Atención</p>
                      <p className="text-sm text-muted-foreground">Lun - Vie: 8:00 - 20:00, Sáb: 9:00 - 14:00</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Duración de Citas</p>
                      <p className="text-sm text-muted-foreground">30 minutos por defecto</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Notificaciones</p>
                      <p className="text-sm text-muted-foreground">Email y SMS activados</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <div>
                      <p className="font-medium">Información de Contacto</p>
                      <p className="text-sm text-muted-foreground">Teléfono, email, dirección</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg">Seguridad</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Cambiar Contraseña</p>
                      <p className="text-sm text-muted-foreground">Última actualización: hace 30 días</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Cambiar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b">
                    <div>
                      <p className="font-medium">Autenticación de Dos Factores</p>
                      <p className="text-sm text-muted-foreground">Desactivada</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Activar
                    </Button>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <div>
                      <p className="font-medium">Sesiones Activas</p>
                      <p className="text-sm text-muted-foreground">1 sesión activa</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full">Guardar Cambios</Button>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3 text-primary">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Usuarios</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3">
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Citas</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3">
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1">Ajustes</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

