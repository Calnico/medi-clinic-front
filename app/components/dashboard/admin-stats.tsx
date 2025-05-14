import { StatsCard } from "./stats-card"
import { Users, Calendar, UserCheck, Activity } from "lucide-react"

export function AdminStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total de Pacientes"
        value="1,248"
        description="156 nuevos este mes"
        icon={Users}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Total de Doctores"
        value="24"
        description="2 nuevos este mes"
        icon={UserCheck}
        trend={{ value: 8, isPositive: true }}
      />
      <StatsCard
        title="Citas Programadas"
        value="342"
        description="Este mes"
        icon={Calendar}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Tasa de Ocupación"
        value="87%"
        description="Promedio mensual"
        icon={Activity}
        trend={{ value: 3, isPositive: true }}
      />
    </div>
  )
}
