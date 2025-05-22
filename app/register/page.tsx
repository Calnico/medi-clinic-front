"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { authService } from "../services/auth-service"
import { specialtyService } from "../services/api"

// Define el tipo de Specialty según tu API
type Specialty = {
  id: number
  name: string
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  documentType: string
  documentNumber: string
  role: string
  specialtyId: string
  gender: string
}

const namePattern = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/
const documentNumberPattern = /^[0-9]+$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function RegisterPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      documentType: "CITIZENSHIP_CARD",
      documentNumber: "",
      role: "patient",
      specialtyId: "0",
      gender: "MALE",
    },
  })

  const selectedRole = watch("role")
  const documentType = watch("documentType")
  const password = watch("password")

  useEffect(() => {
    if (selectedRole === "doctor") {
      specialtyService
        .getAll()
        .then((data) => setSpecialties(data))
        .catch((err) => {
          console.error("Error al cargar especialidades:", err.message)
        })
    } else {
      setSpecialties([])
      setValue("specialtyId", "0")
    }
  }, [selectedRole, setValue])

  const onSubmit = async (data: FormData) => {
    setError("")
    setSuccessMessage("")

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (!data.documentNumber) {
      setError("Debe ingresar un número de documento")
      return
    }

    if (data.documentType === "EMAIL" && !data.documentNumber.includes("@")) {
      setError("Debe ingresar un correo electrónico válido")
      return
    }

    setIsLoading(true)
    try {
      const debugData = {
        ...data,
        role: data.role.toUpperCase() === "PATIENT" ? "USER" : data.role.toUpperCase(),
      }

      const response = await authService.register(debugData)
      if (response.error) {
        setError(response.message || "Error al registrar usuario")
      } else {
        setSuccessMessage("Usuario registrado exitosamente")
        setTimeout(() => router.push("/login?registered=true"), 2000)
      }
    } catch (err) {
      setError("Ocurrió un error al conectar con el servidor")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Registro</CardTitle>
          <CardDescription>
            Cree una nueva cuenta para acceder a nuestros servicios.
          </CardDescription>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  maxLength={50}
                  {...register("firstName", {
                    required: "El nombre es obligatorio",
                    pattern: {
                      value: namePattern,
                      message: "Solo letras y espacios permitidos",
                    },
                    maxLength: {
                      value: 50,
                      message: "Máximo 50 caracteres permitidos",
                    },
                  })}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  maxLength={50}
                  {...register("lastName", {
                    required: "El apellido es obligatorio",
                    pattern: {
                      value: namePattern,
                      message: "Solo letras y espacios permitidos",
                    },
                    maxLength: {
                      value: 50,
                      message: "Máximo 50 caracteres permitidos",
                    },
                  })}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentType">Tipo de Documento</Label>
              <Select
                value={documentType}
                onValueChange={(val) => setValue("documentType", val)}
              >
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Seleccione tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CITIZENSHIP_CARD">
                    Cédula de Ciudadanía
                  </SelectItem>
                  <SelectItem value="FOREIGNERS_ID_CARD">
                    Cédula de Extranjería
                  </SelectItem>
                  <SelectItem value="PASSPORT">Pasaporte</SelectItem>
                  <SelectItem value="IDENTITY_CARD">Tarjeta de Identidad</SelectItem>
                  {selectedRole === "admin" && (
                    <SelectItem value="EMAIL">Correo Electrónico</SelectItem>
                  )}
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
                maxLength={20}
                {...register("documentNumber", {
                  required: "El número de documento es obligatorio",
                  pattern:
                    documentType === "EMAIL"
                      ? {
                          value: emailPattern,
                          message: "Correo electrónico inválido",
                        }
                      : {
                          value: documentNumberPattern,
                          message: "Solo se permiten números",
                        },
                  maxLength: {
                    value: 20,
                    message: "Máximo 20 dígitos permitidos",
                  },
                })}
                aria-invalid={!!errors.documentNumber}
              />
              {errors.documentNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.documentNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Género</Label>
              <Select
                value={watch("gender")}
                onValueChange={(val) => setValue("gender", val)}
              >
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
              <Input
                id="email"
                type="email"
                maxLength={100}
                {...register("email", {
                  required: "El correo es obligatorio",
                  pattern: {
                    value: emailPattern,
                    message: "Correo electrónico inválido",
                  },
                  maxLength: {
                    value: 100,
                    message: "Máximo 100 caracteres permitidos",
                  },
                })}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                maxLength={10}
                inputMode="numeric"
                {...register("phone", {
                  required: "El teléfono es obligatorio",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "El teléfono debe tener exactamente 10 dígitos numéricos",
                  },
                })}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "")
                }}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register("password", {
                  required: "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener mínimo 6 caracteres",
                  },
                })}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  required: "Debe confirmar la contraseña",
                  validate: (value) =>
                    value === password || "Las contraseñas no coinciden",
                })}
                aria-invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={selectedRole}
                onValueChange={(val) => setValue("role", val)}
              >
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

            {selectedRole === "doctor" && (
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Select
                  value={watch("specialtyId")}
                  onValueChange={(val) => setValue("specialtyId", val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
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
