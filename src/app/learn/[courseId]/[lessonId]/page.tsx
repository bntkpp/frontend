import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CourseSidebar } from "@/components/course-sidebar"
import { LessonContent } from "@/components/lesson-content"
import { ReviewForm } from "@/components/review-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
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

  // Get course details
  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).single()

  // Get modules with lessons
  const { data: modules } = await supabase
    .from("modules")
    .select("*, lessons(*)")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })

  // Get current lesson
  const { data: lesson } = await supabase.from("lessons").select("*").eq("id", lessonId).single()

  if (!lesson) {
    redirect(`/learn/${courseId}`)
  }

  // Get user progress for all lessons
  const { data: progressData } = await supabase.from("progress").select("*").eq("user_id", user.id)

  // Calculate progress
  const allLessons = modules?.flatMap((m) => m.lessons) || []
  const completedLessons = progressData?.filter((p) => p.completed).length || 0
  const progressPercentage = allLessons.length > 0 ? Math.round((completedLessons / allLessons.length) * 100) : 0

  // Check if current lesson is completed
  const isLessonCompleted = progressData?.some((p) => p.lesson_id === lessonId && p.completed) || false

  // Check if course is completed
  const isCourseCompleted = progressPercentage === 100

  // Check if user has already reviewed
  const { data: existingReview } = await supabase
    .from("reviews")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single()

  // Format modules with progress
  const modulesWithProgress = modules?.map((module) => ({
    ...module,
    lessons: module.lessons
      .sort((a, b) => a.order_index - b.order_index)
      .map((l) => ({
        ...l,
        completed: progressData?.some((p) => p.lesson_id === l.id && p.completed) || false,
      })),
  }))

  return (
    <div className="flex min-h-screen">
      <CourseSidebar courseId={courseId} modules={modulesWithProgress || []} progress={progressPercentage} />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Link>
          </Button>

          <div className="text-sm text-muted-foreground">
            <Link href={`/courses/${courseId}`} className="hover:text-foreground">
              {course?.title}
            </Link>
          </div>

          <LessonContent
            lesson={lesson}
            isCompleted={isLessonCompleted}
            userId={user.id}
            onComplete={() => {
              // Refresh the page to update progress
              window.location.reload()
            }}
          />

          {isCourseCompleted && !existingReview && (
            <ReviewForm
              courseId={courseId}
              userId={user.id}
              onReviewSubmitted={() => {
                window.location.reload()
              }}
            />
          )}
        </div>
      </main>
    </div>
  )
}
