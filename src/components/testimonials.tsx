import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "María González",
    role: "Estudiante",
    content:
      "Gracias a Paidek pude aprobar todas mis materias pendientes. El material es excelente y los profesores muy atentos.",
    rating: 5,
  },
  {
    name: "Juan Pérez",
    role: "Estudiante",
    content: "La plataforma es muy fácil de usar y el contenido está muy bien explicado. Totalmente recomendable.",
    rating: 5,
  },
  {
    name: "Laura Martínez",
    role: "Estudiante",
    content: "Excelente experiencia. Pude estudiar a mi ritmo y aprobar con muy buenas notas. Muy satisfecha.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Lo que dicen nuestros estudiantes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Miles de estudiantes han alcanzado sus objetivos con Paidek
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">{testimonial.content}</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
