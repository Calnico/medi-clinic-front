"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const [role, setRole] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular la obtención del rol del usuario
    // En una aplicación real, esto vendría de tu sistema de autenticación
    const simulatedRole = localStorage.getItem("userRole") || "patient"
    setRole(simulatedRole)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {role === "patient" && (
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, Paciente</CardTitle>
            <CardDescription>Gestione sus citas y registros médicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/appointments">Ver Mis Citas</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/medical-records">Ver Mi Historial Médico</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {role === "doctor" && (
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, Doctor</CardTitle>
            <CardDescription>Gestione sus pacientes y horarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/schedule">Ver Mi Agenda</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/patients">Ver Mis Pacientes</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {role === "admin" && (
        <Card>
          <CardHeader>
            <CardTitle>Bienvenido, Administrador</CardTitle>
            <CardDescription>Gestione la clínica y los usuarios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link href="/manage-users">Gestionar Usuarios</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/clinic-settings">Configuración de la Clínica</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
