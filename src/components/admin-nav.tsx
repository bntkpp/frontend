"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, BookOpen, CreditCard, Star, LogOut, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/courses", label: "Cursos", icon: BookOpen },
  { href: "/admin/payments", label: "Pagos", icon: CreditCard },
  { href: "/admin/reviews", label: "Reseñas", icon: Star },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="w-full md:w-64 bg-card border-r border-border p-4 space-y-2">
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Paidek Admin</span>
        </Link>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Ir al Sitio</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </nav>
  )
}
