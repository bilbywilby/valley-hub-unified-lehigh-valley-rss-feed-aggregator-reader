import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Rss, Settings, BarChart3, BookOpen, Fingerprint, ShieldAlert, Cpu } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
};
export function AppLayout({ children, container = false, className }: AppLayoutProps): JSX.Element {
  const location = useLocation();
  const identity = useLiveQuery(() => db.identity.toCollection().first());
  const navItems = [
    { label: "Mesh", path: "/", icon: Home },
    { label: "Sources", path: "/feeds", icon: Rss },
    { label: "Metrics", path: "/telemetry", icon: BarChart3 },
    { label: "Wiki", path: "/docs", icon: BookOpen },
    { label: "System", path: "/settings", icon: Settings },
  ];
  return (
    <div className="flex min-h-screen bg-terminal-bg terminal-bg-scanline">
      {/* M3 Navigation Rail */}
      <nav className="fixed left-0 top-0 h-full w-20 flex flex-col items-center py-6 bg-surface-container border-r border-border/10 z-50">
        <div className="mb-10 group">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-glow active:scale-95 transition-all">
            V
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-6 w-full">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "nav-rail-item group",
                location.pathname === item.path ? "nav-rail-active" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="nav-rail-indicator group-hover:bg-surface-variant">
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] uppercase font-black tracking-tighter nav-rail-label">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        <div className="mt-auto flex flex-col items-center gap-6">
          <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="text-[8px] font-mono uppercase font-black">Lattice</span>
          </div>
          <ThemeToggle className="relative top-0 right-0 h-10 w-10 hover:bg-primary/10 rounded-full" />
          <div className="h-10 w-10 rounded-full bg-surface-container-high border border-border/20 flex items-center justify-center overflow-hidden">
             {identity ? <Fingerprint className="h-5 w-5 text-primary/50" /> : <ShieldAlert className="h-5 w-5 text-destructive animate-pulse" />}
          </div>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className={cn(
        "flex-1 ml-20 transition-all duration-300",
        container && "max-w-7xl mx-auto px-6 py-12 md:px-12 md:py-16",
        className
      )}>
        {children}
        {/* M3 Floating Footer Metadata */}
        <footer className="mt-20 py-10 border-t border-border/5 opacity-30 flex justify-between items-center text-[10px] font-mono uppercase tracking-[0.2em]">
          <span>ValleyHub Node v14.0.2 // Status: Secure</span>
          <div className="flex gap-6">
            <span>Lat: 40.6139</span>
            <span>Lng: -75.4778</span>
            <span>Identity: {identity?.nodeId.slice(0, 8)}...</span>
          </div>
        </footer>
      </main>
    </div>
  );
}