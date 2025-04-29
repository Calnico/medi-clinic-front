"use client"

import { useState } from "react"
import { Home, Calendar, User, Bell, Menu, Search, Clock, Star, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import Link from "next/link"

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[385px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 p-4 border-b">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Avatar" />
                      <AvatarFallback>JP</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">Juan Pérez</p>
                      <p className="text-sm text-muted-foreground">Paciente</p>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <ul className="space-y-2">
                      <li>
                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                          <Home className="h-5 w-5 text-primary" />
                          <span>Inicio</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                          <Calendar className="h-5 w-5 text-primary" />
                          <span>Mis Citas</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                          <User className="h-5 w-5 text-primary" />
                          <span>Mi Perfil</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                          <Heart className="h-5 w-5 text-primary" />
                          <span>Mis Doctores Favoritos</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100">
                          <Bell className="h-5 w-5 text-primary" />
                          <span>Notificaciones</span>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                  <div className="p-4 border-t">
                    <Button variant="outline" className="w-full">
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
              <AvatarFallback>JP</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === "home" && (
          <div className="pb-20">
            {/* Search Bar */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar doctores, especialidades..." className="pl-10" />
              </div>
            </div>

            {/* Upcoming Appointment */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Próxima Cita</h2>
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3">
                      <Avatar>
                        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Doctor" />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Dr. Carlos Rodríguez</p>
                        <p className="text-sm text-muted-foreground">Medicina General</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-primary" />
                          <span className="text-xs">Hoy, 15:30</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Categories */}
            <div className="px-4 mb-6">
              <h2 className="text-lg font-semibold mb-2">Especialidades</h2>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { name: "General", icon: "stethoscope" },
                  { name: "Dental", icon: "tooth" },
                  { name: "Cardio", icon: "heart" },
                  { name: "Pediátrico", icon: "baby" },
                ].map((category, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                      <Image src={`/placeholder.svg?height=24&width=24`} alt={category.name} width={24} height={24} />
                    </div>
                    <span className="text-xs text-center">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Doctors */}
            <div className="px-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Doctores Destacados</h2>
                <Button variant="link" size="sm" className="text-primary">
                  Ver todos
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { name: "Dr. Carlos Rodríguez", specialty: "Medicina General", rating: 4.9 },
                  { name: "Dra. Ana Martínez", specialty: "Pediatría", rating: 4.8 },
                  { name: "Dr. Miguel Sánchez", specialty: "Cardiología", rating: 4.7 },
                ].map((doctor, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
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
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span className="text-xs">{doctor.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm">Reservar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Health Articles */}
            <div className="px-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Artículos de Salud</h2>
                <Button variant="link" size="sm" className="text-primary">
                  Ver todos
                </Button>
              </div>
              <div className="space-y-3">
                {[
                  { title: "Consejos para una alimentación saludable", image: "food" },
                  { title: "Importancia del ejercicio diario", image: "exercise" },
                ].map((article, i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex">
                        <div className="w-24 h-24">
                          <Image
                            src={`/placeholder.svg?height=96&width=96`}
                            alt={article.title}
                            width={96}
                            height={96}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="p-3 flex-1">
                          <p className="font-medium line-clamp-2">{article.title}</p>
                          <Button variant="link" size="sm" className="text-primary p-0 h-auto mt-1">
                            Leer más
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="p-4 pb-20">
            <h1 className="text-xl font-bold mb-4">Mis Citas</h1>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <Button variant="outline" className="rounded-full" size="sm">
                Todas
              </Button>
              <Button variant="outline" className="rounded-full bg-primary text-white" size="sm">
                Próximas
              </Button>
              <Button variant="outline" className="rounded-full" size="sm">
                Completadas
              </Button>
              <Button variant="outline" className="rounded-full" size="sm">
                Canceladas
              </Button>
            </div>

            <div className="space-y-3">
              {[
                {
                  doctor: "Dr. Carlos Rodríguez",
                  specialty: "Medicina General",
                  date: "Hoy, 15:30",
                  status: "confirmed",
                },
                {
                  doctor: "Dra. Ana Martínez",
                  specialty: "Pediatría",
                  date: "Mañana, 10:00",
                  status: "confirmed",
                },
                {
                  doctor: "Dr. Miguel Sánchez",
                  specialty: "Cardiología",
                  date: "23 Nov, 16:15",
                  status: "confirmed",
                },
              ].map((appointment, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <Avatar>
                          <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={appointment.doctor} />
                          <AvatarFallback>
                            {appointment.doctor
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{appointment.doctor}</p>
                          <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-primary" />
                            <span className="text-xs">{appointment.date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                        {appointment.status === "confirmed" ? "Confirmada" : "Pendiente"}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        Reprogramar
                      </Button>
                      <Button size="sm" className="flex-1">
                        Ver Detalles
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="p-4 pb-20">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Avatar" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <h1 className="text-xl font-bold">Juan Pérez</h1>
              <p className="text-muted-foreground">Paciente</p>
            </div>

            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">Información Personal</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre</span>
                    <span>Juan Pérez</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>juan.perez@ejemplo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Teléfono</span>
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Nacimiento</span>
                    <span>15/05/1985</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Género</span>
                    <span>Masculino</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Editar Información
                </Button>
              </CardContent>
            </Card>

            <Card className="mb-4">
              <CardContent className="p-4">
                <h2 className="font-semibold mb-2">Historial Médico</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Grupo Sanguíneo</span>
                    <span>A+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alergias</span>
                    <span>Ninguna</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condiciones Crónicas</span>
                    <span>Ninguna</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Historial Completo
                </Button>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full">
              Cerrar Sesión
            </Button>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="p-4 pb-20">
            <h1 className="text-xl font-bold mb-4">Notificaciones</h1>

            <div className="space-y-3">
              {[
                {
                  title: "Recordatorio de Cita",
                  message: "Tiene una cita con el Dr. Carlos Rodríguez mañana a las 15:30.",
                  time: "Hace 2 horas",
                  read: false,
                },
                {
                  title: "Resultados Disponibles",
                  message: "Sus resultados de laboratorio ya están disponibles para su revisión.",
                  time: "Ayer",
                  read: true,
                },
                {
                  title: "Promoción Especial",
                  message: "20% de descuento en consultas de pediatría durante este mes.",
                  time: "Hace 2 días",
                  read: true,
                },
              ].map((notification, i) => (
                <Card key={i} className={notification.read ? "" : "border-primary"}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{notification.title}</h3>
                          {!notification.read && <Badge className="h-2 w-2 rounded-full p-0 bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-3 ${activeTab === "home" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Inicio</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-3 ${activeTab === "appointments" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <Calendar className="h-5 w-5" />
            <span className="text-xs mt-1">Citas</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-3 ${activeTab === "profile" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Perfil</span>
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 flex flex-col items-center py-3 ${activeTab === "notifications" ? "text-primary" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs mt-1">Alertas</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
