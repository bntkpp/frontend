import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, TrendingUp } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

export async function CoursePreview() {
  const supabase = await createClient()

  // Obtener los 3 cursos más recientes publicados
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false })
    .limit(3)

  if (!courses || courses.length === 0) {
    return (
      <section id="courses" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Cursos Destacados</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
              Próximamente tendremos cursos disponibles
            </p>
          </div>
        </div>
      </section>
    )
  }

  const calculateSavings = (monthlyPrice: number, totalPrice: number, months: number) => {
    const regularTotal = monthlyPrice * months
    const savings = regularTotal - totalPrice
    const savingsPercent = Math.round((savings / regularTotal) * 100)
    return savingsPercent
  }

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
          {courses.map((course) => {
            const savings4Months = calculateSavings(course.price_1_month, course.price_4_months, 4)
            const savings8Months = calculateSavings(course.price_1_month, course.price_8_months, 8)
            const bestSavings = Math.max(savings4Months, savings8Months)

            return (
              <Card key={course.id} className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                  {course.image_url ? (
                    <Image
                      src={course.image_url}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <BookOpen className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                  {bestSavings > 0 && (
                    <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-700">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Ahorra hasta {bestSavings}%
                    </Badge>
                  )}
                </div>

                <CardContent className="pt-6 flex-1">
                  <h3 className="text-xl font-semibold mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3">
                    {course.short_description || course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {course.duration_hours && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours} horas</span>
                      </div>
                    )}
                    {course.level && (
                      <Badge variant="secondary" className="capitalize">
                        {course.level === "beginner" && "Principiante"}
                        {course.level === "intermediate" && "Intermedio"}
                        {course.level === "advanced" && "Avanzado"}
                      </Badge>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3 pt-0">
                  <div className="w-full">
                    <div className="flex items-baseline justify-between mb-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Desde</span>
                        <p className="text-2xl font-bold text-primary">
                          ${course.price_1_month.toLocaleString("es-CL")}
                          <span className="text-sm font-normal text-muted-foreground">/mes</span>
                        </p>
                      </div>
                      {course.price_4_months && (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Plan 4 meses</p>
                          <p className="text-lg font-semibold">
                            ${(course.price_4_months).toLocaleString("es-CL")}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/courses/${course.id}`}>Ver Detalles</Link>
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
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
