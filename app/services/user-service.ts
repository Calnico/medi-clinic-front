import { apiRequest } from "./api"

export const userService = {
  // Obtener todos los usuarios
  getUsers: async (role?: string) => {
    const endpoint = role ? `/users?role=${role}` : "/users"
    return await apiRequest(endpoint)
  },

  // Obtener un usuario por ID
  getUserById: async (id: string) => {
    return await apiRequest(`/users/${id}`)
  },

  // Crear un nuevo usuario
  createUser: async (userData: any) => {
    return await apiRequest("/users", "POST", userData)
  },

  // Actualizar un usuario existente
  updateUser: async (id: string, userData: any) => {
    return await apiRequest(`/users/${id}`, "PUT", userData)
  },

  // Eliminar un usuario
  deleteUser: async (id: string) => {
    return await apiRequest(`/users/${id}`, "DELETE")
  },

  // Obtener doctores
  getDoctors: async () => {
    return await apiRequest("/users/doctors")
  },

  // Obtener pacientes
  getPatients: async () => {
    return await apiRequest("/users/patients")
  },

  // Obtener el perfil del usuario actual
  getCurrentUserProfile: async () => {
    return await apiRequest("/users/profile")
  },

  // Actualizar el perfil del usuario actual
  updateCurrentUserProfile: async (userData: any) => {
    return await apiRequest("/users/profile", "PUT", userData)
  },
}
