"use client"

import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { getUserData } from "@/app/services/api";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminButton() {
  const userData = getUserData();
  
  // Parsear el string JSON del rol
  let isAdmin = false;
  
  if (userData?.role) {
    try {
      const roles = JSON.parse(userData.role);
      isAdmin = Array.isArray(roles) && roles.some((r: any) => 
        r && typeof r === 'object' && r.authority === "ROLE_ADMIN"
      );
    } catch (error) {
      console.error("Error parsing roles:", error);
    }
  }

  if (!isAdmin) return null;

  return (
    <>
      {/* Versión para escritorio */}
      <Button variant="outline" size="sm" asChild className="hidden sm:flex">
        <Link href="/dashboard/admin-crud">
          <Shield className="w-4 h-4 mr-2" />
          Panel Admin
        </Link>
      </Button>
      
      {/* Versión para móvil */}
      <Button variant="outline" size="icon" asChild className="sm:hidden">
        <Link href="/dashboard/admin-crud">
          <Shield className="w-4 h-4" />
        </Link>
      </Button>
    </>
  );
}