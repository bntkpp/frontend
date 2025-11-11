"use client"

import { useMemo, type ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, FileText, Headphones, PlayCircle } from "lucide-react"
import { PDFViewerSimple } from "@/components/pdf-viewer-simple"

interface LessonCapsule {
  id?: string
  type: "video" | "text" | "pdf" | "audio"
  title?: string | null
  description?: string | null
  url?: string | null
  content?: string | null
}

interface LessonContentProps {
  lesson: {
    id: string
    title: string
    content: string | null
    video_url: string | null
    lesson_type: string
    capsules?: LessonCapsule[] | string | null
    summary?: string | null
  }
  isCompleted: boolean
  isMarking: boolean
  onMarkComplete: () => void
  previousLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
  onNavigatePrevious?: () => void
  onNavigateNext?: () => void
  isCourseCompleted?: boolean
  hasExistingReview?: boolean
  courseId?: string
  userId?: string
  onReviewSubmitted?: () => void
}

const capsuleTypeLabel: Record<LessonCapsule["type"], string> = {
  video: "Video",
  text: "Lectura",
  pdf: "Documento",
  audio: "Audio",
}

const capsuleIcons: Record<LessonCapsule["type"], ComponentType<{ className?: string }>> = {
  video: PlayCircle,
  text: FileText,
  pdf: FileText,
  audio: Headphones,
}

function parseCapsules(lesson: LessonContentProps["lesson"]): LessonCapsule[] {
  if (Array.isArray(lesson.capsules)) {
    return lesson.capsules as LessonCapsule[]
  }

  if (typeof lesson.capsules === "string") {
    try {
      const parsed = JSON.parse(lesson.capsules) as LessonCapsule[]
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch (error) {
      console.warn("No se pudo parsear el campo capsules de la lección", error)
    }
  }

  const fallbackCapsules: LessonCapsule[] = []

  if (lesson.video_url) {
    // Detectar si es PDF
    if (lesson.video_url.toLowerCase().endsWith('.pdf')) {
      fallbackCapsules.push({
        id: `${lesson.id}-pdf`,
        type: "pdf",
        url: lesson.video_url,
        title: lesson.title,
      })
    } else {
      // Es video
      fallbackCapsules.push({
        id: `${lesson.id}-video`,
        type: "video",
        url: lesson.video_url,
        title: lesson.title,
      })
    }
  }

  if (lesson.content) {
    fallbackCapsules.push({
      id: `${lesson.id}-text`,
      type: "text",
      content: lesson.content,
      title: "Transcripción",
    })
  }

  return fallbackCapsules
}

export function LessonContent({
  lesson,
  isCompleted,
  isMarking,
  onMarkComplete,
  previousLesson,
  nextLesson,
  onNavigatePrevious,
  onNavigateNext,
}: LessonContentProps) {
  const capsules = useMemo(() => parseCapsules(lesson), [lesson])

  const hasCapsules = capsules.length > 0

  const renderCapsule = (capsule: LessonCapsule) => {
    switch (capsule.type) {
      case "video":
        return (
          <div className="w-full bg-black rounded-lg overflow-hidden">
            {capsule.url ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={capsule.url}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex items-center justify-center bg-muted" style={{ paddingBottom: '56.25%', position: 'relative' }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Video no disponible</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      case "pdf":
        return capsule.url ? (
          <PDFViewerSimple url={capsule.url} />
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Documento no disponible
          </div>
        )
      case "audio":
        return capsule.url ? (
          <audio controls className="w-full">
            <source src={capsule.url} />
          </audio>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Audio no disponible
          </div>
        )
      case "text":
      default:
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="leading-relaxed whitespace-pre-wrap">{capsule.content}</p>
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Contenido principal - PDF o Video ocupando todo el espacio */}
      {hasCapsules && capsules.some(c => c.type === "pdf") && (
        <div className="flex-1 w-full overflow-hidden">
          {capsules
            .filter(c => c.type === "pdf")
            .map((capsule) => (
              <div key={capsule.id || `${lesson.id}-${capsule.type}`} className="w-full h-full">
                {capsule.url && <PDFViewerSimple url={capsule.url} />}
              </div>
            ))}
        </div>
      )}

      {/* Si tiene video */}
      {hasCapsules && !capsules.some(c => c.type === "pdf") && capsules.some(c => c.type === "video") && (
        <div className="flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
          {capsules
            .filter(c => c.type === "video")
            .map((capsule) => (
              <div key={capsule.id || `${lesson.id}-video`} className="w-full max-w-6xl px-4">
                {renderCapsule(capsule)}
              </div>
            ))}
        </div>
      )}

      {/* Fallback para video_url directo */}
      {!hasCapsules && lesson.video_url && lesson.video_url.toLowerCase().endsWith('.pdf') && (
        <div className="flex-1 w-full overflow-hidden">
          <PDFViewerSimple url={lesson.video_url} />
        </div>
      )}

      {!hasCapsules && lesson.video_url && (lesson.video_url.includes('youtube') || lesson.video_url.includes('vimeo')) && (
        <div className="flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-6xl px-4">
            <div className="w-full bg-black rounded-lg overflow-hidden">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={lesson.video_url}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de navegación principales - estilo Paidek */}
      <div className="flex-shrink-0 border-t bg-background">
        <div className="px-6 py-4 flex items-center justify-center gap-4 max-w-4xl mx-auto">
          <Button
            variant="outline"
            disabled={!previousLesson}
            onClick={onNavigatePrevious}
            size="lg"
            className="min-w-[140px]"
          >
            ← ANTERIOR
          </Button>
          
          <Button
            variant={isCompleted ? "outline" : "default"}
            disabled={isMarking || isCompleted}
            onClick={onMarkComplete}
            size="lg"
            className="min-w-[180px]"
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                COMPLETADA
              </>
            ) : isMarking ? (
              "GUARDANDO..."
            ) : (
              "COMPLETAR"
            )}
          </Button>

          <Button
            disabled={!nextLesson}
            onClick={onNavigateNext}
            size="lg"
            className="min-w-[140px]"
          >
            SIGUIENTE →
          </Button>
        </div>
      </div>
    </div>
  )
}