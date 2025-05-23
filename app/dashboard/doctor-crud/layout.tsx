import { DoctorSidebar } from "@/app/components/dashboard/doctor-sidebar";

export default function DoctorCrudLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <DoctorSidebar />
      
      <div className="flex-1 w-full lg:overflow-auto p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}