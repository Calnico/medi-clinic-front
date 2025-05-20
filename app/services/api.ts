import { API_BASE_URL, API_TIMEOUT, AUTH_TOKEN_KEY, USER_DATA_KEY } from "../config"

// Función para manejar errores de la API
const handleApiError = (error: any) => {
  console.error("API Error:", error)

  if (error.response) {
    // El servidor respondió con un código de estado fuera del rango 2xx
    return {
      error: true,
      status: error.response.status,
      message: error.response.data?.message || "Error en la solicitud",
      data: error.response.data,
    }
  } else if (error.request) {
    // La solicitud se realizó pero no se recibió respuesta
    return {
      error: true,
      status: 0,
      message: "No se recibió respuesta del servidor",
      data: null,
    }
  } else {
    // Ocurrió un error al configurar la solicitud
    return {
      error: true,
      status: 0,
      message: error.message || "Error al realizar la solicitud",
      data: null,
    }
  }
}

// Función para realizar solicitudes a la API
export const apiRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  data: any = null,
  headers: Record<string, string> = {},
  includeCredentials = true,
) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    console.log(`Realizando solicitud ${method} a ${url}`, data)

    // Configuración de la solicitud
    const baseHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    const authHeaders = getAuthHeaders() as Record<string, string>
    
    const combinedHeaders: HeadersInit = {
      ...baseHeaders,
      ...authHeaders,
      ...headers,
    }
    
    const options: RequestInit = {
      method,
      headers: combinedHeaders,
      mode: "cors",
    }
    

    // Solo incluir credenciales si se especifica
    if (includeCredentials) {
      options.credentials = "include"
    }

    // Agregar cuerpo a la solicitud si es necesario
    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data)
    }

    // Configurar timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)
    options.signal = controller.signal

    // Realizar la solicitud
    const response = await fetch(url, options)
    clearTimeout(timeoutId)

    console.log(`Respuesta recibida con status: ${response.status}`)

    // Intentar obtener el cuerpo de la respuesta como JSON
    let responseData
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      try {
        responseData = await response.json()
        console.log("Datos de respuesta:", responseData)
      } catch (e) {
        console.log("No se pudo parsear la respuesta como JSON")
        responseData = {}
      }
    } else {
      try {
        const textResponse = await response.text()
        console.log("Respuesta en texto:", textResponse)
        // Intentar parsear el texto como JSON si es posible
        try {
          responseData = JSON.parse(textResponse)
        } catch {
          responseData = { message: textResponse }
        }
      } catch (e) {
        console.log("No se pudo obtener el texto de la respuesta")
        responseData = {}
      }
    }

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error("Error en la respuesta:", responseData)
      return {
        error: true,
        status: response.status,
        message: responseData.message || `Error ${response.status}: ${response.statusText}`,
        data: responseData,
      }
    }

    return {
      error: false,
      status: response.status,
      message: "Solicitud exitosa",
      data: responseData,
    }
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("La solicitud ha excedido el tiempo de espera")
      return {
        error: true,
        status: 0,
        message: "La solicitud ha excedido el tiempo de espera",
        data: null,
      }
    }
    console.error("Error en la solicitud:", error)
    return handleApiError(error)
  }
}

// Función para obtener el token de autenticación
export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(AUTH_TOKEN_KEY)
  }
  return null
}

// Función para incluir el token en los headers
export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Función para guardar el token de autenticación
export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  }
}

// Función para eliminar el token de autenticación
export const removeAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

// Función para guardar los datos del usuario
export const setUserData = (userData: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
  }
}

// Función para obtener los datos del usuario
export const getUserData = () => {
  if (typeof window !== "undefined") {
    const userData = localStorage.getItem(USER_DATA_KEY)
    return userData ? JSON.parse(userData) : null
  }
  return null
}

// Función para eliminar los datos del usuario
export const removeUserData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_DATA_KEY)
  }
}

// Función para verificar si el usuario está autenticado
export const isAuthenticated = () => {
  return !!getAuthToken()
}

// Función para cerrar sesión
export const logout = () => {
  removeAuthToken()
  removeUserData()
}

//Funcion para llamar las especialidades
export const specialtyService = {
  async getAll() {
    const response = await apiRequest("/specialties", "GET")
    if (!response.error) {
      return response.data
    } else {
      throw new Error(response.message)
    }
  },
}