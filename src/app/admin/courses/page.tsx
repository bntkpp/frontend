import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Eye, EyeOff } from "lucide-react"

export default async function AdminCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  // Get all courses
  const { data: courses } = await supabase.from("courses").select("*").order("created_at", { ascending: false })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Gestión de Cursos</h1>
            <p className="text-muted-foreground">Administra los cursos de la plataforma</p>
          </div>
        </div>

        <div className="space-y-4">
          {!courses || courses.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">No hay cursos disponibles</p>
              </CardContent>
            </Card>
          ) : (
            courses.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <img
                      src={course.image_url || "/placeholder.svg?height=100&width=150&query=education+course"}
                      alt={course.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <Badge variant={course.is_published ? "default" : "secondary"}>
                              {course.is_published ? (
                                <>
                                  <Eye className="h-3 w-3 mr-1" />
                                  Publicado
                                </>
                              ) : (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Borrador
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{course.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>${course.price.toLocaleString("es-AR")}</span>
                            {course.duration_hours && <span>{course.duration_hours}h</span>}
                            {course.level && <span className="capitalize">{course.level}</span>}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
