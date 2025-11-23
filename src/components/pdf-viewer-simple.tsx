'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Download,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut
} from 'lucide-react'

interface PDFViewerSimpleProps {
  url: string
}

export function PDFViewerSimple({ url }: PDFViewerSimpleProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLCanvasElement>>(new Map())
  const controlsRef = useRef<HTMLDivElement>(null)
  const [pdfDoc, setPdfDoc] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [numPages, setNumPages] = useState(0)
  const [scale, setScale] = useState(1.5)
  const [isLoading, setIsLoading] = useState(true)
  const [renderedPages, setRenderedPages] = useState<Set<number>>(new Set())
  const [showControls, setShowControls] = useState(false)

  useEffect(() => {
    // Cargar PDF.js desde CDN
    const loadPdfJs = async () => {
      if (typeof window === 'undefined') return

      // Cargar PDF.js desde CDN
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.async = true

      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        // Cargar el documento PDF
        pdfjsLib.getDocument(url).promise.then((pdf: any) => {
          setPdfDoc(pdf)
          setNumPages(pdf.numPages)
          setIsLoading(false)
        }).catch((error: any) => {
          console.error('Error loading PDF:', error)
          setIsLoading(false)
        })
      }

      document.body.appendChild(script)
    }

    loadPdfJs()
  }, [url])

  // Renderizar todas las páginas cuando cambie el documento o el zoom
  useEffect(() => {
    if (!pdfDoc) return

    const renderAllPages = async () => {
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const canvas = pageRefs.current.get(pageNumber)
        if (!canvas) continue

        try {
          const page = await pdfDoc.getPage(pageNumber)
          const viewport = page.getViewport({ scale })

          const context = canvas.getContext('2d')
          if (!context) continue

          canvas.height = viewport.height
          canvas.width = viewport.width
          context.clearRect(0, 0, canvas.width, canvas.height)

          const renderContext = {
            canvasContext: context,
            viewport: viewport
          }

          await page.render(renderContext).promise
          setRenderedPages(prev => new Set([...prev, pageNumber]))
        } catch (error: any) {
          if (error?.name !== 'RenderingCancelledException') {
            console.error(`Error rendering page ${pageNumber}:`, error)
          }
        }
      }
    }

    renderAllPages()
  }, [pdfDoc, numPages, scale])

  // Detectar qué página está visible en el scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const containerTop = container.scrollTop
      const containerHeight = container.clientHeight
      const containerMiddle = containerTop + containerHeight / 2

      // Encontrar qué página está en el centro de la vista
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        const canvas = pageRefs.current.get(pageNumber)
        if (!canvas) continue

        const rect = canvas.getBoundingClientRect()
        const canvasTop = canvas.offsetTop
        const canvasBottom = canvasTop + canvas.offsetHeight

        if (containerMiddle >= canvasTop && containerMiddle <= canvasBottom) {
          setCurrentPage(pageNumber)
          break
        }
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [numPages])

  // Detectar cuando el mouse está cerca de la zona de controles (parte inferior)
  useEffect(() => {
    const container = containerRef.current
    const controls = controlsRef.current
    if (!container) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const mouseY = e.clientY
      const containerBottom = rect.bottom

      // Mostrar controles solo si el mouse está en los últimos 150px de la parte inferior
      const distanceFromBottom = containerBottom - mouseY
      setShowControls(distanceFromBottom <= 150 && distanceFromBottom >= 0)
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // No ocultar si el mouse se movió hacia los controles
      const controls = controlsRef.current
      if (controls && e.relatedTarget && controls.contains(e.relatedTarget as Node)) {
        return
      }
      setShowControls(false)
    }

    const handleControlsMouseLeave = () => {
      setShowControls(false)
    }

    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mouseleave', handleMouseLeave)

    if (controls) {
      controls.addEventListener('mouseleave', handleControlsMouseLeave)
    }

    return () => {
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
      if (controls) {
        controls.removeEventListener('mouseleave', handleControlsMouseLeave)
      }
    }
  }, [])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = url
    link.download = 'documento.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFullscreen = () => {
    window.open(url, '_blank')
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      const canvas = pageRefs.current.get(currentPage - 1)
      if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const goToNextPage = () => {
    if (currentPage < numPages) {
      const canvas = pageRefs.current.get(currentPage + 1)
      if (canvas) {
        canvas.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  return (
    <div
      className="relative h-full w-full bg-zinc-100 dark:bg-zinc-900 flex flex-col overflow-auto"
    >
      {/* Área de scroll vertical con todas las páginas */}
      <div
        ref={containerRef}
        className="flex-1 flex flex-col items-center gap-4 p-4 overflow-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Cargando documento...</p>
          </div>
        ) : (
          // Renderizar todas las páginas
          Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
            <canvas
              key={pageNumber}
              ref={(el) => {
                if (el) {
                  pageRefs.current.set(pageNumber, el)
                } else {
                  pageRefs.current.delete(pageNumber)
                }
              }}
              className="shadow-2xl max-w-full h-auto block"
            />
          ))
        )}
      </div>

      {/* Controles flotantes - aparecen solo cuando el mouse está cerca del fondo */}
      {!isLoading && numPages > 0 && (
        <div
          ref={controlsRef}
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          onMouseEnter={() => setShowControls(true)}
        >
          <div className="bg-primary/95 backdrop-blur-md rounded-full px-4 py-2.5 flex items-center gap-2 shadow-2xl border border-primary-foreground/10">
            {/* Navegación */}
            <Button
              variant="ghost"
              size="sm"
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-primary-foreground text-sm font-medium px-2">
              {currentPage} / {numPages}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={goToNextPage}
              disabled={currentPage >= numPages}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-primary-foreground/30 mx-1" />

            {/* Zoom */}
            <Button
              variant="ghost"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>

            <span className="text-primary-foreground text-xs font-medium px-1">
              {Math.round(scale * 100)}%
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= 3}
              className="h-8 w-8 p-0 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>

            <div className="w-px h-5 bg-primary-foreground/30 mx-1" />

            {/* Acciones */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFullscreen}
              className="h-8 px-3 text-primary-foreground hover:bg-primary-foreground/20 rounded-full"
            >
              <Maximize2 className="h-4 w-4 mr-1.5" />
              <span className="text-sm font-medium">Pantalla Completa</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
