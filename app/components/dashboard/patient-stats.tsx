import { StatsCard } from "./stats-card"
import { Calendar, Clock, FileText, Heart } from "lucide-react"

export function PatientStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard title="Citas Totales" value="12" description="Historial completo" icon={Calendar} />
      <StatsCard title="Próxima Cita" value="2 días" description="15 de Mayo, 10:30 AM" icon={Clock} />
      <StatsCard title="Consultas Pendientes" value="1" description="Resultados de laboratorio" icon={FileText} />
      <StatsCard title="Doctores Favoritos" value="3" description="Especialistas guardados" icon={Heart} />
    </div>
  )
}
