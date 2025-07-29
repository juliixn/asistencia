
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Landmark,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Empleados", icon: Users },
  { href: "/services", label: "Servicios", icon: Building },
  { href: "/payroll", label: "Nómina", icon: FileText },
  { href: "/loans", label: "Préstamos", icon: Landmark },
];

export function BottomNavbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
        await auth.signOut();
        toast({
            title: "Sesión Cerrada",
            description: "Has cerrado sesión exitosamente."
        })
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo cerrar la sesión."
        })
    }
  }

  if (loading || !user) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-sm z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200",
                isActive ? "text-primary" : "hover:text-primary"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
         <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200 hover:text-primary"
        >
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Salir</span>
        </button>
      </div>
    </nav>
  );
}

