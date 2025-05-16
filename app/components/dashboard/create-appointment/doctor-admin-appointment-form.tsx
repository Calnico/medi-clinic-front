"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { useDoctorAdminAppointmentForm } from "@/hooks/useAppointmentForm/useDoctorAdminAppointmentForm";

export function DoctorAdminAppointmentForm() {
  const {
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
  } = useDoctorAdminAppointmentForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Cita Médica</CardTitle>
        <CardDescription>Complete los datos para la nueva cita</CardDescription>
        
        {/* Barra de progreso */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    ${isStepComplete(step) ? 'ring-2 ring-green-500' : ''}`}
                >
                  {step}
                </div>
                <span className="text-sm mt-2 text-center">
                  {step === 1 && 'Paciente'}
                  {step === 2 && 'Cita Anterior'}
                  {step === 3 && 'Especialidad'}
                  {step === 4 && 'Tipo de Cita'}
                  {step === 5 && 'Médico'}
                  {step === 6 && 'Fecha/Hora'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute top-1/2 h-1 w-full bg-muted"></div>
            <div 
              className="absolute top-1/2 h-1 bg-primary transition-all duration-300"
              style={{ 
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              La cita ha sido agendada exitosamente.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paso 1: Seleccionar paciente */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => handleChange("patientId", value)}
                  disabled={loadingStates.patients}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingStates.patients ? "Cargando pacientes..." : "Seleccione un paciente"} />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.length === 0 && !loadingStates.patients && (
                      <SelectItem value="no-patients" disabled>
                        No hay pacientes disponibles
                      </SelectItem>
                    )}
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id.toString()}>
                        {patient.fullName} ({patient.documentNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.patientId || loadingStates.patients}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Seleccionar cita anterior (opcional) */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cita Anterior (Opcional)</Label>
                <Select
                  value={formData.parentAppointmentId || "none"}
                  onValueChange={(value) => handleChange("parentAppointmentId", value)}
                  disabled={loadingStates.parentAppointments}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        loadingStates.parentAppointments 
                          ? "Cargando citas..." 
                          : "Seleccione una cita anterior (opcional)"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      Ninguna (primera consulta)
                    </SelectItem>
                    {parentAppointments.map((appointment) => (
                      <SelectItem key={appointment.id} value={appointment.id.toString()}>
                        {new Date(appointment.startTime).toLocaleDateString()} - {appointment.appointmentType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Especialidad */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Especialidad Médica</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={(value) => handleChange("specialty", value)} 
                  disabled={loadingStates.specialties}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingStates.specialties ? "Cargando especialidades..." : "Seleccione una especialidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty.id} value={specialty.id.toString()}>
                        {specialty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.specialty || loadingStates.specialties}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 4: Tipo de Cita */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de Consulta</Label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => handleChange("appointmentType", value)}
                  required
                  disabled={!formData.specialty || loadingStates.appointmentTypes}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !formData.specialty 
                          ? "Primero seleccione una especialidad" 
                          : loadingStates.appointmentTypes 
                            ? "Cargando tipos de consulta..." 
                            : "Seleccione el tipo de consulta"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.length === 0 && !loadingStates.appointmentTypes && (
                      <SelectItem value="no-types" disabled>
                        No hay consultas disponibles para esta especialidad
                      </SelectItem>
                    )}
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} ({type.durationInMinutes} minutos)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.appointmentType || loadingStates.appointmentTypes}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 5: Médico */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Médico</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => handleChange("doctor", value)}
                  required
                  disabled={!formData.appointmentType || loadingStates.doctors}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !formData.appointmentType 
                          ? "Primero seleccione un tipo de consulta" 
                          : loadingStates.doctors 
                            ? "Cargando médicos..." 
                            : "Seleccione un médico"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 && !loadingStates.doctors && (
                      <SelectItem value="no-doctors" disabled>
                        No hay médicos disponibles para esta especialidad
                      </SelectItem>
                    )}
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName} - {doctor.specialty?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.doctor || loadingStates.doctors}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 6: Fecha y Hora */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Disponible</Label>
                  <Select
                    value={formData.date}
                    onValueChange={(value) => handleChange("date", value)}
                    required
                    disabled={!formData.doctor || loadingStates.slots || availableSlots.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !formData.doctor 
                            ? "Primero seleccione un médico" 
                            : loadingStates.slots 
                              ? "Cargando fechas..." 
                              : availableSlots.length === 0
                                ? "No hay fechas disponibles"
                                : "Seleccione una fecha"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableDates().map(([isoDate, displayDate]) => (
                        <SelectItem key={isoDate} value={isoDate}>
                          {displayDate}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Horario Disponible</Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => handleChange("time", value)} 
                    required
                    disabled={!formData.date || loadingStates.slots}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          !formData.date 
                            ? "Primero seleccione una fecha" 
                            : getSlotsForSelectedDate().length === 0
                              ? "No hay horarios disponibles"
                              : "Seleccione un horario"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {getSlotsForSelectedDate().map((slot, index) => {
                        const timeStr = slot.startTime.substring(11, 19);
                        return (
                          <SelectItem key={index} value={timeStr}>
                            {formatTime(slot.startTime)}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Motivo de la Consulta</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  placeholder="Describa el motivo de la consulta"
                  required
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Agendando..." : "Confirmar Cita"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}