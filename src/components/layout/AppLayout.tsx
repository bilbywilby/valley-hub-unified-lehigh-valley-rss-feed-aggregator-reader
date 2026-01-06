import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Rss, Settings, BarChart3, BookOpen, Fingerprint, ShieldAlert, Cpu, Search, Wifi } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
};
export function AppLayout({ children, container = false, className }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const navItems = [
    { label: "Mesh", path: "/", icon: Home },
    { label: "Sources", path: "/feeds", icon: Rss },
    { label: "Metrics", path: "/telemetry", icon: BarChart3 },
    { label: "Wiki", path: "/docs", icon: BookOpen },
    { label: "System", path: "/settings", icon: Settings },
  ];
  return (
    <div className="flex min-h-screen bg-terminal-bg relative">
      <div className="fixed inset-0 pointer-events-none terminal-bg-scanline opacity-[0.03] z-50" />
      {/* Sticky Header */}
      <header className={cn(
        "fixed top-0 right-0 left-20 z-[55] transition-all duration-300 border-b",
        scrolled ? "bg-background/80 backdrop-blur-xl border-border/10 py-3" : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/50 border border-border/10">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-500/80">Mesh: Online</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity">
               <Wifi className="h-3 w-3" />
               <span className="text-[9px] font-mono uppercase font-bold tracking-tighter">LV_NODE_CONNECTED</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Global Mesh Query..." 
                className="h-9 w-64 pl-10 bg-surface-container-high/40 border-none rounded-full text-xs font-mono focus-visible:ring-primary focus-visible:ring-offset-0"
              />
            </div>
            <ThemeToggle className="relative top-0 right-0 h-9 w-9" />
          </div>
        </div>
      </header>
      {/* M3 Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 bg-surface-container border-r border-border/10 z-[60]">
        <div className="mb-10">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-glow active:scale-95 transition-all cursor-pointer">
            V
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-6 w-full items-center">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-rail-item group flex flex-col items-center justify-center gap-1 w-full",
                location.pathname === item.path ? "nav-rail-active" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "nav-rail-indicator h-8 w-14 rounded-full flex items-center justify-center transition-all duration-300",
                location.pathname === item.path ? "bg-primary/20 text-primary" : "group-hover:bg-surface-variant"
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className={cn(
                "text-[9px] uppercase font-black tracking-tighter nav-rail-label mt-1",
                location.pathname === item.path ? "text-primary" : "opacity-60"
              )}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-auto flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="text-[8px] font-mono uppercase font-black">Lattice</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-border/20 flex items-center justify-center overflow-hidden mb-2">
             {identity ? (
               <Fingerprint className="h-5 w-5 text-primary/50" />
             ) : (
               <ShieldAlert className="h-5 w-5 text-destructive animate-pulse" />
             )}
          </div>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 ml-20 mt-16 transition-all duration-300",
        container && "max-w-[1400px] mx-auto px-6 py-12 md:px-12 md:py-12",
        className
      )}>
        {children}
        <footer className="mt-20 py-10 border-t border-border/5 opacity-30 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-[0.2em] terminal-text">
          <span className="font-black">ValleyHub Node v14.2.1 // SIG_STATUS: SECURE_ENCLAVE_READY</span>
          <div className="flex gap-8">
            <span className="flex gap-2">LAT: <span className="text-primary font-black">40.6139</span></span>
            <span className="flex gap-2">LNG: <span className="text-primary font-black">-75.4778</span></span>
            {identity && (
              <span className="flex gap-2">ID: <span className="text-primary font-black">{identity.nodeId.slice(0, 8)}</span></span>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}