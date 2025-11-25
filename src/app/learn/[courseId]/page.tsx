import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function LearnCoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is enrolled
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single()

  if (!enrollment) {
    redirect("/courses")
  }

  // Check if enrollment has expired
  if (enrollment.expires_at && new Date(enrollment.expires_at) < new Date()) {
    redirect("/dashboard?expired=true")
  }

  // Get first lesson
  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  if (modules && modules.length > 0 && modules[0].lessons && modules[0].lessons.length > 0) {
    const firstLesson = modules[0].lessons.sort((a, b) => a.order_index - b.order_index)[0]
    redirect(`/learn/${courseId}/${firstLesson.id}`)
  }

  redirect("/dashboard")
}
