"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { motion, AnimatePresence } from "framer-motion"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, loading, signOut } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.nav
      className={`sticky top-0 z-50 w-full border-b border-border backdrop-blur-md transition-all duration-300 ${scrolled
          ? "bg-background/80 shadow-lg"
          : "bg-background/60"
        }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <BookOpen className="h-6 w-6 text-primary" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Paidek
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/#courses"
              className="text-sm font-medium hover:text-primary transition-colors relative group"
            >
              Cursos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/#about"
              className="text-sm font-medium hover:text-primary transition-colors relative group"
            >
              Nosotros
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/#faq"
              className="text-sm font-medium hover:text-primary transition-colors relative group"
            >
              FAQ
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/#contacto"
              className="text-sm font-medium hover:text-primary transition-colors relative group"
            >
              Contacto
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          </div>

          <motion.div
            className="hidden md:flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {loading ? (
              <div className="h-9 w-32 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <>
                <Button variant="ghost" asChild className="transition-all hover:bg-primary/10 hover:text-primary hover:scale-105">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="outline" onClick={signOut} className="transition-all hover:scale-105">
                  Cerrar Sesión
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="transition-all hover:scale-105">
                  <Link href="/auth/login">Iniciar Sesión</Link>
                </Button>
                <Button asChild className="transition-all hover:scale-105 bg-gradient-to-r from-primary to-primary/80">
                  <Link href="/auth/sign-up">Registrarse</Link>
                </Button>
              </>
            )}
          </motion.div>

          <motion.button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden py-4 space-y-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              <Link
                href="/courses"
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
                href="/#faq"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/#contacto"
                className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>

              <motion.div
                className="pt-4 space-y-2 border-t"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {user ? (
                  <>
                    <Button variant="ghost" className="w-full hover:bg-primary/10 hover:text-primary" asChild>
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
                    <Button className="w-full bg-gradient-to-r from-primary to-primary/80" asChild>
                      <Link href="/auth/sign-up" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
                    </Button>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}
