"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseCard } from "@/components/course-card"
import { CourseFilters } from "@/components/course-filters"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Course {
  id: string
  title: string
  description: string
  short_description: string | null
  image_url: string | null
  price: number
  duration_hours: number | null
  level: string | null
  is_published: boolean
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    async function fetchCourses() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("[v0] Error fetching courses:", error)
      } else {
        setCourses(data || [])
        setFilteredCourses(data || [])
      }
      setIsLoading(false)
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    let filtered = courses

    // Filter by level
    if (levelFilter !== "all") {
      filtered = filtered.filter((course) => course.level === levelFilter)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredCourses(filtered)
  }, [levelFilter, searchQuery, courses])

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Catálogo de Cursos</h1>
            <p className="text-lg text-muted-foreground max-w-2xl text-balance leading-relaxed">
              Explora nuestra colección completa de cursos para exámenes libres
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <CourseFilters onLevelChange={setLevelFilter} onSearchChange={setSearchQuery} />

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Cargando cursos...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron cursos con los filtros seleccionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    id={course.id}
                    title={course.title}
                    description={course.short_description || course.description}
                    image_url={course.image_url}
                    price={course.price}
                    duration_hours={course.duration_hours}
                    level={course.level}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </main>
  )
}
