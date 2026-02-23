import { ReactNode } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { Navbar } from "@/components/Navbar";

export function DashboardLayout({ children, fullBleed }: { children: ReactNode; fullBleed?: boolean }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-hidden">
          {fullBleed ? (
            <div className="h-full">
              {children}
            </div>
          ) : (
            <div className="p-6 max-w-[1600px] mx-auto h-full">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
