import { StatsCard } from "./stats-card"
import { Users, Calendar, Clock, Star } from "lucide-react"

export function DoctorStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Pacientes Atendidos"
        value="42"
        description="Este mes"
        icon={Users}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard title="Citas Programadas" value="18" description="Próximos 7 días" icon={Calendar} />
      <StatsCard
        title="Horas de Consulta"
        value="38"
        description="Este mes"
        icon={Clock}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Calificación"
        value="4.9"
        description="Promedio de 124 reseñas"
        icon={Star}
        trend={{ value: 0.2, isPositive: true }}
      />
    </div>
  )
}
