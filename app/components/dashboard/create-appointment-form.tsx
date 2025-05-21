"use client"

import { getUserData } from "@/app/services/api"
import { PatientAppointmentForm } from "./create-appointment/patient-appointment-form"
import { DoctorAdminAppointmentForm } from "./create-appointment/doctor-admin-appointment-form"
export function CreateAppointmentForm() {
  const userData = getUserData()
  
  if (!userData) {
    return (
      <div className="p-4 text-center text-red-500">
        No se pudo cargar la información del usuario. Por favor, inicie sesión nuevamente.
      </div>
    )
  }

  // Verificar roles del usuario
  let userRoles: string[] = [];
  
  // Comprobar si roles es un array
  if (userData.roles && Array.isArray(userData.roles)) {
    userRoles = userData.roles;
  } 
  // Comprobar si role es una string JSON
  else if (userData.role && typeof userData.role === 'string') {
    try {
      // Intentar parsear la string JSON
      const parsedRoles = JSON.parse(userData.role);
      if (Array.isArray(parsedRoles)) {
        userRoles = parsedRoles.map(r => r.authority);
      }
    } catch (error) {
      console.error("Error al parsear roles de usuario:", error);
    }
  }

  // Determinar qué formulario mostrar según el rol
  const isPatient = userRoles.includes('ROLE_USER') || userRoles.includes('ROLE_PATIENT');
  const isDoctorOrAdmin = userRoles.includes('ROLE_DOCTOR') || userRoles.includes('ROLE_ADMIN');

  return (
    <div className="w-full">
      {isPatient && <PatientAppointmentForm />}
      {isDoctorOrAdmin && <DoctorAdminAppointmentForm />}
      {!isPatient && !isDoctorOrAdmin && (
        <div className="p-4 text-center text-red-500">
          No tiene permisos para agendar citas. Contacte al administrador.
        </div>
      )}
    </div>
  )
}