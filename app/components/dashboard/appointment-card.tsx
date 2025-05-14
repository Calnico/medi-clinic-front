"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User } from "lucide-react"
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
  onViewDetails?: () => void
  onCancel?: () => void
  onReschedule?: () => void
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
  onViewDetails,
  onCancel,
  onReschedule,
}: AppointmentCardProps) {
  const statusMap = {
    scheduled: { label: "Programada", color: "bg-blue-100 text-blue-800" },
    completed: { label: "Completada", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
    pending: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  }

  const statusInfo = statusMap[status]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            {showDoctor && doctorName && (
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">{doctorName}</p>
                  {specialty && <p className="text-xs text-muted-foreground">{specialty}</p>}
                </div>
              </div>
            )}

            {showPatient && patientName && (
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <p className="font-medium">{patientName}</p>
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="text-sm">{typeof date === "string" ? date : formatDate(date)}</p>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <p className="text-sm">{time}</p>
            </div>
          </div>

          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2 justify-end">
        {onViewDetails && (
          <Button variant="outline" size="sm" onClick={onViewDetails}>
            Ver detalles
          </Button>
        )}

        {status === "scheduled" && onReschedule && (
          <Button variant="outline" size="sm" onClick={onReschedule}>
            Reprogramar
          </Button>
        )}

        {status === "scheduled" && onCancel && (
          <Button variant="outline" size="sm" className="text-red-500" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
