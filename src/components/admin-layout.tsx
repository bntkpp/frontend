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
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Usuarios", href: "/admin/users", icon: Users },
  { name: "Cursos", href: "/admin/courses", icon: BookOpen },
  { name: "Módulos", href: "/admin/modules", icon: FileText },
  { name: "Lecciones", href: "/admin/lessons", icon: FileText },
  { name: "Inscripciones", href: "/admin/enrollments", icon: GraduationCap },
  { name: "Pagos", href: "/admin/payments", icon: CreditCard },
  { name: "Reseñas", href: "/admin/reviews", icon: Settings },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col shadow-sm">
        <div className="p-6 border-b bg-gradient-to-br from-primary/5 to-transparent">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <div>
              <span className="font-bold text-xl block">Paidek</span>
              <span className="text-xs text-muted-foreground">Panel Admin</span>
            </div>
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
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t bg-muted/50 space-y-2">
          <Button asChild variant="ghost" className="w-full justify-start hover:bg-background transition-colors">
            <Link href="/">
              <Home className="h-5 w-5 mr-3" />
              Ir al sitio
            </Link>
          </Button>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
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
