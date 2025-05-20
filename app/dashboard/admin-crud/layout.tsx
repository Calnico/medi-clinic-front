import { AdminSidebar } from "@/app/components/dashboard/admin-sidebar";

export default function AdminCrudLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <AdminSidebar />
      
      <div className="flex-1 w-full lg:overflow-auto p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}