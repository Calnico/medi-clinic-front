"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUserData } from "../../services/api"

export function DebugInfo() {
  const [showDebug, setShowDebug] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const refreshUserData = () => {
    const data = getUserData()
    setUserData(data)
  }

  if (!showDebug) {
    return (
      <div className="text-center mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowDebug(true)
            refreshUserData()
          }}
        >
          Mostrar información de depuración
        </Button>
      </div>
    )
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Información de depuración</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowDebug(false)}>
          Ocultar
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">Datos de usuario en localStorage:</h3>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {userData ? JSON.stringify(userData, null, 2) : "No hay datos de usuario"}
            </pre>
          </div>
          <Button size="sm" onClick={refreshUserData}>
            Actualizar datos
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
