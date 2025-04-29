"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService } from "../services/auth-service"
import { getUserData, isAuthenticated, logout } from "../services/api"

interface User {
  id?: number
  documentType?: string
  documentNumber?: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  roles?: Array<{ id: number; name: string }>
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (documentType: string, documentNumber: string, password: string) => Promise<any>
  logout: () => void
  checkAuth: () => Promise<boolean>
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar autenticación al cargar la página
    const checkAuthentication = async () => {
      setIsLoading(true)
      try {
        if (isAuthenticated()) {
          const userData = getUserData()
          if (userData) {
            // Opcionalmente, validar el token con el backend
            try {
              const response = await authService.validateToken()
              if (!response.error) {
                setUser(userData)
              } else {
                // Token inválido, cerrar sesión
                handleLogout()
              }
            } catch (error) {
              console.error("Error validando token:", error)
              // Si hay un error al validar, mantener la sesión por ahora
              setUser(userData)
            }
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  const handleLogin = async (documentType: string, documentNumber: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authService.login(documentType, documentNumber, password)
      if (!response.error) {
        const userData = getUserData()
        if (userData) {
          setUser(userData)
        }
      }
      return response
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    setUser(null)
    router.push("/login")
  }

  const checkAuth = async () => {
    if (!isAuthenticated()) {
      return false
    }

    try {
      const response = await authService.validateToken()
      return !response.error
    } catch (error) {
      console.error("Error validating token:", error)
      return false
    }
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      // También actualizar en localStorage
      const storedUser = getUserData()
      if (storedUser) {
        const updatedStoredUser = { ...storedUser, ...userData }
        localStorage.setItem("userData", JSON.stringify(updatedStoredUser))
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
