
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Landmark,
  Shield,
  LogOut,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Empleados", icon: Users },
  { href: "/services", label: "Servicios", icon: Building },
  { href: "/payroll", label: "Nómina", icon: FileText },
  { href: "/loans", label: "Préstamos", icon: Landmark },
  { href: "/profile", label: "Mi Perfil", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { employee, logout } = useAuth();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="flex items-center justify-center h-20 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold font-headline">Guardian Payroll</h1>
          </Link>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-6 border-t border-sidebar-border">
         <div className="mb-4 text-center">
            <p className="text-sm font-semibold">{employee?.name}</p>
            <p className="text-xs text-sidebar-foreground/70">{employee?.role}</p>
         </div>
         <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
         </Button>
      </div>
    </aside>
  );
}
