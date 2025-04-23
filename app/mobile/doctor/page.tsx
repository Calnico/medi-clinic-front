"use client"
import { Calendar, Bell, Search, Clock, Users, FileText, Settings, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export default function DoctorMobileApp() {
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
              <AvatarFallback>DR</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 pb-20">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">Dr. Carlos Rodríguez</h1>
          <p className="text-muted-foreground">Medicina General</p>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Agenda</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
          </TabsList>
          <TabsContent value="schedule" className="mt-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Hoy, {new Date().toLocaleDateString()}</h2>
                <div className="space-y-3">
                  {[
                    { time: "09:00", patient: "María García", reason: "Control anual" },
                    { time: "10:30", patient: "Pedro López", reason: "Dolor de cabeza" },
                    { time: "12:00", patient: "Ana Martínez", reason: "Seguimiento" },
                    { time: "15:30", patient: "Juan Pérez", reason: "Consulta general" },
                  ].map((appointment, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border rounded-md">
                      <div className="bg-primary/10 text-primary font-medium p-2 rounded text-center min-w-[60px]">
                        {appointment.time}
                      </div>
                      <div>
                        <p className="font-medium">{appointment.patient}</p>
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      </div>
                      <Button variant="outline" size="sm" className="ml-auto">
                        Ver
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Button className="w-full">Ver Agenda Completa</Button>
          </TabsContent>
          <TabsContent value="patients" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar pacientes..."
                className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm"
              />
            </div>
            <div className="space-y-3">
              {[
                { name: "María García", lastVisit: "15/10/2023", condition: "Hipertensión" },
                { name: "Pedro López", lastVisit: "22/09/2023", condition: "Migraña" },
                { name: "Ana Martínez", lastVisit: "05/11/2023", condition: "Diabetes tipo 2" },
                { name: "Juan Pérez", lastVisit: "Hoy", condition: "Chequeo general" },
              ].map((patient, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
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
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Última visita: {patient.lastVisit}</span>
                          </div>
                          <p className="text-sm mt-1">{patient.condition}</p>
                        </div>
                      </div>
                      <Button size="sm">Ver Historial</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="stats" className="mt-4">
            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Resumen del Mes</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">42</p>
                    <p className="text-sm text-muted-foreground">Pacientes Atendidos</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">38</p>
                    <p className="text-sm text-muted-foreground">Horas de Consulta</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">4.9</p>
                    <p className="text-sm text-muted-foreground">Calificación Promedio</p>
                  </div>
                  <div className="bg-primary/10 p-4 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">95%</p>
                    <p className="text-sm text-muted-foreground">Tasa de Satisfacción</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h2 className="font-semibold mb-4">Especialidades Más Consultadas</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Dolor de cabeza</span>
                    <span className="text-primary font-medium">32%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "32%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Problemas respiratorios</span>
                    <span className="text-primary font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "28%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Chequeos generales</span>
                    <span className="text-primary font-medium">25%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "25%" }}></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>Otros</span>
                    <span className="text-primary font-medium">15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around">
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3 text-primary">
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Agenda</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3">
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Pacientes</span>
          </Button>
          <Button variant="ghost" className="flex-1 flex flex-col items-center py-3">
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Historiales</span>
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

