"use client"

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  LayoutDashboard,
  Settings,
  UserCog,
  Menu,
  X,
  MapPin // Nuevo icono para ubicaciones físicas
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navItems = [
    {
      name: "Ubicaciones Físicas", // Nueva opción primero
      href: "/dashboard/admin-crud/physical-locations",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: "Dashboard",
      href: "/dashboard/admin-crud",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      name: "Usuarios",
      href: "/dashboard/admin-crud/users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "Doctores",
      href: "/dashboard/admin-crud/doctors",
      icon: <UserCog className="w-4 h-4" />,
    },
    {
      name: "Especialidades",
      href: "/dashboard/admin-crud/specialties",
      icon: <Stethoscope className="w-4 h-4" />,
    },
    {
      name: "Citas",
      href: "/dashboard/admin-crud/appointments",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      name: "Configuración",
      href: "/dashboard/admin-crud/settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Botón para mostrar/ocultar el menú en móvil */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
        >
          {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
        </Button>
      </div>

      {/* Overlay para móvil cuando el menú está abierto */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar para escritorio */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-full",
        showMobileMenu ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full p-4">
          <div className="mb-8 px-2 flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Admin Panel</h2>
              <p className="text-xs text-muted-foreground">MediClinic Control</p>
            </div>
          </div>
          
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-4 border-t">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="text-xs text-muted-foreground">
                MediClinic v1.0.0
              </div>
              <Link 
                href="/dashboard" 
                className="text-xs text-blue-600 hover:underline"
                onClick={() => setShowMobileMenu(false)}
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}