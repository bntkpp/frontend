import Link from "next/link"
import { BookOpen, Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Paidek</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tu plataforma de confianza para preparación de exámenes libres.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Cursos</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Matemática
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Lengua
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Historia
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-foreground">
                  Ver todos
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="#about" className="hover:text-foreground">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="#faq" className="hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground">
                  Términos
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground">
                  Privacidad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>colegiopaideiaonline@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Santiago, Chile</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Paidek. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
