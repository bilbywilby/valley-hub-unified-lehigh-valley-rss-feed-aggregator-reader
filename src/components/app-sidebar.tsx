import React from "react";
import { Home, Rss, Settings, BarChart3, Info, RefreshCw, PlusCircle, Trash2, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
export function AppSidebar(): JSX.Element {
  const location = useLocation();
  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Feeds", path: "/feeds", icon: Rss },
    { label: "Metrics", path: "/telemetry", icon: BarChart3 },
    { label: "Wiki", path: "/docs", icon: BookOpen },
    { label: "Settings", path: "/settings", icon: Settings },
  ];
  return (
    <Sidebar className="border-none bg-surface-container">
      <SidebarHeader className="py-8 px-6">
        <div className="flex items-center gap-4 group">
          <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-2xl shadow-md3-2 group-hover:scale-105 transition-transform">
            V
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-black tracking-tight leading-none">
              Valley<span className="text-primary">Hub</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">
              Mesh Node v1.0
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3 gap-6">
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton 
                  asChild 
                  isActive={location.pathname === item.path}
                  className={cn(
                    "h-14 px-4 rounded-full transition-all duration-300",
                    location.pathname === item.path 
                      ? "bg-primary/10 text-primary font-bold shadow-sm" 
                      : "hover:bg-surface-variant hover:text-foreground"
                  )}
                >
                  <Link to={item.path} className="flex items-center gap-4">
                    <item.icon className={cn("h-6 w-6", location.pathname === item.path ? "text-primary fill-primary/10" : "text-muted-foreground")} />
                    <span className="text-base">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator className="bg-border/20 mx-4" />
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Data Mesh</SidebarGroupLabel>
          <SidebarMenu className="px-2 mt-2 gap-2">
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => window.location.reload()} 
                className="rounded-xl h-12 hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-3" /> <span className="text-sm font-bold">Refresh Mesh</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={async () => {
                  if(confirm("Flush local article cache?")) {
                    await db.articles.clear();
                    toast.success("Cache invalidated");
                  }
                }}
                className="rounded-xl h-12 hover:bg-destructive/5 hover:text-destructive transition-colors"
              >
                <Trash2 className="h-5 w-5 mr-3" /> <span className="text-sm font-bold">Flush Cache</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-8 mt-auto border-none">
        <div className="p-4 rounded-3xl bg-surface-container-high border border-border/40 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Info className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Privacy Policy</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Local processing only. No identifiers leave this browser context.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}