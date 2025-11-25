"use client"

import { useMemo, type ComponentType } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, FileText, Headphones, PlayCircle } from "lucide-react"
import { PDFViewerSimple } from "@/components/pdf-viewer-simple"

// Función para convertir texto enriquecido a HTML
function formatRichText(text: string): string {
  let formatted = text
  
  // URLs (debe ir primero para no interferir con otros formatos)
  formatted = formatted.replace(
    /(https?:\/\/[^\s<]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary underline hover:text-primary/80">$1</a>'
  )
  
  // Negritas **texto** o __texto__
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Cursivas *texto* o _texto_
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>')
  formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Tachado ~~texto~~
  formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>')
  
  // Títulos
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-3">$1</h3>')
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-4">$1</h2>')
  formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-10 mb-5">$1</h1>')
  
  // Listas numeradas
  formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-6">$1</li>')
  formatted = formatted.replace(/(<li class="ml-6">.*<\/li>\n?)+/g, '<ol class="list-decimal ml-4 space-y-2 my-4">$&</ol>')
  
  // Listas con viñetas
  formatted = formatted.replace(/^[-•]\s+(.+)$/gm, '<li class="ml-6">$1</li>')
  formatted = formatted.replace(/(<li class="ml-6">.*<\/li>\n?)+/g, match => {
    if (!match.includes('list-decimal')) {
      return `<ul class="list-disc ml-4 space-y-2 my-4">${match}</ul>`
    }
    return match
  })
  
  // Saltos de línea
  formatted = formatted.replace(/\n/g, '<br />')
  
  return formatted
}

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
    content_title?: string | null
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
      title: lesson.content_title || null,
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
          <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-a:text-primary prose-a:underline prose-strong:font-bold">
            <div 
              className="leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatRichText(capsule.content || '') 
              }}
            />
          </div>
        )
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* Contenido principal - PDF ocupando todo el espacio */}
      {hasCapsules && capsules.some(c => c.type === "pdf") && (
        <div className="flex-1 w-full overflow-hidden min-h-0">
          {capsules
            .filter(c => c.type === "pdf")
            .map((capsule) => (
              <div key={capsule.id || `${lesson.id}-${capsule.type}`} className="w-full h-full">
                {capsule.url && <PDFViewerSimple url={capsule.url} />}
              </div>
            ))}
        </div>
      )}

      {/* Si tiene video - centrado con fondo negro */}
      {hasCapsules && !capsules.some(c => c.type === "pdf") && capsules.some(c => c.type === "video") && (
        <div className="flex-1 w-full overflow-y-auto min-h-0">
          <div className="min-h-full bg-black flex items-center justify-center p-4 md:p-8">
            {capsules
              .filter(c => c.type === "video")
              .map((capsule) => (
                <div key={capsule.id || `${lesson.id}-video`} className="w-full max-w-5xl">
                  {renderCapsule(capsule)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Si tiene texto - área scrolleable con padding */}
      {hasCapsules && !capsules.some(c => c.type === "pdf") && !capsules.some(c => c.type === "video") && capsules.some(c => c.type === "text") && (
        <div className="flex-1 w-full overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {capsules
              .filter(c => c.type === "text")
              .map((capsule) => (
                <div key={capsule.id || `${lesson.id}-text`}>
                  {capsule.title && (
                    <h2 className="text-2xl md:text-3xl font-bold mb-6">{capsule.title}</h2>
                  )}
                  {renderCapsule(capsule)}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Fallback para video_url directo */}
      {!hasCapsules && lesson.video_url && lesson.video_url.toLowerCase().endsWith('.pdf') && (
        <div className="flex-1 w-full overflow-hidden min-h-0">
          <PDFViewerSimple url={lesson.video_url} />
        </div>
      )}

      {!hasCapsules && lesson.video_url && (lesson.video_url.includes('youtube') || lesson.video_url.includes('vimeo')) && (
        <div className="flex-1 w-full overflow-y-auto min-h-0">
          <div className="min-h-full bg-black flex items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-5xl">
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
        </div>
      )}

      {/* Si tiene contenido de texto en lesson.content */}
      {!hasCapsules && lesson.content && (
        <div className="flex-1 w-full overflow-y-auto min-h-0">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8">
            <div className="prose prose-base max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-a:text-primary prose-a:underline prose-strong:font-bold">
              <div 
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ 
                  __html: lesson.content.replace(/\n/g, '<br />') 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Botones de navegación principales - mejorados para móvil */}
      <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur-sm sticky bottom-0 z-40">
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          {/* Versión móvil - Botones apilados */}
          <div className="flex md:hidden flex-col gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!previousLesson}
                onClick={onNavigatePrevious}
                size="sm"
                className="flex-1"
              >
                ← ANTERIOR
              </Button>
              <Button
                disabled={!nextLesson}
                onClick={onNavigateNext}
                size="sm"
                className="flex-1"
              >
                SIGUIENTE →
              </Button>
            </div>
            <Button
              variant={isCompleted ? "outline" : "default"}
              disabled={isMarking || isCompleted}
              onClick={onMarkComplete}
              size="sm"
              className="w-full"
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  COMPLETADA
                </>
              ) : isMarking ? (
                "GUARDANDO..."
              ) : (
                "COMPLETAR LECCIÓN"
              )}
            </Button>
          </div>

          {/* Versión desktop - Botones en línea */}
          <div className="hidden md:flex items-center justify-center gap-4 max-w-4xl mx-auto">
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
    </div>
  )
}