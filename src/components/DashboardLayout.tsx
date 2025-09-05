import { ReactNode } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { PageTransition } from "./PageTransition";
import { NotificationCenter } from "./NotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="h-screen w-full flex flex-col bg-gradient-to-br from-background-base via-primary-dark/20 to-background-base relative overflow-hidden">
        <AppSidebar />
        <SidebarInset className="flex-1 relative min-w-0 flex flex-col">
          {/* Background Pattern with Corporate Theme */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-grid-small-white/[0.02] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-primary/5 to-transparent" />
          </div>
          
          <header className="flex h-12 sm:h-14 lg:h-16 shrink-0 items-center gap-3 border-b border-primary/20 bg-background/95 backdrop-blur-md px-3 sm:px-4 lg:px-6 relative z-10 shadow-sm">
            <SidebarTrigger className="-ml-1 p-2 sm:p-2.5 rounded-lg hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-corporate-glow/30 touch-target" />
            <div className="flex-1" />
            <NotificationCenter />
          </header>
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 xl:p-8 bg-transparent relative z-10 min-w-0 min-h-0">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};