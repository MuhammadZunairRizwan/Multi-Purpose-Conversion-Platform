import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Middleware handles auth protection - no redirect logic here
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
