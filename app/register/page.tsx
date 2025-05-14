"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { authService } from "../services/auth-service"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    documentType: "CITIZENSHIP_CARD",
    documentNumber: "",
    role: "patient", // Esto se mapeará a "USER" en el backend
    specialtyId: 5, // Valor por defecto
    gender: "MALE",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSpecialtyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, specialtyId: Number.parseInt(value) }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setDebugInfo(null)

    // Validar que las contraseñas coincidan
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar que se haya ingresado un número de documento
    if (!formData.documentNumber) {
      setError("Debe ingresar un número de documento")
      return
    }

    // Si el tipo de documento es EMAIL, validar que sea un correo válido
    if (formData.documentType === "EMAIL" && !formData.documentNumber.includes("@")) {
      setError("Debe ingresar un correo electrónico válido")
      return
    }

    setIsLoading(true)

    try {
      // Crear una copia del formData para depuración
      const debugData = {
        ...formData,
        role: formData.role.toUpperCase() === "PATIENT" ? "USER" : formData.role.toUpperCase(),
      }
      setDebugInfo(debugData)

      const response = await authService.register(formData)
      console.log("Respuesta de registro:", response)

      if (response.error) {
        setError(response.message || "Error al registrar usuario")
        setDebugInfo(response)
      } else {
        setSuccessMessage("Usuario registrado exitosamente")
        // Redirigir a la página de inicio de sesión después de un breve retraso
        setTimeout(() => {
          router.push("/login?registered=true")
        }, 2000)
      }
    } catch (err) {
      console.error("Error durante el registro:", err)
      setError("Ocurrió un error al conectar con el servidor")
      setDebugInfo(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>Cree una nueva cuenta para acceder a nuestros servicios.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={formData.documentType} onValueChange={handleSelectChange("documentType")}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Seleccione tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZENSHIP_CARD">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="FOREIGNERS_ID_CARD">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  <SelectItem value="IDENTITY_CARD">Tarjeta de Identidad</SelectItem>
                  {formData.role === "admin" && <SelectItem value="EMAIL">Correo Electrónico</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            

            <div className="space-y-2">
              <Label htmlFor="documentNumber">
                {formData.documentType === "EMAIL" ? "Correo Electrónico" : "Número de Documento"}
              </Label>
              <Input
                id="documentNumber"
                name="documentNumber"
                type={formData.documentType === "EMAIL" ? "email" : "text"}
                value={formData.documentNumber}
                onChange={handleChange}
                placeholder={
                  formData.documentType === "EMAIL" ? "ejemplo@correo.com" : "Ingrese su número de documento"
                }
                required
              />
            </div>

                    <div className="space-y-2">
          <Label htmlFor="gender">Género</Label>
          <Select value={formData.gender} onValueChange={handleSelectChange("gender")}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccione su género" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Masculino</SelectItem>
              <SelectItem value="FEMALE">Femenino</SelectItem>
              <SelectItem value="OTHER">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>



            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={formData.role} onValueChange={handleSelectChange("role")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione su rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Paciente</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Select value={formData.specialtyId.toString()} onValueChange={handleSpecialtyChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Medicina General</SelectItem>
                    <SelectItem value="2">Pediatría</SelectItem>
                    <SelectItem value="3">Cardiología</SelectItem>
                    <SelectItem value="4">Dermatología</SelectItem>
                    <SelectItem value="5">Ginecología</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿Ya tiene una cuenta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Inicie sesión aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
