import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Star } from "lucide-react"
import Link from "next/link"

const courses = [
  {
    id: 1,
    title: "Matemática - Nivel Secundario",
    description: "Curso completo de matemática para exámenes libres de secundaria.",
    image: "/abstract-mathematics.png",
    duration: "40 horas",
    modules: 12,
    rating: 4.8,
    price: "$15,000",
  },
  {
    id: 2,
    title: "Lengua y Literatura",
    description: "Preparación integral para aprobar lengua y literatura con éxito.",
    image: "/open-book-stacks.png",
    duration: "35 horas",
    modules: 10,
    rating: 4.9,
    price: "$12,000",
  },
  {
    id: 3,
    title: "Historia Argentina",
    description: "Recorre la historia argentina desde sus orígenes hasta la actualidad.",
    image: "/history-scroll-timeline.png",
    duration: "30 horas",
    modules: 8,
    rating: 4.7,
    price: "$10,000",
  },
]

export function CoursePreview() {
  return (
    <section id="courses" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Cursos Destacados</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
            Explora nuestra selección de cursos diseñados para tu éxito
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <img src={course.image || "/placeholder.svg"} alt={course.title} className="w-full h-48 object-cover" />
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{course.modules} módulos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span>{course.rating}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-2xl font-bold text-primary">{course.price}</span>
                <Button asChild>
                  <Link href="/auth/sign-up">Ver Curso</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/courses">Ver Todos los Cursos</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
