// Configuración para conectar con el backend
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

// Timeout para las solicitudes (en milisegundos)
export const API_TIMEOUT = 10000

// Configuración de autenticación
export const AUTH_TOKEN_KEY = "auth_token"
export const USER_DATA_KEY = "user_data"
