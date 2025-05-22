"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, X } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface AppointmentCardProps {
  id: string | number
  doctorName?: string
  patientName?: string
  specialty?: string
  date: string | Date
  time: string
  status: "scheduled" | "completed" | "cancelled" | "pending"
  showDoctor?: boolean
  showPatient?: boolean
  onCancel?: () => void
  onReschedule?: () => void
  onViewDetails?: () => void
}

export function AppointmentCard({
  id,
  doctorName,
  patientName,
  specialty,
  date,
  time,
  status,
  showDoctor = false,
  showPatient = false,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const viewDetailsButtonRef = useRef<HTMLButtonElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const prevIsModalOpen = useRef<boolean | null>(null);

  // Bloquear scroll cuando modal está abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = "";
      if (prevIsModalOpen.current) {
        if (viewDetailsButtonRef.current) {
          viewDetailsButtonRef.current.focus();
        }
      }
    }
    prevIsModalOpen.current = isModalOpen;
    return () => {
      document.body.style.overflow = "";
    }
  }, [isModalOpen]);

  // Cerrar modal con Escape
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsModalOpen(false)
      }
    }
    if (isModalOpen) {
      document.addEventListener("keydown", onKeyDown)
    } else {
      document.removeEventListener("keydown", onKeyDown)
    }
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [isModalOpen])

  const statusMap = {
    scheduled: { label: "Programada", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  }
  const statusInfo = statusMap[status]

  return (
    <>
      <Card className="overflow-hidden shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              {showDoctor && doctorName && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-gray-800">{doctorName}</p>
                    {specialty && <p className="text-xs text-gray-500">{specialty}</p>}
                  </div>
                </div>
              )}

              {showPatient && patientName && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-primary" />
                  <p className="font-semibold text-gray-800">{patientName}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <p className="text-sm text-gray-700">{typeof date === "string" ? date : formatDate(date)}</p>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <p className="text-sm text-gray-700">{time}</p>
              </div>
            </div>

            <Badge className={`${statusInfo.color} px-3 py-1 rounded-full font-semibold`}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-3 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            ref={viewDetailsButtonRef}
          >
            Ver detalles
          </Button>

          {status === "scheduled" && onReschedule && (
            <Button variant="outline" size="sm" onClick={onReschedule}>
              Reprogramar
            </Button>
          )}

          {(status === "scheduled" || status === "pending") && onCancel && (
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Modal sin animaciones */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6 relative outline-none"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
            tabIndex={-1}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              aria-label="Cerrar modal"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold mb-4 text-gray-900">Detalles de la cita</h2>

            <section className="space-y-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Información básica</h3>
              <p><strong>ID:</strong> {id}</p>
              {showDoctor && doctorName && <p><strong>Médico:</strong> {doctorName}</p>}
              {showPatient && patientName && <p><strong>Paciente:</strong> {patientName}</p>}
              {specialty && <p><strong>Especialidad:</strong> {specialty}</p>}
            </section>

            <section className="space-y-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Fecha y hora</h3>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <p>{typeof date === "string" ? date : formatDate(date)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <p>{time}</p>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">Estado</h3>
              <Badge className={`${statusInfo.color} px-4 py-1 rounded-full font-semibold`}>
                {statusInfo.label}
              </Badge>
            </section>
          </div>
        </div>
      )}
    </>
  )
}
