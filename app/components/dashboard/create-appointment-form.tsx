"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle } from "lucide-react"

export function CreateAppointmentForm() {
  const [formData, setFormData] = useState({
    specialty: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Aquí iría la lógica para enviar los datos al backend
      // Por ahora, simulamos una respuesta exitosa después de 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccess(true)
      setFormData({
        specialty: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      })
    } catch (err) {
      setError("Ocurrió un error al agendar la cita. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Nueva Cita</CardTitle>
        <CardDescription>Complete el formulario para solicitar una cita médica</CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Cita agendada exitosamente. Recibirá una confirmación por correo electrónico.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Select value={formData.specialty} onValueChange={(value) => handleChange("specialty", value)} required>
              <SelectTrigger id="specialty">
                <SelectValue placeholder="Seleccione una especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">Medicina General</SelectItem>
                <SelectItem value="pediatria">Pediatría</SelectItem>
                <SelectItem value="ginecologia">Ginecología</SelectItem>
                <SelectItem value="cardiologia">Cardiología</SelectItem>
                <SelectItem value="dermatologia">Dermatología</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={formData.doctor}
              onValueChange={(value) => handleChange("doctor", value)}
              required
              disabled={!formData.specialty}
            >
              <SelectTrigger id="doctor">
                <SelectValue
                  placeholder={formData.specialty ? "Seleccione un doctor" : "Primero seleccione una especialidad"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="doctor1">Dr. Carlos Rodríguez</SelectItem>
                <SelectItem value="doctor2">Dra. Ana Martínez</SelectItem>
                <SelectItem value="doctor3">Dr. Miguel Sánchez</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Select value={formData.time} onValueChange={(value) => handleChange("time", value)} required>
                <SelectTrigger id="time">
                  <SelectValue placeholder="Seleccione una hora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="08:00">08:00 AM</SelectItem>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motivo de la consulta</Label>
            <Textarea
              id="reason"
              placeholder="Describa brevemente el motivo de su consulta"
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Agendando cita..." : "Agendar Cita"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
