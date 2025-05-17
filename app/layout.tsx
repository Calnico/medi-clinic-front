import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { AuthProvider } from "./context/auth-context"
import { FloatingChatButton } from "@/components/ui/floating-chat-button"

export const metadata: Metadata = {
  title: "MediClinic - Consultorio Médico",
  description: "Plataforma para agendar citas médicas",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <FloatingChatButton />
        </AuthProvider>
      </body>
    </html>
  )
}