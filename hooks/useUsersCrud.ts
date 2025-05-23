// hooks/useUsersCrud.ts
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSweetAlert } from "./useSweetAlert"

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
  const {
    showSuccess,
    showError,
    showWarning,
    showLoading,
    close
  } = useSweetAlert()

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
        await showError(
          "Sesión Expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        )
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        await showError(
          "Acceso Denegado",
          "No tienes permisos de administrador para acceder a esta sección."
        )
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
      await showError(
        "Error de Conexión",
        "No se pudieron cargar los usuarios. Verifica tu conexión a internet e intenta nuevamente."
      )
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, getAuthToken, showError])

  // Fetch users by role
  const fetchUsersByRole = useCallback(async (roleName: string) => {
    try {
      setLoading(prev => ({ ...prev, users: true }))
      const token = getAuthToken()
      if (!token) {
        await showError(
          "Sesión Expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        )
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        await showError(
          "Acceso Denegado",
          "No tienes permisos de administrador para realizar esta acción."
        )
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
      await showError(
        "Error al Filtrar",
        "No se pudieron cargar los usuarios por rol. Intenta nuevamente."
      )
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, getAuthToken, showError])

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
        await showError(
          "Sesión Expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        )
        router.push("/login")
        return
      }

      const isAdmin = verifyAdmin()
      console.log("👑 [DEBUG] Es admin:", isAdmin)
      
      if (!isAdmin) {
        console.log("❌ [DEBUG] No es admin")
        await showError(
          "Acceso Denegado",
          "No tienes permisos de administrador para crear usuarios."
        )
        return
      }

      // Mostrar indicador de carga
      showLoading("Creando Usuario", "Por favor espera mientras procesamos la información...")
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

      close() // Cerrar el loading

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ [DEBUG] Error del servidor:", errorData)
        throw new Error(errorData.message || "Error al crear usuario")
      }

      const responseData = await response.json()
      console.log("✅ [DEBUG] Usuario creado exitosamente:", responseData)

      const roleLabel = formData.role === 'ADMIN' ? 'Administrador' : 'Paciente'
      await showSuccess(
        "¡Usuario Creado Exitosamente!",
        `${formData.firstName} ${formData.lastName} ha sido registrado como ${roleLabel} en el sistema.`
      )
      
      console.log("🔄 [DEBUG] Actualizando lista de usuarios...")
      await fetchUsers()
      console.log("🧹 [DEBUG] Limpiando formulario...")
      resetForm()
      console.log("✅ [DEBUG] handleSubmit completado exitosamente")
    } catch (error) {
      close() // Cerrar el loading
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado"
      console.log("💥 [DEBUG] Error capturado:", error)
      console.log("📝 [DEBUG] Mensaje de error:", errorMessage)
      await showError(
        "Error al Crear Usuario",
        errorMessage
      )
    } finally {
      console.log("🏁 [DEBUG] Finalizando envío...")
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchUsers, resetForm, getAuthToken, showError, showSuccess, showLoading, close])

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
        await showError(
          "Sesión Expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        )
        router.push("/login")
        return
      }

      const isAdmin = verifyAdmin()
      console.log("👑 [DEBUG] Es admin:", isAdmin)
      
      if (!isAdmin) {
        console.log("❌ [DEBUG] No es admin")
        await showError(
          "Acceso Denegado",
          "No tienes permisos de administrador para actualizar usuarios."
        )
        return
      }

      // Mostrar indicador de carga
      showLoading("Actualizando Usuario", "Por favor espera mientras guardamos los cambios...")
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

      close() // Cerrar el loading

      if (!response.ok) {
        const errorData = await response.json()
        console.log("❌ [DEBUG] Error del servidor en actualización:", errorData)
        throw new Error(errorData.message || "Error al actualizar usuario")
      }

      const responseData = await response.json()
      console.log("✅ [DEBUG] Usuario actualizado exitosamente:", responseData)

      await showSuccess(
        "¡Usuario Actualizado!",
        `Los datos de ${formData.firstName} ${formData.lastName} han sido actualizados correctamente.`
      )
      
      console.log("🔄 [DEBUG] Actualizando lista de usuarios...")
      await fetchUsers()
      console.log("🧹 [DEBUG] Limpiando formulario...")
      resetForm()
      console.log("✅ [DEBUG] handleUpdate completado exitosamente")
    } catch (error) {
      close() // Cerrar el loading
      const errorMessage = error instanceof Error ? error.message : "Ocurrió un error inesperado"
      console.log("💥 [DEBUG] Error capturado en actualización:", error)
      console.log("📝 [DEBUG] Mensaje de error:", errorMessage)
      await showError(
        "Error al Actualizar Usuario",
        errorMessage
      )
    } finally {
      console.log("🏁 [DEBUG] Finalizando actualización...")
      setLoading(prev => ({ ...prev, submitting: false }))
    }
  }, [formData, router, verifyAdmin, fetchUsers, resetForm, getAuthToken, showError, showSuccess, showLoading, close])

  const handleDelete = useCallback(async (id: string) => {
    // Esta función se mantiene pero no se usa en la UI
    try {
      const token = getAuthToken()
      if (!token) {
        await showError(
          "Sesión Expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        )
        router.push("/login")
        return
      }

      if (!verifyAdmin()) {
        await showError(
          "Acceso Denegado",
          "No tienes permisos de administrador para eliminar usuarios."
        )
        return
      }

      showLoading("Eliminando Usuario", "Por favor espera...")
      setLoading(prev => ({ ...prev, users: true }))

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      close() // Cerrar el loading

      if (!response.ok) throw new Error("Error al eliminar usuario")

      await showSuccess(
        "¡Usuario Eliminado!",
        "El usuario ha sido eliminado correctamente del sistema."
      )
      
      await fetchUsers()
    } catch (error) {
      close() // Cerrar el loading
      await showError(
        "Error al Eliminar",
        "No se pudo eliminar el usuario. Por favor, intenta nuevamente."
      )
      console.error(error)
    } finally {
      setLoading(prev => ({ ...prev, users: false }))
    }
  }, [router, verifyAdmin, fetchUsers, getAuthToken, showError, showSuccess, showLoading, close])

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