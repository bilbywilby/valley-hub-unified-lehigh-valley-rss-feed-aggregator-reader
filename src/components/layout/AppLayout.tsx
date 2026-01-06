import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): JSX.Element {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className={cn("bg-background transition-colors duration-500", className)}>
        {/* MD3 Header Rail */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 backdrop-blur-xl bg-background/80 border-b border-border/20 md:px-8">
          <div className="flex items-center gap-2">
            <div className="bg-surface-container-high rounded-full p-1 shadow-sm border border-border/40">
              <SidebarTrigger className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90" />
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 ml-2">Lehigh Valley Network</span>
            </div>
          </div>
          <div className="bg-surface-container-high rounded-full p-1 shadow-sm border border-border/40 flex items-center gap-1">
            <ThemeToggle className="relative h-10 w-10 top-0 right-0 rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90" />
          </div>
        </header>
        {/* Content Area */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          container && "max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-10 md:py-16",
          contentClassName
        )}>
          {children}
        </main>
        {/* MD3 Footer Guard */}
        <footer className="py-12 px-8 mt-auto border-t border-border/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-widest">&copy; 2025 Valley Hub Mesh</span>
            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Nodes</a>
              <a href="#" className="hover:text-primary transition-colors">Integrity</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}