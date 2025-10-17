"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    content: string | null
    video_url: string | null
    lesson_type: string
  }
  isCompleted: boolean
  userId: string
  onComplete: () => void
}

export function LessonContent({ lesson, isCompleted, userId, onComplete }: LessonContentProps) {
  const [isMarking, setIsMarking] = useState(false)

  const handleMarkComplete = async () => {
    setIsMarking(true)
    const supabase = createClient()

    // Insert or update progress
    const { error } = await supabase.from("progress").upsert(
      {
        user_id: userId,
        lesson_id: lesson.id,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,lesson_id",
      },
    )

    if (!error) {
      onComplete()
    }

    setIsMarking(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <div className="flex items-center gap-1 text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" />
              <span>Completada</span>
            </div>
          )}
        </div>
      </div>

      {lesson.video_url && (
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-video w-full">
              <iframe
                src={lesson.video_url}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </CardContent>
        </Card>
      )}

      {lesson.content && (
        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="leading-relaxed whitespace-pre-wrap">{lesson.content}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {lesson.lesson_type === "exercise" && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Ejercicios Prácticos</h3>
              <p className="text-muted-foreground leading-relaxed">
                Completa los ejercicios propuestos en tu cuaderno y verifica tus respuestas con las soluciones
                proporcionadas.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isCompleted && (
        <Button onClick={handleMarkComplete} disabled={isMarking} size="lg">
          {isMarking ? "Marcando..." : "Marcar como Completada"}
        </Button>
      )}
    </div>
  )
}
