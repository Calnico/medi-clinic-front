"use client"

import { Button } from "@/components/ui/button";
import { Shield, Stethoscope } from "lucide-react";
import { getUserData } from "@/app/services/api";
import Link from "next/link";

export function AdminButton() {
  const userData = getUserData();

  // Inicializa los flags y variables
  let isAdmin = false;
  let isDoctor = false;

  if (userData?.role) {
    try {
      const roles = JSON.parse(userData.role);
      if (Array.isArray(roles)) {
        isAdmin = roles.some((r: any) => r?.authority === "ROLE_ADMIN");
        isDoctor = roles.some((r: any) => r?.authority === "ROLE_DOCTOR");
      }
    } catch (error) {
      console.error("Error parsing roles:", error);
    }
  }

  // Determina la ruta y contenido según el rol
  let href = "";
  let label = "";
  let Icon = null;

  if (isAdmin) {
    href = "/dashboard/admin-crud";
    label = "Panel Admin";
    Icon = Shield;
  } else if (isDoctor) {
    href = "/dashboard/doctor-crud";
    label = "Panel Doctor";
    Icon = Stethoscope;
  } else {
    return null;
  }

  return (
    <>
      {/* Escritorio */}
      <Button variant="outline" size="sm" asChild className="hidden sm:flex">
        <Link href={href}>
          <Icon className="w-4 h-4 mr-2" />
          {label}
        </Link>
      </Button>

      {/* Móvil */}
      <Button variant="outline" size="icon" asChild className="sm:hidden">
        <Link href={href}>
          <Icon className="w-4 h-4" />
        </Link>
      </Button>
    </>
  );
}
