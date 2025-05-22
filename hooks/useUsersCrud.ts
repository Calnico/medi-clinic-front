// hooks/useUsersCrud.ts
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  gender: string
  isActive: boolean
  roles: {
    id: string
    name: string
  }[]
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
}

export const useUsersCrud = () => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState({
    users: true,
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
    role: "USER"
  })

  // Document types and genders (sin el rol DOCTOR para creación)
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

  // Solo USER y ADMIN para creación de usuarios
  const roles = [
    { value: "USER", label: "Paciente" },
    { value: "ADMIN", label: "Administrador" }
  ]

  // Get token from localStorage
  const getAuthToken = useCallback(() => {
    const userData = localStorage.getItem("user_data")
    if (!userData) return null
    
    try {
      const user = JSON.parse(userData)
      return user.token || null
    } catch (error) {
      console.error("Error parsing user data:", error)
      return null
    }
  }, [])

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

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      const token = getAuthToken()
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener los usuarios")

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error("Error al cargar los usuarios")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, getAuthToken])

  // Fetch users by role
  const fetchUsersByRole = useCallback(async (roleName: string) => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      const token = getAuthToken()
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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/roles?roleName=${roleName}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al obtener los usuarios por rol")

      const data = await response.json()
      setUsers(data)
    } catch (error) {
      toast.error("Error al cargar los usuarios por rol")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, getAuthToken])

  // Initialize data
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

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
    console.log("🧹 [DEBUG] resetForm llamado - limpiando formulario")
    const newFormData = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      documentType: "CITIZENSHIP_CARD",
      documentNumber: "",
      gender: "MALE",
      password: "Contraseñ@1",
      role: "USER"
    }
    console.log("📋 [DEBUG] Nuevo formData:", newFormData)
    setFormData(newFormData)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🚀 [DEBUG] handleSubmit iniciado")
    console.log("📋 [DEBUG] formData:", formData)
    
    try {
      const token = getAuthToken()
      console.log("🔑 [DEBUG] token obtenido:", token ? "✅ Existe" : "❌ No existe")
      
      if (!token) {
        console.log("❌ [DEBUG] No hay token, redirigiendo a login")
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const isAdmin = verifyAdmin()
      console.log("👑 [DEBUG] Es admin:", isAdmin)
      
      if (!isAdmin) {
        console.log("❌ [DEBUG] No es admin")
        toast.error("No tienes permisos de administrador")
        return
      }

      console.log("⏳ [DEBUG] Iniciando envío...")
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
        role: formData.role
      }

      console.log("📦 [DEBUG] payload preparado:", payload)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log("📡 [DEBUG] Respuesta recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ [DEBUG] Error del servidor:", errorData)
        throw new Error(errorData.message || "Error al crear usuario")
      }

      const responseData = await response.json()
      console.log("✅ [DEBUG] Usuario creado exitosamente:", responseData)

      toast.success("Usuario creado exitosamente")
      console.log("🔄 [DEBUG] Actualizando lista de usuarios...")
      await fetchUsers()
      console.log("🧹 [DEBUG] Limpiando formulario...")
      resetForm()
      console.log("✅ [DEBUG] handleSubmit completado exitosamente")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      console.log("💥 [DEBUG] Error capturado:", error)
      console.log("📝 [DEBUG] Mensaje de error:", errorMessage)
      toast.error(errorMessage)
    } finally {
      console.log("🏁 [DEBUG] Finalizando envío...")
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchUsers, resetForm, getAuthToken])

  const handleEdit = useCallback((user: User) => {
    const mainRole = user.roles.find(r => r.name === "ROLE_ADMIN") ? "ADMIN" : "USER"

    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      documentType: user.documentType,
      documentNumber: user.documentNumber,
      gender: user.gender,
      password: "Contraseñ@1", // Placeholder, no se envía en modo edición
      role: mainRole
    })
  }, [])

  const handleUpdate = useCallback(async (userId: string) => {
    console.log("🔄 [DEBUG] handleUpdate iniciado para userId:", userId)
    console.log("📋 [DEBUG] formData para actualización:", formData)
    
    try {
      const token = getAuthToken()
      console.log("🔑 [DEBUG] token obtenido:", token ? "✅ Existe" : "❌ No existe")
      
      if (!token) {
        console.log("❌ [DEBUG] No hay token, redirigiendo a login")
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      const isAdmin = verifyAdmin()
      console.log("👑 [DEBUG] Es admin:", isAdmin)
      
      if (!isAdmin) {
        console.log("❌ [DEBUG] No es admin")
        toast.error("No tienes permisos de administrador")
        return
      }

      console.log("⏳ [DEBUG] Iniciando actualización...")
      setLoading(prev => ({ ...prev, submitting: true }))

      const payload = {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.email, // Usando email como username
        phone: formData.phone,
        email: formData.email
      }

      console.log("📦 [DEBUG] payload de actualización preparado:", payload)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      console.log("📡 [DEBUG] Respuesta de actualización recibida:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ [DEBUG] Error del servidor en actualización:", errorData)
        throw new Error(errorData.message || "Error al actualizar usuario")
      }

      const responseData = await response.json()
      console.log("✅ [DEBUG] Usuario actualizado exitosamente:", responseData)

      toast.success("Usuario actualizado exitosamente")
      console.log("🔄 [DEBUG] Actualizando lista de usuarios...")
      await fetchUsers()
      console.log("🧹 [DEBUG] Limpiando formulario...")
      resetForm()
      console.log("✅ [DEBUG] handleUpdate completado exitosamente")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error"
      console.log("💥 [DEBUG] Error capturado en actualización:", error)
      console.log("📝 [DEBUG] Mensaje de error:", errorMessage)
      toast.error(errorMessage)
    } finally {
      console.log("🏁 [DEBUG] Finalizando actualización...")
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchUsers, resetForm, getAuthToken])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      return
    }

    try {
      const token = getAuthToken()
      if (!token) {
        toast.error("No estás autenticado")
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        toast.error("No tienes permisos de administrador")
        return
      }

      setLoading(prev => ({ ...prev, users: true }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error("Error al eliminar usuario")

      toast.success("Usuario eliminado exitosamente")
      await fetchUsers()
    } catch (error) {
      toast.error("Error al eliminar usuario")
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, fetchUsers, getAuthToken])

  // Helper function to get user role display name
  const getUserRole = useCallback((roles: {name: string}[]) => {
    if (roles.some(r => r.name === "ROLE_ADMIN")) return "Administrador"
    if (roles.some(r => r.name === "ROLE_DOCTOR")) return "Doctor"
    return "Paciente"
  }, [])

  return {
    users,
    loading,
    formData,
    documentTypes,
    genders,
    roles,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    getUserRole,
    resetForm,
    fetchUsers,
    fetchUsersByRole
  }
}