"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { authService } from "../services/auth-service"
import { getUserData } from "../services/api"

export default function LoginPage() {
  const [documentType, setDocumentType] = useState("CITIZENSHIP_CARD")
  const [documentNumber, setDocumentNumber] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Verificar si el usuario viene de registrarse
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccessMessage("Registro exitoso. Por favor inicie sesión con sus credenciales.")
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Intentando iniciar sesión con:", { documentType, documentNumber, password })
      const response = await authService.login(documentType, documentNumber, password)
      console.log("Respuesta de login:", response)

      if (response.error) {
        setError(response.message || "Error al iniciar sesión. Verifique sus credenciales.")
      } else {
        // Obtener el rol del usuario desde los datos guardados
        const userData = getUserData()
        console.log("Datos de usuario:", userData)

        if (!userData) {
          setError("No se pudieron obtener los datos del usuario")
          setIsLoading(false)
          return
        }

        // Determinar el rol del usuario
        let userRole = "patient"

        if (userData.role) {
          userRole = userData.role.toLowerCase()
        } else if (userData.roles && userData.roles.length > 0) {
          // Si hay un array de roles, tomar el primero
          userRole = userData.roles[0].name.toLowerCase()
        }

        console.log("Rol detectado:", userRole)

        // Redirigir según el rol
        if (userRole.includes("patient") || userRole.includes("user")) {
          router.push("/dashboard")
        } else if (userRole.includes("doctor")) {
          router.push("/dashboard")
        } else if (userRole.includes("admin")) {
          router.push("/dashboard/admin-crud")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      console.error("Error durante el login:", err)
      setError("Ocurrió un error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>Ingrese sus credenciales para acceder a su cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Seleccione tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZENSHIP_CARD">Cédula de Ciudadanía</SelectItem>
                  <SelectItem value="FOREIGNERS_ID_CARD">Cédula de Extranjería</SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  <SelectItem value="IDENTITY_CARD">Tarjeta de Identidad</SelectItem>
                  <SelectItem value="EMAIL">Correo Electrónico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="documentNumber">
                {documentType === "EMAIL" ? "Correo Electrónico" : "Número de Documento"}
              </Label>
              <Input
                id="documentNumber"
                type={documentType === "EMAIL" ? "email" : "text"}
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                required
                placeholder={documentType === "EMAIL" ? "ejemplo@correo.com" : "Ingrese su número de documento"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Recordarme
                </Label>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            ¿No tiene una cuenta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Regístrese aquí
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
