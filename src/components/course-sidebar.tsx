"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, PlayCircle, FileText, PenTool, File, ChevronDown, ChevronUp } from "lucide-react"
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
  reading: FileText,
  pdf: File,
  exercise: PenTool,
  quiz: PenTool,
}

export function CourseSidebar({ courseId, modules, progress }: CourseSidebarProps) {
  const pathname = usePathname()
  const [openModules, setOpenModules] = useState<Set<string>>(() => {
    // Por defecto, abrir el módulo que contiene la lección actual
    const currentModuleId = modules.find(module => 
      module.lessons.some(lesson => pathname.includes(lesson.id))
    )?.id
    return new Set(currentModuleId ? [currentModuleId] : [modules[0]?.id])
  })

  const toggleModule = (moduleId: string) => {
    setOpenModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId)
      } else {
        newSet.add(moduleId)
      }
      return newSet
    })
  }

  const getModuleProgress = (module: Module) => {
    const completedCount = module.lessons.filter(l => l.completed).length
    const totalCount = module.lessons.length
    return { completed: completedCount, total: totalCount }
  }

  return (
    <div className="w-full md:w-80 bg-muted/30 border-r border-border flex flex-col h-screen">
      {/* Header fijo */}
      <div className="p-4 border-b border-border flex-shrink-0 bg-background">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progreso del Curso</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {modules.map((module, moduleIndex) => {
            const isOpen = openModules.has(module.id)
            const moduleProgress = getModuleProgress(module)
            
            return (
              <div key={module.id} className="space-y-1">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {moduleProgress.completed}/{moduleProgress.total}
                      </span>
                      <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 text-left">
                        {module.title}
                      </h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-600 dark:text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                </button>
                
                {isOpen && (
                  <div className="space-y-1 pl-2">
                    {module.lessons.map((lesson) => {
                      const Icon = lessonIcons[lesson.lesson_type as keyof typeof lessonIcons] || FileText
                      const isActive = pathname.includes(lesson.id)

                      return (
                        <Link
                          key={lesson.id}
                          href={`/learn/${courseId}/${lesson.id}`}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-all text-sm border ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-sm"
                              : lesson.completed
                              ? "bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-foreground border-green-200 dark:border-green-800"
                              : "bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground border-border"
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="h-4 w-4 flex-shrink-0" />
                          )}
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {lesson.duration_minutes && (
                            <span className="text-xs flex-shrink-0 opacity-70">{lesson.duration_minutes}min</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
