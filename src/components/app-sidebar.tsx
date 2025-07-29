"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Settings,
  LogOut,
  Landmark,
} from "lucide-react";
import { GuardianIcon } from "@/components/icons";

export function AppSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/employees", label: "Empleados", icon: Users },
    { href: "/services", label: "Servicios", icon: Building },
    { href: "/payroll", label: "Nómina", icon: FileText },
    { href: "/loans", label: "Préstamos", icon: Landmark },
  ];
  
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <GuardianIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-headline font-semibold text-primary">
            Guardian
          </h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href}>
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
       <SidebarFooter>
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configuración">
              <Settings />
              <span>Configuración</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar Sesión">
              <LogOut />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
