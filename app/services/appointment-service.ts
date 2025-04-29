import { apiRequest } from "./api"

export const appointmentService = {
  // Obtener todas las citas
  getAppointments: async (params = {}) => {
    const queryString = new URLSearchParams(params as Record<string, string>).toString()
    const endpoint = queryString ? `/appointments?${queryString}` : "/appointments"
    return await apiRequest(endpoint)
  },

  // Obtener citas por paciente
  getAppointmentsByPatient: async (patientId: string) => {
    return await apiRequest(`/appointments/patient/${patientId}`)
  },

  // Obtener citas por doctor
  getAppointmentsByDoctor: async (doctorId: string) => {
    return await apiRequest(`/appointments/doctor/${doctorId}`)
  },

  // Obtener una cita por ID
  getAppointmentById: async (id: string) => {
    return await apiRequest(`/appointments/${id}`)
  },

  // Crear una nueva cita
  createAppointment: async (appointmentData: any) => {
    return await apiRequest("/appointments", "POST", appointmentData)
  },

  // Actualizar una cita existente
  updateAppointment: async (id: string, appointmentData: any) => {
    return await apiRequest(`/appointments/${id}`, "PUT", appointmentData)
  },

  // Cancelar una cita
  cancelAppointment: async (id: string) => {
    return await apiRequest(`/appointments/${id}/cancel`, "PUT")
  },

  // Confirmar una cita
  confirmAppointment: async (id: string) => {
    return await apiRequest(`/appointments/${id}/confirm`, "PUT")
  },
}
