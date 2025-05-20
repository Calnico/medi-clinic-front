import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AdminButton } from "@/components/ui/admin-button"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <span className="font-semibold text-lg hidden sm:inline-flex">MediClinic</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <AdminButton />
            <Button variant="outline" asChild size="sm" className="hidden sm:flex">
              <Link href="/">Volver al Inicio</Link>
            </Button>
            <Button variant="ghost" asChild size="icon" className="sm:hidden">
              <Link href="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      <footer className="border-t py-4 bg-background">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MediClinic. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}