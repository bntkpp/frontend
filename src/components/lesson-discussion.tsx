"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, MessageCircle } from "lucide-react"

interface LessonDiscussionProps {
  lessonId: string
  userId: string
  userDisplayName: string
}

interface LessonComment {
  id: string
  content: string
  created_at: string
  user_id: string
  author_name?: string | null
}

export function LessonDiscussion({ lessonId, userId, userDisplayName }: LessonDiscussionProps) {
  const supabase = useMemo(() => createClient(), [])
  const { toast } = useToast()
  const [comments, setComments] = useState<LessonComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPosting, setIsPosting] = useState(false)
  const [commentText, setCommentText] = useState("")

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select("id, content, created_at, user_id, author_name")
        .eq("lesson_id", lessonId)
        .order("created_at", { ascending: false })

      if (!error && data) {
        setComments(data as LessonComment[])
      }

      setIsLoading(false)
    }

    fetchComments()
  }, [lessonId, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`lesson-comments-${lessonId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "lesson_comments", filter: `lesson_id=eq.${lessonId}` },
        (payload) => {
          const newComment = payload.new as LessonComment
          setComments((current) => [newComment, ...current])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [lessonId, supabase])

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Escribe un comentario",
        description: "Comparte tu duda o aportación antes de publicar.",
      })
      return
    }

    setIsPosting(true)
    const { error } = await supabase.from("lesson_comments").insert({
      lesson_id: lessonId,
      user_id: userId,
      content: commentText.trim(),
      author_name: userDisplayName,
    })

    if (error) {
      toast({
        title: "No se pudo publicar el comentario",
        description: "Inténtalo nuevamente en unos segundos.",
        variant: "destructive",
      })
    } else {
      setCommentText("")
    }

    setIsPosting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Conversación de la lección
        </CardTitle>
        <CardDescription>
          Formula preguntas, comparte recursos y ayuda a otros estudiantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Textarea
            placeholder="Comparte tu aporte o consulta..."
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            minLength={3}
            rows={4}
            disabled={isPosting}
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isPosting}>
              {isPosting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando comentarios...</p>}
          {!isLoading && comments.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aún no hay comentarios. ¡Sé la primera persona en iniciar la conversación!
            </p>
          )}

          {comments.map((comment) => {
            const initials = (comment.author_name || userDisplayName || "?")
              .split(" ")
              .map((chunk) => chunk[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <div key={comment.id} className="flex gap-3 rounded-lg border border-border p-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{comment.author_name || "Estudiante"}</span>
                    <time>{new Date(comment.created_at).toLocaleString()}</time>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Recuerda mantener un tono respetuoso. Las conversaciones ayudan a construir comunidad.
      </CardFooter>
    </Card>
  )
}