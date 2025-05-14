import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">MediClinic Dashboard</h1>
          <Button variant="outline" asChild size="sm">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </div>
      </div>
      {children}
    </div>
  )
}
