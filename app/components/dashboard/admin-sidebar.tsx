"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Users, 
  Stethoscope, 
  Calendar, 
  LayoutDashboard,
  Settings,
  UserCog,
  ClipboardList
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
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
    <div className="hidden md:flex flex-col w-64 h-full border-r bg-background p-4">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-muted-foreground">MediClinic Control</p>
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
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t">
        <div className="text-xs text-muted-foreground px-3">
          MediClinic v1.0.0
        </div>
      </div>
    </div>
  );
}