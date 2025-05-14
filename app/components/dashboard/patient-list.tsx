"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

interface Patient {
  id: string | number
  name: string
  documentType: string
  documentNumber: string
  email: string
  phone: string
  lastVisit?: string
  status: "active" | "inactive"
}

interface PatientListProps {
  patients: Patient[]
  onViewDetails: (patientId: string | number) => void
  onViewHistory: (patientId: string | number) => void
}

export function PatientList({ patients: initialPatients, onViewDetails, onViewHistory }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [patients] = useState<Patient[]>(initialPatients)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.documentNumber.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Pacientes</CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, documento o email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredPatients.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No se encontraron pacientes</p>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={`/placeholder.svg?height=40&width=40`} alt={patient.name} />
                    <AvatarFallback>
                      {patient.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.documentType}: {patient.documentNumber}
                    </p>
                    {patient.lastVisit && (
                      <p className="text-xs text-muted-foreground">Última visita: {patient.lastVisit}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                    {patient.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => onViewHistory(patient.id)}>
                    Historial
                  </Button>
                  <Button size="sm" onClick={() => onViewDetails(patient.id)}>
                    Ver detalles
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
