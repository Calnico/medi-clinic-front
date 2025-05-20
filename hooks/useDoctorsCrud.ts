// hooks/useDoctorsCrud.ts
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type Doctor = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  gender: string
  specialty: {
    id: string
    name: string
  } | null
  physicalLocation: {
    id: string
    name: string
  } | null
  defaultSchedule: boolean
  isActive: boolean
}

type Specialty = {
  id: string
  name: string
}

type PhysicalLocation = {
  id: string
  name: string
}

type FormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  gender: string
  password: string
  role: string
  defaultSchedule: boolean
  specialtyId: string
  physicalLocationId: string
}

export const useDoctorsCrud = () => {
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [locations, setLocations] = useState<PhysicalLocation[]>([])
  const [loading, setLoading] = useState({
    doctors: true,
    specialties: false,
    locations: false,
    submitting: false
  })
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    documentType: "CITIZENSHIP_CARD",
    documentNumber: "",
    gender: "MALE",
    password: "Contraseñ@1",
    role: "DOCTOR",
    defaultSchedule: false,
    specialtyId: "",
    physicalLocationId: ""
  })

  // Document types and genders
  const documentTypes = [
    { value: "CITIZENSHIP_CARD", label: "Cédula de ciudadanía" },
    { value: "FOREIGNERS_ID_CARD", label: "Cédula de extranjería" },
    { value: "PASSPORT", label: "Pasaporte" },
    { value: "IDENTITY_CARD", label: "Tarjeta de identidad" }
  ]

  const genders = [
    { value: "MALE", label: "Masculino" },
    { value: "FEMALE", label: "Femenino" }
  ]

  // Verify admin role
  const verifyAdmin = useCallback(() => {
    const userData = localStorage.getItem("user_data")
    if (!userData) return false
    
    try {
      const user = JSON.parse(userData)
      if (!user.role) return false
      
      const roles = JSON.parse(user.role)
      return Array.isArray(roles) && roles.some((r: any) => 
        r && typeof r === 'object' && r.authority === "ROLE_ADMIN"
      )
    } catch (error) {
      console.error("Error parsing roles:", error)
      return false
    }
  }, [])

  // Fetch data functions
  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, doctors: true }))
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        router.push("/dashboard")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=DOCTOR`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener los doctores")

      const data = await response.json()
      setDoctors(data)
    } catch (error) {
      toast.error("Error al cargar los doctores")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }))
    }
  }, [router, verifyAdmin])

  const fetchSpecialties = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, specialties: true }))
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las especialidades")

      const data = await response.json()
      setSpecialties(data.map((s: any) => ({
        id: s.id.toString(),
        name: s.name
      })))
    } catch (error) {
      toast.error("Error al cargar las especialidades")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, specialties: false }))
    }
  }, [router])

  const fetchPhysicalLocations = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, locations: true }))
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/physical-locations`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener las ubicaciones físicas")

      const data = await response.json()
      setLocations(data.map((l: any) => ({
        id: l.id.toString(),
        name: l.name
      })))
    } catch (error) {
      toast.error("Error al cargar las ubicaciones físicas")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, locations: false }))
    }
  }, [router])

  // Initialize data
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchDoctors(),
        fetchSpecialties(),
        fetchPhysicalLocations()
      ])
    }
    fetchData()
  }, [fetchDoctors, fetchSpecialties, fetchPhysicalLocations])

  // Form handlers
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }, [])

  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "CITIZENSHIP_CARD",
      documentNumber: "",
      gender: "MALE",
      password: "Contraseñ@1",
      role: "DOCTOR",
      defaultSchedule: false,
      specialtyId: "",
      physicalLocationId: ""
    })
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      setLoading(prev => ({ ...prev, submitting: true }))

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        gender: formData.gender,
        role: formData.role,
        defaultSchedule: formData.defaultSchedule,
        specialtyId: formData.specialtyId || null,
        physicalLocationId: formData.physicalLocationId || null
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear doctor")
      }

      toast.success("Doctor creado")
      await fetchDoctors()
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchDoctors, resetForm])

  const handleEdit = useCallback((doctor: Doctor) => {
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      phone: doctor.phone,
      documentType: doctor.documentType,
      documentNumber: doctor.documentNumber,
      gender: doctor.gender,
      password: "Contraseñ@1",
      role: "DOCTOR",
      defaultSchedule: doctor.defaultSchedule,
      specialtyId: doctor.specialty?.id || "",
      physicalLocationId: doctor.physicalLocation?.id || ""
    })
  }, [])

  const handleUpdate = useCallback(async (doctorId: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      setLoading(prev => ({ ...prev, submitting: true }))

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber,
        gender: formData.gender,
        defaultSchedule: formData.defaultSchedule,
        specialtyId: formData.specialtyId || null,
        physicalLocationId: formData.physicalLocationId || null
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${doctorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar doctor")
      }

      toast.success("Doctor actualizado")
      await fetchDoctors()
      resetForm()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      toast.error(errorMessage)
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchDoctors, resetForm])

  const handleDelete = useCallback(async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      setLoading(prev => ({ ...prev, doctors: true }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Doctor eliminado")
      await fetchDoctors()
    } catch (error) {
      toast.error("Error al eliminar")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }))
    }
  }, [router, verifyAdmin, fetchDoctors])

  // Helper functions for select display
  const getSelectedSpecialtyName = useCallback(() => {
    return specialties.find(s => s.id === formData.specialtyId)?.name || ""
  }, [formData.specialtyId, specialties])

  const getSelectedLocationName = useCallback(() => {
    return locations.find(l => l.id === formData.physicalLocationId)?.name || ""
  }, [formData.physicalLocationId, locations])

  return {
    doctors,
    specialties,
    locations,
    loading,
    formData,
    documentTypes,
    genders,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    getSelectedSpecialtyName,
    getSelectedLocationName,
    resetForm,
    fetchDoctors
  }
}