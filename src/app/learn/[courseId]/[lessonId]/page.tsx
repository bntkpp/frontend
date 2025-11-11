import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CourseSidebar } from "@/components/course-sidebar"
import { LessonPageClient } from "@/components/lesson-page-client"

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
  const allLessons = modules?.flatMap((module) => module.lessons) || []
  const completedLessonIds = progressData?.filter((record) => record.completed).map((record) => record.lesson_id) || []
  const progressPercentage = allLessons.length > 0 ? Math.round((completedLessonIds.length / allLessons.length) * 100) : 0

  // Check if current lesson is completed
  const isLessonCompleted = progressData?.some((p) => p.lesson_id === lessonId && p.completed) || false

  // Check if course is completed
  const isCourseCompleted = allLessons.length > 0 && completedLessonIds.length === allLessons.length

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .maybeSingle()

  // Format modules with lessons
  const modulesWithLessons = modules?.map((module) => ({
    ...module,
    lessons: module.lessons
      .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
      .map((l: any) => ({
        ...l,
        completed: progressData?.some((p) => p.lesson_id === l.id && p.completed) || false,
      })),
  }))

  // Find previous and next lessons
  let previousLesson = null
  let nextLesson = null
  
  for (let i = 0; i < allLessons.length; i++) {
    if (allLessons[i].id === lessonId) {
      if (i > 0) {
        previousLesson = allLessons[i - 1]
      }
      if (i < allLessons.length - 1) {
        nextLesson = allLessons[i + 1]
      }
      break
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <CourseSidebar 
        courseId={courseId} 
        modules={modulesWithLessons || []} 
        progress={progressPercentage} 
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <LessonPageClient
          courseId={courseId}
          courseTitle={course?.title || ""}
          lesson={lesson}
          isLessonCompleted={isLessonCompleted}
          isCourseCompleted={isCourseCompleted}
          hasExistingReview={!!existingReview}
          userId={user.id}
          previousLesson={previousLesson}
          nextLesson={nextLesson}
        />
      </main>
    </div>
  )
}
