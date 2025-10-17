"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface ReviewFormProps {
  courseId: string
  userId: string
  onReviewSubmitted: () => void
}

export function ReviewForm({ courseId, userId, onReviewSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError("Por favor selecciona una calificación")
      return
    }

    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { error: submitError } = await supabase.from("reviews").insert({
      user_id: userId,
      course_id: courseId,
      rating,
      comment: comment.trim() || null,
    })

    if (submitError) {
      setError("Error al enviar la reseña")
    } else {
      onReviewSubmitted()
    }

    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deja tu Reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Calificación</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "fill-accent text-accent" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="Comparte tu experiencia con este curso..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Reseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
