"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, PlayCircle, FileText, PenTool } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Lesson {
  id: string
  title: string
  lesson_type: string
  duration_minutes: number | null
  completed?: boolean
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface CourseSidebarProps {
  courseId: string
  modules: Module[]
  progress: number
}

const lessonIcons = {
  video: PlayCircle,
  text: FileText,
  exercise: PenTool,
  quiz: PenTool,
}

export function CourseSidebar({ courseId, modules, progress }: CourseSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-full md:w-80 bg-card border-r border-border p-4 space-y-4 overflow-y-auto">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Progreso del Curso</span>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-4">
        {modules.map((module, moduleIndex) => (
          <Card key={module.id} className="p-4">
            <h3 className="font-semibold mb-3 text-sm">
              Módulo {moduleIndex + 1}: {module.title}
            </h3>
            <div className="space-y-2">
              {module.lessons.map((lesson) => {
                const Icon = lessonIcons[lesson.lesson_type as keyof typeof lessonIcons] || FileText
                const isActive = pathname.includes(lesson.id)

                return (
                  <Link
                    key={lesson.id}
                    href={`/learn/${courseId}/${lesson.id}`}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors text-sm ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-accent" />
                    ) : (
                      <Circle className="h-4 w-4 flex-shrink-0" />
                    )}
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1 truncate">{lesson.title}</span>
                    {lesson.duration_minutes && (
                      <span className="text-xs flex-shrink-0">{lesson.duration_minutes}min</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
