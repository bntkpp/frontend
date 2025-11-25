"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { 
  BookOpen, 
  ChevronDown, 
  ChevronRight, 
  Plus, 
  Pencil, 
  Trash2,
  Video,
  FileText,
  File,
  Dumbbell,
  GripVertical
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Course {
  id: string
  title: string
}

interface Lesson {
  id: string
  title: string
  lesson_type: string
  order_index: number
  duration_minutes: number | null
  content: string | null
}

interface Module {
  id: string
  title: string
  description: string | null
  order_index: number
  course_id: string
  lessons: Lesson[]
}

interface CourseWithModules extends Course {
  modules: Module[]
}

interface AdminCourseStructureProps {
  courses: CourseWithModules[]
}

const lessonTypeOptions = [
  { value: "video", label: "Video", icon: Video },
  { value: "reading", label: "Lectura", icon: FileText },
  { value: "pdf", label: "PDF", icon: File },
  { value: "exercise", label: "Ejercicio", icon: Dumbbell },
]

export function AdminCourseStructure({ courses }: AdminCourseStructureProps) {
  const [openCourses, setOpenCourses] = useState<Set<string>>(new Set())
  const [openModules, setOpenModules] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const toggleCourse = (courseId: string) => {
    const newOpen = new Set(openCourses)
    if (newOpen.has(courseId)) {
      newOpen.delete(courseId)
    } else {
      newOpen.add(courseId)
    }
    setOpenCourses(newOpen)
  }

  const toggleModule = (moduleId: string) => {
    const newOpen = new Set(openModules)
    if (newOpen.has(moduleId)) {
      newOpen.delete(moduleId)
    } else {
      newOpen.add(moduleId)
    }
    setOpenModules(newOpen)
  }

  const expandAll = () => {
    const allCourseIds = courses.map(c => c.id)
    const allModuleIds = courses.flatMap(c => c.modules.map(m => m.id))
    setOpenCourses(new Set(allCourseIds))
    setOpenModules(new Set(allModuleIds))
  }

  const collapseAll = () => {
    setOpenCourses(new Set())
    setOpenModules(new Set())
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Estructura de Cursos</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expandir Todo
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Colapsar Todo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {courses.map((course) => (
            <div key={course.id} className="border rounded-lg">
              {/* Curso */}
              <div className="bg-muted/30">
                <button
                  onClick={() => toggleCourse(course.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {openCourses.has(course.id) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold">{course.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {course.modules.length} módulo{course.modules.length !== 1 ? 's' : ''} • {' '}
                        {course.modules.reduce((sum, m) => sum + m.lessons.length, 0)} lección{course.modules.reduce((sum, m) => sum + m.lessons.length, 0) !== 1 ? 'es' : ''}
                      </p>
                    </div>
                  </div>
                  <CreateModuleDialog courseId={course.id} courseTitle={course.title} onCreated={() => router.refresh()} />
                </button>
              </div>

              {/* Módulos del Curso */}
              {openCourses.has(course.id) && (
                <div className="p-2 space-y-2">
                  {course.modules.length === 0 ? (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No hay módulos en este curso
                    </div>
                  ) : (
                    course.modules.map((module) => (
                      <div key={module.id} className="border rounded-md bg-background">
                        {/* Módulo */}
                        <div className="bg-muted/20">
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {openModules.has(module.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <div className="text-left flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{module.title}</span>
                                  <Badge variant="secondary" className="text-xs">
                                    Orden: {module.order_index}
                                  </Badge>
                                </div>
                                {module.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">{module.description}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {module.lessons.length} lección{module.lessons.length !== 1 ? 'es' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <CreateLessonDialog moduleId={module.id} moduleTitle={module.title} onCreated={() => router.refresh()} />
                              <EditModuleDialog module={module} onUpdated={() => router.refresh()} />
                              <DeleteModuleDialog module={module} onDeleted={() => router.refresh()} />
                            </div>
                          </button>
                        </div>

                        {/* Lecciones del Módulo */}
                        {openModules.has(module.id) && (
                          <div className="p-2 space-y-1">
                            {module.lessons.length === 0 ? (
                              <div className="text-center py-4 text-xs text-muted-foreground">
                                No hay lecciones en este módulo
                              </div>
                            ) : (
                              module.lessons
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((lesson) => {
                                  const typeInfo = lessonTypeOptions.find(opt => opt.value === lesson.lesson_type)
                                  const TypeIcon = typeInfo?.icon || FileText
                                  return (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 group"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <GripVertical className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{lesson.title}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {lesson.order_index}
                                        </Badge>
                                        {lesson.duration_minutes && (
                                          <span className="text-xs text-muted-foreground">
                                            {lesson.duration_minutes} min
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <EditLessonDialog lesson={lesson} moduleId={module.id} onUpdated={() => router.refresh()} />
                                        <DeleteLessonDialog lesson={lesson} onDeleted={() => router.refresh()} />
                                      </div>
                                    </div>
                                  )
                                })
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Dialogs para crear/editar/eliminar módulos
function CreateModuleDialog({ courseId, courseTitle, onCreated }: { courseId: string, courseTitle: string, onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nextOrderIndex, setNextOrderIndex] = useState(1)
  const [formData, setFormData] = useState({ title: "", description: "" })
  const { toast } = useToast()
  const supabase = createClient()

  // Calcular el siguiente order_index cuando se abre el diálogo
  const fetchNextOrderIndex = async () => {
    const { data: modules } = await supabase
      .from("modules")
      .select("order_index")
      .eq("course_id", courseId)
      .order("order_index", { ascending: false })
      .limit(1)

    const maxOrder = modules?.[0]?.order_index || 0
    setNextOrderIndex(maxOrder + 1)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      fetchNextOrderIndex()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("modules").insert({
        title: formData.title,
        description: formData.description || null,
        order_index: nextOrderIndex,
        course_id: courseId,
      })

      if (error) throw error

      toast({ description: "Módulo creado exitosamente" })
      setOpen(false)
      setFormData({ title: "", description: "" })
      onCreated()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al crear el módulo" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" />
          Agregar Módulo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Módulo</DialogTitle>
            <DialogDescription>Curso: {courseTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={nextOrderIndex}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Se asigna automáticamente
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando..." : "Crear Módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditModuleDialog({ module, onUpdated }: { module: Module, onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ 
    title: module.title, 
    description: module.description || "", 
    order_index: module.order_index 
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("modules")
        .update({
          title: formData.title,
          description: formData.description || null,
          order_index: formData.order_index,
        })
        .eq("id", module.id)

      if (error) throw error

      toast({ description: "Módulo actualizado exitosamente" })
      setOpen(false)
      onUpdated()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al actualizar el módulo" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteModuleDialog({ module, onDeleted }: { module: Module, onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("modules").delete().eq("id", module.id)

      if (error) throw error

      toast({ description: "Módulo eliminado exitosamente" })
      setOpen(false)
      onDeleted()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al eliminar el módulo" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Módulo</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de eliminar "{module.title}"? Esta acción también eliminará todas sus lecciones.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Dialogs para lecciones (simplificados, puedes expandirlos con todos los campos)
function CreateLessonDialog({ moduleId, moduleTitle, onCreated }: { moduleId: string, moduleTitle: string, onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingPDF, setIsUploadingPDF] = useState(false)
  const [nextOrderIndex, setNextOrderIndex] = useState(1)
  const [formData, setFormData] = useState({ 
    title: "", 
    lesson_type: "video",
    duration_minutes: null as number | null,
    video_url: "",
    content: "",
    content_title: "",
  })
  const { toast } = useToast()
  const supabase = createClient()

  // Calcular el siguiente order_index cuando se abre el diálogo
  const fetchNextOrderIndex = async () => {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: false })
      .limit(1)

    const maxOrder = lessons?.[0]?.order_index || 0
    setNextOrderIndex(maxOrder + 1)
  }

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      fetchNextOrderIndex()
    }
  }

  const handlePDFUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes('pdf')) {
      toast({ variant: "destructive", description: "Solo se permiten archivos PDF" })
      return
    }

    setIsUploadingPDF(true)
    try {
      const fileExt = 'pdf'
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `lessons/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath)

      setFormData({ ...formData, video_url: publicUrl })
      toast({ description: "PDF subido exitosamente" })
    } catch (error) {
      toast({ variant: "destructive", description: "Error al subir el PDF" })
    } finally {
      setIsUploadingPDF(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.from("lessons").insert({
        title: formData.title,
        lesson_type: formData.lesson_type,
        order_index: nextOrderIndex,
        duration_minutes: formData.duration_minutes,
        video_url: formData.video_url || null,
        content: formData.content || null,
        content_title: formData.content_title || null,
        module_id: moduleId,
      })

      if (error) throw error

      toast({ description: "Lección creada exitosamente" })
      setOpen(false)
      setFormData({ title: "", lesson_type: "video", duration_minutes: null, video_url: "", content: "", content_title: "" })
      onCreated()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al crear la lección" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button size="sm" variant="ghost">
          <Plus className="h-3 w-3 mr-1" />
          Lección
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Lección</DialogTitle>
            <DialogDescription>Módulo: {moduleTitle}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select value={formData.lesson_type} onValueChange={(v) => setFormData({ ...formData, lesson_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={nextOrderIndex}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Se asigna automáticamente
                </p>
              </div>
            </div>
            <div>
              <Label>Duración (minutos)</Label>
              <Input
                type="number"
                value={formData.duration_minutes || ""}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value ? parseInt(e.target.value) : null })}
                min={0}
              />
            </div>

            {/* Campos específicos según el tipo */}
            {formData.lesson_type === "video" && (
              <div>
                <Label>URL del Video *</Label>
                <Input
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/embed/..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL embebida de YouTube, Vimeo, etc.
                </p>
              </div>
            )}

            {formData.lesson_type === "pdf" && (
              <div className="space-y-3">
                <div>
                  <Label>Subir PDF</Label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={handlePDFUpload}
                    disabled={isUploadingPDF}
                  />
                  {isUploadingPDF && (
                    <p className="text-xs text-muted-foreground mt-1">Subiendo PDF...</p>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">O</span>
                  </div>
                </div>
                <div>
                  <Label>URL del PDF</Label>
                  <Input
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Si ya tienes el PDF alojado en otro lugar
                  </p>
                </div>
              </div>
            )}

            {formData.lesson_type === "reading" && (
              <div className="space-y-3">
                <div>
                  <Label>Título del Contenido (opcional)</Label>
                  <Input
                    value={formData.content_title}
                    onChange={(e) => setFormData({ ...formData, content_title: e.target.value })}
                    placeholder="Ej: Introducción al tema, Conceptos básicos, etc."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Si no agregas un título, no se mostrará ningún encabezado
                  </p>
                </div>
                <div>
                  <Label>Contenido *</Label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Escribe el contenido de la lección aquí..."
                    rows={10}
                    required
                  />
                </div>
              </div>
            )}

            {formData.lesson_type === "exercise" && (
              <div>
                <Label>Instrucciones del Ejercicio</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Describe el ejercicio que los estudiantes deben completar..."
                  rows={6}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isUploadingPDF}>
              {isLoading ? "Creando..." : "Crear Lección"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditLessonDialog({ lesson, moduleId, onUpdated }: { lesson: Lesson, moduleId: string, onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ 
    title: lesson.title, 
    order_index: lesson.order_index,
    duration_minutes: lesson.duration_minutes,
  })
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("lessons")
        .update({
          title: formData.title,
          order_index: formData.order_index,
          duration_minutes: formData.duration_minutes,
        })
        .eq("id", lesson.id)

      if (error) throw error

      toast({ description: "Lección actualizada exitosamente" })
      setOpen(false)
      onUpdated()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al actualizar la lección" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Pencil className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Lección</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Orden</Label>
              <Input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <Label>Duración (minutos)</Label>
              <Input
                type="number"
                value={formData.duration_minutes || ""}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value ? parseInt(e.target.value) : null })}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteLessonDialog({ lesson, onDeleted }: { lesson: Lesson, onDeleted: () => void }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lesson.id)

      if (error) throw error

      toast({ description: "Lección eliminada exitosamente" })
      setOpen(false)
      onDeleted()
    } catch (error) {
      toast({ variant: "destructive", description: "Error al eliminar la lección" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Lección</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de eliminar "{lesson.title}"?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
            {isLoading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
