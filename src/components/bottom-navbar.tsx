
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Landmark,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Empleados", icon: Users },
  { href: "/loans", label: "Préstamos", icon: Landmark },
  { href: "/profile", label: "Perfil", icon: UserCircle },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-sm z-50 lg:hidden">
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
      </div>
    </nav>
  );
}
