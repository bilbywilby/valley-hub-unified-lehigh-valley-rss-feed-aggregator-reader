import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Rss, Settings, BarChart3, BookOpen, Fingerprint, ShieldAlert, Cpu, Search, Wifi, Activity } from "lucide-react";
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
  const [syncStatus, setSyncStatus] = useState<'stable' | 'syncing' | 'p2p'>('stable');
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  // Simulate network indicator logic
  useEffect(() => {
    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand > 0.95) setSyncStatus('p2p');
      else if (rand > 0.8) setSyncStatus('syncing');
      else setSyncStatus('stable');
      if (rand > 0.8) setTimeout(() => setSyncStatus('stable'), 2000);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const navItems = [
    { label: "Live", path: "/", icon: Home },
    { label: "Lattice", path: "/telemetry", icon: BarChart3 },
    { label: "Mesh", path: "/feeds", icon: Rss },
    { label: "Docs", path: "/docs", icon: BookOpen },
    { label: "System", path: "/settings", icon: Settings },
  ];
  return (
    <div className="flex min-h-screen bg-terminal-bg relative">
      <div className="fixed inset-0 pointer-events-none terminal-bg-scanline opacity-[0.03] z-[100]" />
      {/* Sticky Header */}
      <header className={cn(
        "fixed top-0 right-0 left-20 z-[55] transition-all duration-500 border-b",
        scrolled
          ? "bg-background/85 backdrop-blur-2xl border-border/10 py-3 shadow-md3-2"
          : "bg-transparent border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-high/50 border border-border/10">
              <div className={cn(
                "h-2 w-2 rounded-full transition-all duration-500",
                syncStatus === 'stable' && "bg-emerald-500 shadow-[0_0_8px_#4ade80]",
                syncStatus === 'syncing' && "bg-primary animate-pulse-fast shadow-[0_0_8px_hsl(var(--primary))]",
                syncStatus === 'p2p' && "bg-blue-500 animate-bounce shadow-[0_0_8px_#3b82f6]"
              )} />
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-foreground/80">
                {syncStatus === 'stable' && "SIG_STABLE"}
                {syncStatus === 'syncing' && "SIG_SYNCING"}
                {syncStatus === 'p2p' && "SIG_P2P_HANDSHAKE"}
              </span>
            </div>
            {identity && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 border border-white/5 opacity-60">
                 <span className="text-[9px] font-mono uppercase font-bold tracking-tighter text-primary">SIG_ID: {identity.nodeId.slice(0, 8)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Global Mesh Query..."
                className="h-9 w-48 lg:w-64 pl-10 bg-surface-container-high/40 border-none rounded-full text-xs font-mono focus-visible:ring-primary focus-visible:ring-offset-0 transition-all duration-300 focus:w-64 lg:focus:w-80"
              />
            </div>
            <ThemeToggle className="relative top-0 right-0 h-9 w-9" />
          </div>
        </div>
      </header>
      {/* M3 Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-8 bg-surface-container border-r border-border/10 z-[60]">
        <div className="mb-10">
          <Link to="/">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-glow hover:scale-105 active:scale-95 transition-all cursor-pointer">
              V
            </div>
          </Link>
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
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-border/20 flex items-center justify-center overflow-hidden mb-2 group cursor-pointer hover:border-primary/50 transition-colors">
             {identity ? (
               <Fingerprint className="h-5 w-5 text-primary/50 group-hover:text-primary transition-colors" />
             ) : (
               <ShieldAlert className="h-5 w-5 text-destructive animate-pulse" />
             )}
          </div>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 ml-20 mt-16 transition-all duration-300 min-h-screen",
        container && "max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-12",
        className
      )}>
        {children}
        <footer className="mt-20 py-10 border-t border-border/5 opacity-30 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-mono uppercase tracking-[0.2em] terminal-text">
          <span className="font-black">ValleyHub Node v15.0.0 // SIG_STATUS: SECURE_ENCLAVE_READY</span>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
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