import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AdminCrudPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel de Administración</CardTitle>
        <CardDescription>Seleccione una opción del menú lateral</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenido al panel de administración. Desde aquí puede gestionar todos los aspectos del sistema.</p>
      </CardContent>
    </Card>
  );
}