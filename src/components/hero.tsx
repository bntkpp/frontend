import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, GraduationCap } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <GraduationCap className="h-4 w-4" />
              Plataforma Educativa Online
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-balance leading-tight">
              Prepárate para tus <span className="text-primary">Exámenes Libres</span> con Confianza
            </h1>

            <p className="text-lg text-muted-foreground text-balance leading-relaxed">
              Accede a cursos completos, material de estudio actualizado y apoyo personalizado para alcanzar tus
              objetivos académicos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base">
                <Link href="#courses">
                  Explorar Cursos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/auth/sign-up">Comenzar Gratis</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-8 pt-4 text-sm text-muted-foreground">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-foreground">+2,200</span>
                <span>Estudiantes</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-bold text-foreground">20+</span>
                <span>Cursos</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm">Validación oficial MINEDUC</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-border">
              <iframe
                src="https://www.youtube.com/embed/0NUo6CJOWtY"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Introducción a Paidek"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
