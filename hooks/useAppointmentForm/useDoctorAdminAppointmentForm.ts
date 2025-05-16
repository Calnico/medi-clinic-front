import { useState, useEffect } from "react";
import { getUserData } from "@/app/services/api";

// Definición de tipos
interface Role {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface Specialty {
  id: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface PhysicalLocation {
  id: number;
  name: string;
  address: string;
  active: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  documentType: string;
  documentNumber: string;
  gender: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  roles: Role[];
  physicalLocation?: PhysicalLocation;
  specialty?: Specialty;
  fullName: string;
  physicalLocationAddress?: string;
}

interface AppointmentType {
  id: number;
  name: string;
  durationInMinutes: number;
  specialty: Specialty;
  isGeneral: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Appointment {
  id: number;
  startTime: string;
  endTime: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  patient: User;
  doctor: User;
  physicalLocation: PhysicalLocation;
  appointmentType: AppointmentType;
  parentAppointment: Appointment | null;
  derivedAppointments: Appointment[];
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface FormData {
  patientId: string;
  parentAppointmentId: string;
  specialty: string;
  appointmentType: string;
  doctor: string;
  date: string;
  time: string;
  reason: string;
}

export function useDoctorAdminAppointmentForm() {
  const [formData, setFormData] = useState<FormData>({
    patientId: "",
    parentAppointmentId: "",
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
  
  const [patients, setPatients] = useState<User[]>([]);
  const [parentAppointments, setParentAppointments] = useState<Appointment[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  
  const [loadingStates, setLoadingStates] = useState({
    patients: false,
    parentAppointments: false,
    specialties: false,
    appointmentTypes: false,
    doctors: false,
    slots: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  useEffect(() => {
    const userData = getUserData();
    if (userData?.token) {
      fetchPatients();
      fetchSpecialties();
    } else {
      setError("No se encontró sesión de usuario. Inicie sesión nuevamente.");
    }
  }, []);

  const fetchPatients = async () => {
    setLoadingStates(prev => ({...prev, patients: true}));
    setError("");
    
    try {
      const userData = getUserData();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      });
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: User[] = await response.json();
      setPatients(data.filter(user => 
        user.roles.some((role: Role) => role.name === 'ROLE_USER')
      ));
    } catch (err) {
      setError("Error al cargar pacientes");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, patients: false}));
    }
  };

  const fetchParentAppointments = async (patientId: string) => {
    if (!patientId) return;
    
    setLoadingStates(prev => ({...prev, parentAppointments: true}));
    setError("");
    
    try {
      const userData = getUserData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointments/patient/${patientId}`, 
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      );
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: Appointment[] = await response.json();
      setParentAppointments(data);
    } catch (err) {
      setError("Error al cargar citas anteriores del paciente");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, parentAppointments: false}));
    }
  };

  const fetchSpecialties = async () => {
    setLoadingStates(prev => ({...prev, specialties: true}));
    setError("");
    
    try {
      const userData = getUserData();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/specialties`, {
        headers: { 'Authorization': `Bearer ${userData?.token}` }
      });
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: Specialty[] = await response.json();
      setSpecialties(data);
    } catch (err) {
      setError("Error al cargar especialidades");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, specialties: false}));
    }
  };

  const fetchAppointmentTypes = async (specialtyId: string) => {
    if (!specialtyId) return;
    
    setLoadingStates(prev => ({...prev, appointmentTypes: true}));
    setError("");
    setAppointmentTypes([]);
    setFormData(prev => ({ ...prev, appointmentType: "", doctor: "", date: "", time: "" }));
    
    try {
      const userData = getUserData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/appointment-types/specialty/${specialtyId}`, 
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      );
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: AppointmentType[] = await response.json();
      setAppointmentTypes(data.filter(type => type.isActive));
    } catch (err) {
      setError("Error al cargar tipos de cita");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, appointmentTypes: false}));
    }
  };

  const fetchDoctorsBySpecialty = async (specialtyId: string) => {
    if (!specialtyId) return;
    
    setLoadingStates(prev => ({...prev, doctors: true}));
    setError("");
    setDoctors([]);
    setFormData(prev => ({ ...prev, doctor: "", date: "", time: "" }));
    
    try {
      const userData = getUserData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/specialty/${specialtyId}`, 
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      );
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: User[] = await response.json();
      setDoctors(data.filter(user => 
        user.roles.some((role: Role) => role.name === 'ROLE_DOCTOR')
      ));
    } catch (err) {
      setError("Error al cargar doctores");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, doctors: false}));
    }
  };

  const fetchAvailableSlots = async (doctorId: string, appointmentTypeId: string) => {
    if (!doctorId || !appointmentTypeId) return;
    
    setLoadingStates(prev => ({...prev, slots: true}));
    setError("");
    setAvailableSlots([]);
    setFormData(prev => ({ ...prev, date: "", time: "" }));
    
    try {
      const userData = getUserData();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/availabilities/slots?doctorId=${doctorId}&appointmentTypeId=${appointmentTypeId}`,
        {
          headers: { 'Authorization': `Bearer ${userData?.token}` }
        }
      );
      
      if (!response.ok) throw new Error(`Error: ${response.status}`);
      
      const data: TimeSlot[] = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      setError("Error al cargar horarios disponibles");
      console.error(err);
    } finally {
      setLoadingStates(prev => ({...prev, slots: false}));
    }
  };

  const handleChange = (field: string, value: string) => {
    // Convertir "none" a string vacío para parentAppointmentId
    const finalValue = field === "parentAppointmentId" && value === "none" ? "" : value;
    setFormData(prev => ({ ...prev, [field]: finalValue }));
    
    if (field === "patientId") {
      fetchParentAppointments(value);
      setFormData(prev => ({ 
        ...prev, 
        parentAppointmentId: "",
        specialty: "",
        appointmentType: "",
        doctor: "",
        date: "",
        time: ""
      }));
    } 
    else if (field === "specialty") {
      fetchAppointmentTypes(value);
      setFormData(prev => ({ 
        ...prev, 
        appointmentType: "",
        doctor: "",
        date: "",
        time: ""
      }));
    } 
    else if (field === "appointmentType") {
      fetchDoctorsBySpecialty(formData.specialty);
      setFormData(prev => ({ 
        ...prev, 
        doctor: "",
        date: "",
        time: ""
      }));
    } 
    else if (field === "doctor") {
      fetchAvailableSlots(value, formData.appointmentType);
      setFormData(prev => ({ 
        ...prev, 
        date: "",
        time: ""
      }));
    } 
    else if (field === "date") {
      setFormData(prev => ({ 
        ...prev, 
        time: ""
      }));
    }
  };

  const getAvailableDates = () => {
    const dates = new Map<string, string>();
    
    availableSlots.forEach((slot: TimeSlot) => {
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

  const getSlotsForSelectedDate = (): TimeSlot[] => {
    if (!formData.date) return [];
    return availableSlots.filter((slot: TimeSlot) => slot.startTime.startsWith(formData.date));
  };

  const formatTime = (isoTime: string) => {
    const timeStr = isoTime.substring(11, 16);
    const [hours, minutes] = timeStr.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
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
      case 1: return !!formData.patientId;
      case 2: return true; // La cita anterior es opcional
      case 3: return !!formData.specialty;
      case 4: return !!formData.appointmentType;
      case 5: return !!formData.doctor;
      case 6: return !!formData.date && !!formData.time;
      default: return true;
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return !!formData.patientId;
      case 2: return true; // La cita anterior es opcional
      case 3: return !!formData.specialty;
      case 4: return !!formData.appointmentType;
      case 5: return !!formData.doctor;
      case 6: return !!formData.date && !!formData.time;
      default: return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const userData = getUserData();
      if (!userData?.token) throw new Error("Sesión inválida");

      const selectedSlot = availableSlots.find((slot: TimeSlot) => 
        slot.startTime.substring(11, 19) === formData.time
      );

      if (!selectedSlot) throw new Error("Horario no válido");

      const appointmentData = {
        patientId: parseInt(formData.patientId),
        doctorId: parseInt(formData.doctor),
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        notes: formData.reason,
        appointmentTypeId: parseInt(formData.appointmentType),
        parentAppointmentId: formData.parentAppointmentId ? parseInt(formData.parentAppointmentId) : null
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
        throw new Error(errorData.message || "Error al agendar cita");
      }

      setSuccess(true);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      console.error("Error al agendar cita:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      patientId: "",
      parentAppointmentId: "",
      specialty: "",
      appointmentType: "",
      doctor: "",
      date: "",
      time: "",
      reason: ""
    });
    setCurrentStep(1);
  };

  return {
    formData,
    isLoading,
    error,
    success,
    patients,
    parentAppointments,
    specialties,
    appointmentTypes,
    doctors,
    availableSlots,
    loadingStates,
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