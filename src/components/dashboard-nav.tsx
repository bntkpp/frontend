"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, CreditCard, User, LogOut, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Mis Cursos", icon: BookOpen },
  { href: "/dashboard/payments", label: "Pagos", icon: CreditCard },
  { href: "/dashboard/profile", label: "Perfil", icon: User },
]

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <>
      <div className="mb-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold" onClick={onLinkClick}>
          <BookOpen className="h-6 w-6 text-primary" />
          <span>Paidek</span>
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
              onClick={onLinkClick}
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
          onClick={onLinkClick}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Home className="h-5 w-5" />
          <span>Inicio</span>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={() => {
            handleLogout()
            onLinkClick?.()
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </>
  )
}

export function DashboardNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-card border-r border-border p-4 space-y-2 flex-col">
        <NavContent />
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Paidek</span>
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-4">
              <NavContent onLinkClick={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
