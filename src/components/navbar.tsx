"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/components/auth-provider"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Paidek</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/#courses" className="text-sm font-medium hover:text-primary transition-colors">
              Cursos
            </Link>
            <Link href="/#about" className="text-sm font-medium hover:text-primary transition-colors">
              Nosotros
            </Link>
            <Link href="/faq" className="text-sm font-medium hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contacto
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={signOut}>
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/sign-up">Registrarse</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/#courses"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Cursos
            </Link>
            <Link
              href="/#about"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              href="/faq"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contacto
            </Link>
            <div className="pt-4 space-y-2 border-t">
              {user ? (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}>
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
