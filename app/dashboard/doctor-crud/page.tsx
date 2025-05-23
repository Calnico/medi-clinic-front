import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DoctorCrudPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Panel del Doctor</CardTitle>
        <CardDescription>Seleccione la opción de "Citas" en el menú lateral</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Bienvenido al panel del doctor. Aquí puede gestionar y visualizar sus citas médicas.</p>
      </CardContent>
    </Card>
  );
}
