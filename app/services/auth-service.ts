import { apiRequest, setAuthToken, setUserData, logout } from "./api"

export const authService = {
  // Iniciar sesión con documento y contraseña
  login: async (documentType: string, documentNumber: string, password: string) => {
    // Usar el formato específico que requiere el backend
    const loginData = {
      documentType,
      documentNumber,
      password,
    }

    console.log("Intentando login con:", loginData)

    // Endpoint para login
    const response = await apiRequest("/auth/login", "POST", loginData)

    console.log("Login response:", response)

    if (!response.error && response.data) {
      // Verificar si la respuesta contiene un token JWT
      if (response.data.token) {
        setAuthToken(response.data.token)

        // Si la respuesta incluye datos del usuario, guardarlos
        if (response.data.user) {
          setUserData(response.data.user)
        } else if (response.data.documentNumber || response.data.email) {
          // A veces el usuario viene directamente en la respuesta
          setUserData(response.data)
        } else {
          // Si no hay datos de usuario, intentar obtenerlos
          try {
            const userResponse = await apiRequest("/users/me", "GET")
            if (!userResponse.error) {
              setUserData(userResponse.data)
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
          }
        }
      } else {
        // Si no hay token en la respuesta, es un error
        return {
          error: true,
          status: response.status,
          message: "No se recibió token de autenticación",
          data: null,
        }
      }
    }

    return response
  },

  // Registrar un nuevo usuario
  register: async (userData: any) => {
    // Asegurarse de que la estructura coincida con lo que espera el backend
    const formattedUserData = {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || "",
      email: userData.email,
      password: userData.password,
      documentType: userData.documentType,
      documentNumber: userData.documentNumber,
      roles: [
        {
          id: 0,
          name: userData.role.toUpperCase(), // Convertir a mayúsculas como espera el backend
        },
      ],
      role: userData.role.toUpperCase(),
      specialtyId: userData.role === "doctor" ? userData.specialtyId || 0 : 0,
      defaultSchedule: true,
      physicalLocationId: 0,
    }

    return await apiRequest("/auth/register", "POST", formattedUserData)
  },

  // Cerrar sesión
  logout: async () => {
    try {
      await apiRequest("/auth/logout", "POST")
    } catch (error) {
      console.log("No logout endpoint or error during logout", error)
    }

    // Siempre limpiar datos locales
    logout()

    return { error: false, message: "Sesión cerrada correctamente" }
  },

  // Verificar si el token es válido
  validateToken: async () => {
    return await apiRequest("/auth/validate-token", "GET")
  },

  // Actualizar perfil de usuario
  updateUserProfile: async (userId: number, userData: any) => {
    return await apiRequest(`/users/${userId}`, "PUT", userData)
  },

  // Obtener perfil de usuario actual
  getCurrentUser: async () => {
    return await apiRequest("/users/me", "GET")
  },
}
