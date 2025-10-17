import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, BookOpen } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  id: string
  title: string
  description: string
  image_url: string | null
  price: number
  duration_hours: number | null
  level: string | null
}

const levelLabels: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
}

const levelColors: Record<string, string> = {
  beginner: "bg-accent/20 text-accent-foreground",
  intermediate: "bg-primary/20 text-primary-foreground",
  advanced: "bg-destructive/20 text-destructive-foreground",
}

export function CourseCard({ id, title, description, image_url, price, duration_hours, level }: CourseCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <img
        src={image_url || "/placeholder.svg?height=300&width=400&query=education+course"}
        alt={title}
        className="w-full h-48 object-cover"
      />
      <CardContent className="pt-6 flex-1">
        <div className="flex items-center gap-2 mb-3">
          {level && (
            <Badge variant="secondary" className={levelColors[level]}>
              {levelLabels[level]}
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-balance">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {duration_hours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration_hours}h</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>Material completo</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-2xl font-bold text-primary">${price.toLocaleString("es-AR")}</span>
        <Button asChild>
          <Link href={`/courses/${id}`}>Ver Curso</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
