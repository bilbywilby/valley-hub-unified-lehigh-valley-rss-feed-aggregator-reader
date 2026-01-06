import React from "react";
import { Home, Rss, Settings, BarChart3, Info, Newspaper, RefreshCw, PlusCircle, Trash2 } from "lucide-react";
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

export function AppSidebar(): JSX.Element {
  const location = useLocation();
  return (
    <Sidebar>
      <SidebarHeader className="py-4 px-6 bg-background">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-brand-orange flex items-center justify-center text-white font-bold text-lg shadow-glow">
            V
          </div>
          <span className="text-lg font-display font-bold tracking-tight">
            Valley <span className="text-brand-orange">Hub</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarMenu className="flex-row gap-2 px-2">
            <SidebarMenuItem className="flex-1">
              <SidebarMenuButton tooltip="Refresh All" onClick={() => window.location.reload()} className="justify-center hover:bg-brand-orange/10 hover:text-brand-orange">
                <RefreshCw className="h-4 w-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex-1">
              <SidebarMenuButton asChild tooltip="Add Source">
                <Link to="/feeds" className="justify-center hover:bg-brand-orange/10 hover:text-brand-orange">
                  <PlusCircle className="h-4 w-4" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="flex-1">
              <SidebarMenuButton 
                tooltip="Clear Cache" 
                className="justify-center hover:bg-destructive/10 hover:text-destructive"
                onClick={async () => {
                  if(confirm("Clear local cache?")) {
                    await db.articles.clear();
                    toast.success("Cache cleared");
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                <Link to="/">
                  <Home /> <span>Home</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/feeds"}>
                <Link to="/feeds">
                  <Rss /> <span>Manage Feeds</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>User & Data</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/telemetry"}>
                <Link to="/telemetry">
                  <BarChart3 /> <span>Telemetry</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={location.pathname === "/settings"}>
                <Link to="/settings">
                  <Settings /> <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="#">
                  <Info /> <span>About Valley Hub</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
          Privacy First RSS
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}