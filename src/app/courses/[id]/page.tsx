import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen, Award, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
}

const levelColors: Record<string, string> = {
  beginner: "bg-accent/20 text-accent-foreground",
  intermediate: "bg-primary/20 text-primary-foreground",
  advanced: "bg-destructive/20 text-destructive-foreground",
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error || !course) {
    redirect("/courses")
  }

  // Check if user is logged in and enrolled
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isEnrolled = false
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", user.id)
      .eq("course_id", id)
      .single()
    isEnrolled = !!enrollment
  }

  // Get modules for this course
  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", id)
    .order("order_index", { ascending: true })

  // Get reviews for this course
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, profiles(full_name)")
    .eq("course_id", id)
    .order("created_at", { ascending: false })
    .limit(5)

  const averageRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : null

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  {course.level && (
                    <Badge variant="secondary" className={levelColors[course.level]}>
                      {levelLabels[course.level]}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{course.title}</h1>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{course.description}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  {course.duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>
                        <strong>{course.duration_hours}</strong> horas de contenido
                      </span>
                    </div>
                  )}
                  {modules && modules.length > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <span>
                        <strong>{modules.length}</strong> módulos
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Certificado al finalizar</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-20">
                  <CardContent className="pt-6">
                    <img
                      src={course.image_url || "/placeholder.svg?height=300&width=400&query=education+course"}
                      alt={course.title}
                      className="w-full h-48 object-cover rounded-lg mb-6"
                    />
                    <div className="text-center mb-6">
                      <p className="text-3xl font-bold text-primary mb-2">${course.price.toLocaleString("es-AR")}</p>
                      <p className="text-sm text-muted-foreground">Pago único - Acceso de por vida</p>
                    </div>
                    {isEnrolled ? (
                      <Button size="lg" className="w-full mb-4" asChild>
                        <Link href={`/learn/${id}`}>Ir al Curso</Link>
                      </Button>
                    ) : (
                      <Button size="lg" className="w-full mb-4" asChild>
                        <Link href={user ? `/checkout/${id}` : "/auth/sign-up"}>
                          {user ? "Comprar Ahora" : "Registrarse para Comprar"}
                        </Link>
                      </Button>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Acceso ilimitado</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Material descargable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Certificado digital</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        <span>Soporte de profesores</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {modules && modules.length > 0 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-6">Contenido del Curso</h2>
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <Card key={module.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{module.title}</h3>
                          {module.description && (
                            <p className="text-muted-foreground leading-relaxed">{module.description}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {reviews && reviews.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-3xl font-bold">Reseñas</h2>
                {averageRating && (
                  <Badge variant="secondary" className="text-lg">
                    ⭐ {averageRating}
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <span key={i} className="text-accent">
                            ⭐
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>
                      <p className="text-sm font-semibold">{review.profiles?.full_name || "Estudiante"}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  )
}
