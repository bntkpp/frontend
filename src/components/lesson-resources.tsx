"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

export interface LessonResource {
  title: string
  url?: string | null
  description?: string | null
  type?: string | null
}

interface LessonResourcesProps {
  resources: LessonResource[]
}

function decodeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  
  try {
    // Decodificar HTML entities y URL encoding
    const decoded = url
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/%3E/g, '>')
      .replace(/%3C/g, '<')
      .replace(/<em>/g, '')
      .replace(/<\/em>/g, '')
    
    return decoded
  } catch (error) {
    console.warn('Error decoding URL:', error)
    return url
  }
}

export function LessonResources({ resources }: LessonResourcesProps) {
  if (!resources || resources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recursos complementarios</CardTitle>
          <CardDescription>
            A medida que avancemos, aquí aparecerán lecturas, descargas y enlaces recomendados.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recursos complementarios</CardTitle>
        <CardDescription>Explora materiales adicionales para profundizar en la lección.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource, index) => {
          const cleanUrl = decodeUrl(resource.url)
          return (
            <a
              key={`${resource.title}-${index}`}
              href={cleanUrl}
              target={cleanUrl ? "_blank" : undefined}
              rel={cleanUrl ? "noopener noreferrer" : undefined}
              className="block rounded-lg border border-border p-4 transition-colors hover:border-primary"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{resource.title}</span>
                    {resource.description && (
                      <span className="text-xs text-muted-foreground">{resource.description}</span>
                    )}
                  </div>
                  {resource.type && <Badge variant="secondary">{resource.type}</Badge>}
                </div>
                {cleanUrl && (
                  <span className="flex items-center gap-1 text-xs text-primary">
                    Abrir recurso
                    <ExternalLink className="h-3 w-3" />
                  </span>
                )}
              </div>
            </a>
          )
        })}
      </CardContent>
    </Card>
  )
}