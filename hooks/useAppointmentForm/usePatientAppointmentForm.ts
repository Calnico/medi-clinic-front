import { useState, useEffect } from "react";
import { getUserData } from "@/app/services/api";

interface Specialty {
  id: number;
  name: string;
  description?: string;
}

interface AppointmentType {
  id: number;
  name: string;
  durationInMinutes: number;
  specialty: Specialty;
  isGeneral: boolean;
  isActive: boolean;
}

interface Doctor {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  fullName?: string;
  specialty?: {
    id: number;
    name: string;
  };
  physicalLocation?: {
    name: string;
    address: string;
  };
  physicalLocationAddress?: string;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface FormDataType {
  specialty: string;
  appointmentType: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
}

export function usePatientAppointmentForm() {
  const [formData, setFormData] = useState<FormDataType>({
    specialty: "",
    appointmentType: "",
    doctor: "",
    date: "",
    time: "",
    reason: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingAppointmentTypes, setLoadingAppointmentTypes] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  useEffect(() => {
    const userData = getUserData();
    if (userData && userData.token) {
      fetchSpecialties();
    } else {
      setError("No se encontró una sesión de usuario válida. Por favor, inicie sesión nuevamente.");
    }
  }, []);

  const fetchSpecialties = async () => {
    setLoadingSpecialties(true);
    setError("");
    
    try {
      const userData = getUserData();
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.");
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: {
          'Authorization': `Bearer ${userData.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al cargar especialidades: ${response.status}`);
      }
      
      const data = await response.json();
      setSpecialties(data);
    } catch (err) {
      console.error("Error al cargar especialidades:", err);
      setError("No se pudieron cargar las especialidades. Por favor, refresque la página.");
    } finally {
      setLoadingSpecialties(false);
    }
  };

  const fetchAppointmentTypes = async (specialtyId: string) => {
    if (!specialtyId) return;
    
    setLoadingAppointmentTypes(true);
    setError("");
    setAppointmentTypes([]);
    setFormData(prev => ({ ...prev, appointmentType: "", doctor: "", date: "", time: "" }));
    
    try {
      const userData = getUserData();
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.");
      }
      
      // Modificación: Agregar el parámetro isGeneral=true
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/specialty/${specialtyId}?isGeneral=true`, 
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar tipos de cita: ${response.status}`);
      }
      
      const data = await response.json();
      setAppointmentTypes(data.filter((type: AppointmentType) => type.isActive));
    } catch (err) {
      console.error("Error al cargar tipos de cita:", err);
      setError("No se pudieron cargar los tipos de cita para esta especialidad.");
    } finally {
      setLoadingAppointmentTypes(false);
    }
  };

  const fetchDoctorsBySpecialty = async (specialtyId: string) => {
    if (!specialtyId) return;
    
    setLoadingDoctors(true);
    setError("");
    setDoctors([]);
    setFormData(prev => ({ ...prev, doctor: "", date: "", time: "" }));
    
    try {
      const userData = getUserData();
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.");
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/specialty/${specialtyId}`, 
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar doctores: ${response.status}`);
      }
      
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      console.error("Error al cargar doctores:", err);
      setError("No se pudieron cargar los doctores para esta especialidad.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId: string, appointmentTypeId: string) => {
    if (!doctorId || !appointmentTypeId) return;
    
    setLoadingSlots(true);
    setError("");
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, date: "", time: "" }));
    
    try {
      const userData = getUserData();
      
      if (!userData || !userData.token) {
        throw new Error("No se encontró la sesión del usuario. Por favor, inicie sesión nuevamente.");
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/slots?doctorId=${doctorId}&appointmentTypeId=${appointmentTypeId}`,
        {
          headers: {
            'Authorization': `Bearer ${userData.token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar horarios disponibles: ${response.status}`);
      }
      
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error("Error al cargar horarios disponibles:", err);
      setError("No se pudo cargar la disponibilidad de horarios.");
    } finally {
      setLoadingSlots(false);
    }
  };

  const getAvailableDates = () => {
    const dates = new Map<string, string>();
    
    availableSlots.forEach(slot => {
      const dateStr = slot.startTime.split('T')[0];
      const dateObj = new Date(dateStr + 'T00:00:00');
      const displayDate = dateObj.toLocaleDateString('es-CO', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      dates.set(dateStr, displayDate);
    });
    
    return Array.from(dates.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const getSlotsForSelectedDate = () => {
    if (!formData.date) return [];
    return availableSlots.filter(slot => slot.startTime.startsWith(formData.date));
  };

  const nextStep = () => {
    if (canProceedToNextStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1: return !!formData.specialty;
      case 2: return !!formData.appointmentType;
      case 3: return !!formData.doctor;
      case 4: return !!formData.date && !!formData.time;
      default: return true;
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!formData.specialty;
      case 2: return !!formData.appointmentType;
      case 3: return !!formData.doctor;
      case 4: return !!formData.date && !!formData.time;
      case 5: return !!formData.reason;
      default: return false;
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "specialty") {
      fetchAppointmentTypes(value);
      setFormData(prev => ({ 
        ...prev, 
        appointmentType: "", 
        doctor: "", 
        date: "", 
        time: "" 
      }));
    } else if (field === "appointmentType") {
      fetchDoctorsBySpecialty(formData.specialty);
      setFormData(prev => ({ 
        ...prev, 
        doctor: "", 
        date: "", 
        time: "" 
      }));
    } else if (field === "doctor") {
      fetchAvailableSlots(value, formData.appointmentType);
      setFormData(prev => ({ 
        ...prev, 
        date: "", 
        time: "" 
      }));
    } else if (field === "date") {
      setFormData(prev => ({ 
        ...prev, 
        time: "" 
      }));
    }
  };

  const formatTime = (isoTime: string) => {
    const timeStr = isoTime.substring(11, 16);
    const [hours, minutes] = timeStr.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const userData = getUserData();
      
      if (!userData || !userData.id || !userData.token) {
        throw new Error("No se puede identificar al usuario o la sesión ha expirado. Por favor, inicie sesión nuevamente.");
      }

      const selectedSlot = availableSlots.find(slot => {
        const slotTimeStr = slot.startTime.substring(11, 19);
        return slotTimeStr === formData.time;
      });

      if (!selectedSlot) {
        throw new Error("El horario seleccionado no es válido. Por favor, seleccione otro.");
      }

      const appointmentData = {
        patientId: parseInt(userData.id),
        doctorId: parseInt(formData.doctor),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: formData.reason,
        appointmentTypeId: parseInt(formData.appointmentType),
        parentAppointmentId: null
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al agendar la cita");
      }

      setSuccess(true);
      // Reiniciar el formulario después de una reserva exitosa
      setFormData({
        specialty: "",
        appointmentType: "",
        doctor: "",
        date: "",
        time: "",
        reason: "",
      });
      setAvailableSlots([]);
      setCurrentStep(1);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error al agendar la cita";
      setError(errorMessage);
      console.error("Error al agendar cita:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    isLoading,
    error,
    success,
    specialties,
    appointmentTypes,
    doctors,
    availableSlots,
    loadingSpecialties,
    loadingAppointmentTypes,
    loadingDoctors,
    loadingSlots,
    currentStep,
    totalSteps,
    getAvailableDates,
    getSlotsForSelectedDate,
    nextStep,
    prevStep,
    isStepComplete,
    handleChange,
    formatTime,
    handleSubmit
  };
}