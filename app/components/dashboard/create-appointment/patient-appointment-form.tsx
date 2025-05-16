"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { usePatientAppointmentForm } from "@/hooks/useAppointmentForm/usePatientAppointmentForm"

export function PatientAppointmentForm() {
  const {
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
  } = usePatientAppointmentForm()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agendar Cita Médica</CardTitle>
        <CardDescription>Complete los datos para su cita médica</CardDescription>
        
        {/* Barra de progreso */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center 
                    ${currentStep >= step ? 'bg-primary text-primary-foreground' : 'bg-muted'}
                    ${isStepComplete(step) ? 'ring-2 ring-green-500' : ''}`}
                >
                  {step}
                </div>
                <span className="text-sm mt-2 text-center">
                  {step === 1 && 'Especialidad'}
                  {step === 2 && 'Tipo de Cita'}
                  {step === 3 && 'Doctor'}
                  {step === 4 && 'Fecha/Hora'}
                  {step === 5 && 'Motivo'}
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
          <Alert className="mb-4 bg-red-50 text-red-700 border-red-200">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertDescription>
              Su cita ha sido agendada exitosamente. Recibirá una confirmación por correo electrónico.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Paso 1: Especialidad */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad Médica</Label>
                <Select 
                  value={formData.specialty} 
                  onValueChange={(value) => handleChange("specialty", value)} 
                  disabled={loadingSpecialties}
                  required
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder={loadingSpecialties ? "Cargando especialidades..." : "Seleccione una especialidad"} />
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
              <div className="flex justify-end">
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.specialty || loadingSpecialties}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 2: Tipo de Cita */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentType">Tipo de Consulta</Label>
                <Select
                  value={formData.appointmentType}
                  onValueChange={(value) => handleChange("appointmentType", value)}
                  required
                  disabled={!formData.specialty || loadingAppointmentTypes}
                >
                  <SelectTrigger id="appointmentType">
                    <SelectValue 
                      placeholder={
                        !formData.specialty 
                          ? "Primero seleccione una especialidad" 
                          : loadingAppointmentTypes 
                            ? "Cargando tipos de consulta..." 
                            : "Seleccione el tipo de consulta"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.length === 0 && !loadingAppointmentTypes && (
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
                  disabled={!formData.appointmentType || loadingAppointmentTypes}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3: Doctor */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctor">Médico</Label>
                <Select
                  value={formData.doctor}
                  onValueChange={(value) => handleChange("doctor", value)}
                  required
                  disabled={!formData.appointmentType || loadingDoctors}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue 
                      placeholder={
                        !formData.appointmentType 
                          ? "Primero seleccione un tipo de consulta" 
                          : loadingDoctors 
                            ? "Cargando médicos..." 
                            : "Seleccione un médico"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.length === 0 && !loadingDoctors && (
                      <SelectItem value="no-doctors" disabled>
                        No hay médicos disponibles para esta especialidad
                      </SelectItem>
                    )}
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id.toString()}>
                        {doctor.fullName || `${doctor.firstName} ${doctor.lastName}`}
                        {doctor.specialty && ` - ${doctor.specialty.name}`}
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
                  disabled={!formData.doctor || loadingDoctors}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 4: Fecha y Hora */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha Disponible</Label>
                  <Select
                    value={formData.date}
                    onValueChange={(value) => handleChange("date", value)}
                    required
                    disabled={!formData.doctor || loadingSlots || availableSlots.length === 0}
                  >
                    <SelectTrigger id="date">
                      <SelectValue 
                        placeholder={
                          !formData.doctor 
                            ? "Primero seleccione un médico" 
                            : loadingSlots 
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
                  <Label htmlFor="time">Horario Disponible</Label>
                  <Select 
                    value={formData.time} 
                    onValueChange={(value) => handleChange("time", value)} 
                    required
                    disabled={!formData.date || loadingSlots}
                  >
                    <SelectTrigger id="time">
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
                        const timeStr = slot.startTime.substring(11, 19)
                        return (
                          <SelectItem key={index} value={timeStr}>
                            {formatTime(slot.startTime)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={!formData.date || !formData.time}
                >
                  Siguiente <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Paso 5: Motivo y Envío */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Motivo de la Consulta</Label>
                <Textarea
                  id="reason"
                  placeholder="Describa brevemente el motivo de su consulta (síntomas, dudas, etc.)"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Agendando su cita..." : "Confirmar Cita"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}