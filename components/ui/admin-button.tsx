"use client"

import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { getUserData } from "@/app/services/api";
import Link from "next/link";

export function AdminButton() {
  const userData = getUserData();
  
  // Parsear el string JSON del rol
  let isAdmin = false;
  
  if (userData?.role) {
    try {
      const roles = JSON.parse(userData.role);
      isAdmin = roles.some((r: any) => r.authority === "ROLE_ADMIN");
    } catch (error) {
      console.error("Error parsing roles:", error);
    }
  }

  if (!isAdmin) return null;

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/dashboard/admin-crud">
        <Settings className="w-4 h-4 mr-2" />
        Admin
      </Link>
    </Button>
  );
}