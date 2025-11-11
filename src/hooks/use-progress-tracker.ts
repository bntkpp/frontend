"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface UseProgressTrackerOptions {
  userId: string
  lessons: { id: string }[]
  initialCompletedLessonIds: string[]
}

export function useProgressTracker({
  userId,
  lessons,
  initialCompletedLessonIds,
}: UseProgressTrackerOptions) {
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set(initialCompletedLessonIds))
  const [isUpdating, setIsUpdating] = useState(false)

  const totalLessons = lessons.length

  const progress = useMemo(() => {
    if (totalLessons === 0) {
      return 0
    }
    return Math.round((completedLessonIds.size / totalLessons) * 100)
  }, [completedLessonIds, totalLessons])

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      if (completedLessonIds.has(lessonId)) {
        return
      }

      setIsUpdating(true)
      const supabase = createClient()
      const { error } = await supabase.from("progress").upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      )

      if (!error) {
        setCompletedLessonIds((current) => new Set(current).add(lessonId))
      }

      setIsUpdating(false)
    },
    [completedLessonIds, userId],
  )

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`progress-tracking-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress", filter: `user_id=eq.${userId}` },
        (payload) => {
          const newProgress = payload.new as { lesson_id?: string; completed?: boolean } | null
          const oldProgress = payload.old as { lesson_id?: string; completed?: boolean } | null

          setCompletedLessonIds((current) => {
            const next = new Set(current)

            if (newProgress?.lesson_id) {
              if (newProgress.completed) {
                next.add(newProgress.lesson_id)
              } else {
                next.delete(newProgress.lesson_id)
              }
            } else if (oldProgress?.lesson_id) {
              next.delete(oldProgress.lesson_id)
            }

            return next
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const isLessonCompleted = useCallback(
    (lessonId: string) => completedLessonIds.has(lessonId),
    [completedLessonIds],
  )

  return {
    completedLessonIds,
    progress,
    markLessonComplete,
    isUpdating,
    isLessonCompleted,
  }
}