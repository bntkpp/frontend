"use client"

import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  GraduationCap,
  LogOut,
  Settings,
  Home,
  CreditCard, // Agregar este icono
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Cursos", href: "/admin/courses", icon: BookOpen },
  { name: "Módulos", href: "/admin/modules", icon: FileText },
  { name: "Lecciones", href: "/admin/lessons", icon: FileText },
  { name: "Inscripciones", href: "/admin/enrollments", icon: GraduationCap },
  { name: "Pagos", href: "/admin/payments", icon: CreditCard }, // Agregar esta línea
  { name: "Reseñas", href: "/admin/reviews", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6 border-b">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">P</span>
            </div>
            <span className="font-bold text-xl">Paidek Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start">
            <Link href="/">
              <Home className="h-5 w-5 mr-3" />
              Ir al sitio
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-600">
              <LogOut className="h-5 w-5 mr-3" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">{children}</div>
      </main>
    </div>
  )
}
