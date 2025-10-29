import { createClient } from "@/lib/supabase/server"
import { AdminLayout } from "@/components/admin-layout"
import { AdminCoursesManager } from "@/components/admin-courses-manager"
import { unstable_noStore as noStore } from "next/cache"

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'  

export default async function AdminCoursesPage() {
  noStore()
  
  try {
    const supabase = await createClient()

    const { data: courses, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      throw error
    }

    console.log("Courses loaded:", courses?.length)

    return (
      <AdminLayout>
        <AdminCoursesManager initialCourses={courses || []} />
      </AdminLayout>
    )
  } catch (error) {
    console.error("Page error:", error)
    return (
      <AdminLayout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Error al cargar cursos</h1>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </AdminLayout>
    )
  }
}
