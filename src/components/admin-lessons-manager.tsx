"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Pencil, Plus, Trash2, Video, FileText, Dumbbell } from "lucide-react"
import { useRouter } from "next/navigation" // ← AGREGAR

interface ModuleOption {
  id: string
  title: string
  course_id?: string
  courses?: {
    title?: string
  } | null
}

export interface LessonWithModule {
  id: string
  title: string
  lesson_type: string
  module_id: string
  order_index: number | null
  duration_minutes: number | null
  video_url: string | null
  content: string | null
  created_at?: string | null
  modules?: ModuleOption | null
}

interface AdminLessonsManagerProps {
  initialLessons: LessonWithModule[]
  modules: ModuleOption[]
}

const lessonTypeOptions = [
  { value: "video", label: "Video", icon: Video },
  { value: "reading", label: "Lectura", icon: FileText },
  { value: "exercise", label: "Ejercicio", icon: Dumbbell },
]

export function AdminLessonsManager({ initialLessons, modules }: AdminLessonsManagerProps) {
  const [lessons, setLessons] = useState(initialLessons)
  const router = useRouter() // ← AGREGAR
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const defaultModuleId = useMemo(() => modules[0]?.id ?? "", [modules])

  const [formState, setFormState] = useState({
    title: "",
    lessonType: lessonTypeOptions[0]?.value || "video",
    moduleId: defaultModuleId,
    orderIndex: "",
    duration: "",
    videoUrl: "",
    content: "",
  })

  const resetForm = () => {
    setFormState({
      title: "",
      lessonType: lessonTypeOptions[0]?.value || "video",
      moduleId: defaultModuleId,
      orderIndex: "",
      duration: "",
      videoUrl: "",
      content: "",
    })
  }

  const handleCreateLesson = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)
    const supabase = createClient()

    const payload = {
      title: formState.title,
      lesson_type: formState.lessonType,
      module_id: formState.moduleId,
      order_index: formState.orderIndex ? Number(formState.orderIndex) : null,
      duration_minutes: formState.duration ? Number(formState.duration) : null,
      video_url: formState.videoUrl || null,
      content: formState.content || null,
    }

    const { data, error } = await supabase
      .from("lessons")
      .insert(payload)
      .select("*, modules(id, title, courses(title))")
      .single()

    setIsCreating(false)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al crear la lección",
        description: error.message,
      })
      return
    }

    if (data) {
      setLessons((prev) => [data, ...prev])
      router.refresh() // ← AGREGAR
      toast({
        title: "Lección creada",
        description: `Se agregó "${data.title}" al módulo correctamente.`,
      })
      resetForm()
    }
  }

  const handleLessonUpdated = (lesson: LessonWithModule) => {
    setLessons((prev) => prev.map((item) => (item.id === lesson.id ? lesson : item)))
    router.refresh() // ← AGREGAR
    toast({ title: "Lección actualizada exitosamente" })
  }

  const handleLessonDeleted = (lessonId: string) => {
    setLessons((prev) => prev.filter((item) => item.id !== lessonId))
    router.refresh() // ← AGREGAR
    toast({ title: "Lección eliminada exitosamente" })
  }

  return (
    <Tabs defaultValue="list" className="space-y-4">
      <TabsList>
        <TabsTrigger value="list">Listado</TabsTrigger>
        <TabsTrigger value="create">Crear</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        <Card>
          <CardHeader>
            <CardTitle>Lecciones registradas</CardTitle>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay lecciones creadas.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead className="hidden md:table-cell">Orden</TableHead>
                      <TableHead className="hidden md:table-cell">Duración</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lessons.map((lesson) => {
                      const typeInfo = lessonTypeOptions.find((option) => option.value === lesson.lesson_type)
                      const TypeIcon = typeInfo?.icon
                      return (
                        <TableRow key={lesson.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{lesson.title}</p>
                              {lesson.content && (
                                <p className="text-xs text-muted-foreground line-clamp-2">{lesson.content}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {TypeIcon && <TypeIcon className="h-4 w-4 text-muted-foreground" />}
                              <Badge variant="outline">{typeInfo?.label || lesson.lesson_type}</Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p>{lesson.modules?.title || "Sin módulo"}</p>
                              {lesson.modules?.courses?.title && (
                                <p className="text-xs text-muted-foreground">{lesson.modules.courses.title}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{lesson.order_index ?? "-"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {lesson.duration_minutes ? `${lesson.duration_minutes} min` : "-"}
                          </TableCell>
                          <TableCell className="text-right flex items-center justify-end gap-2">
                            <EditLessonDialog lesson={lesson} modules={modules} onUpdated={handleLessonUpdated} />
                            <DeleteLessonDialog lesson={lesson} onDeleted={handleLessonDeleted} />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Crear nueva lección</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lesson-title">Título</Label>
                <Input
                  id="lesson-title"
                  value={formState.title}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  placeholder="Introduce el título de la lección"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-module">Módulo</Label>
                  <select
                    id="lesson-module"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formState.moduleId}
                    onChange={(event) => setFormState((prev) => ({ ...prev, moduleId: event.target.value }))}
                    required
                  >
                    <option value="" disabled>
                      Selecciona un módulo
                    </option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title} {module.courses?.title ? `- ${module.courses.title}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-type">Tipo de lección</Label>
                  <select
                    id="lesson-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    value={formState.lessonType}
                    onChange={(event) => setFormState((prev) => ({ ...prev, lessonType: event.target.value }))}
                    required
                  >
                    {lessonTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-order">Orden</Label>
                  <Input
                    id="lesson-order"
                    type="number"
                    value={formState.orderIndex}
                    onChange={(event) => setFormState((prev) => ({ ...prev, orderIndex: event.target.value }))}
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lesson-duration">Duración (min)</Label>
                  <Input
                    id="lesson-duration"
                    type="number"
                    value={formState.duration}
                    onChange={(event) => setFormState((prev) => ({ ...prev, duration: event.target.value }))}
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-video">URL del video</Label>
                <Input
                  id="lesson-video"
                  value={formState.videoUrl}
                  onChange={(event) => setFormState((prev) => ({ ...prev, videoUrl: event.target.value }))}
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lesson-content">Contenido</Label>
                <Textarea
                  id="lesson-content"
                  value={formState.content}
                  onChange={(event) => setFormState((prev) => ({ ...prev, content: event.target.value }))}
                  placeholder="Contenido textual de apoyo"
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" /> Crear lección
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

function EditLessonDialog({
  lesson,
  modules,
  onUpdated,
}: {
  lesson: LessonWithModule
  modules: ModuleOption[]
  onUpdated: (lesson: LessonWithModule) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const [state, setState] = useState({
    title: lesson.title,
    lessonType: lesson.lesson_type,
    moduleId: lesson.module_id,
    orderIndex: lesson.order_index?.toString() || "",
    duration: lesson.duration_minutes?.toString() || "",
    videoUrl: lesson.video_url || "",
    content: lesson.content || "",
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    const supabase = createClient()

    const payload = {
      title: state.title,
      lesson_type: state.lessonType,
      module_id: state.moduleId,
      order_index: state.orderIndex ? Number(state.orderIndex) : null,
      duration_minutes: state.duration ? Number(state.duration) : null,
      video_url: state.videoUrl || null,
      content: state.content || null,
    }

    const { data, error } = await supabase
      .from("lessons")
      .update(payload)
      .eq("id", lesson.id)
      .select("*, modules(id, title, courses(title))")
      .single()

    setIsSaving(false)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message,
      })
      return
    }

    if (data) {
      onUpdated(data)
      toast({
        title: "Lección actualizada",
        description: "Los cambios se guardaron correctamente.",
      })
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" /> Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar lección</DialogTitle>
          <DialogDescription>Modifica el contenido y los metadatos de la lección seleccionada.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`edit-lesson-title-${lesson.id}`}>Título</Label>
            <Input
              id={`edit-lesson-title-${lesson.id}`}
              value={state.title}
              onChange={(event) => setState((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-lesson-module-${lesson.id}`}>Módulo</Label>
              <select
                id={`edit-lesson-module-${lesson.id}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={state.moduleId}
                onChange={(event) => setState((prev) => ({ ...prev, moduleId: event.target.value }))}
                required
              >
                {modules.map((moduleOption) => (
                  <option key={moduleOption.id} value={moduleOption.id}>
                    {moduleOption.title} {moduleOption.courses?.title ? `- ${moduleOption.courses.title}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-lesson-type-${lesson.id}`}>Tipo</Label>
              <select
                id={`edit-lesson-type-${lesson.id}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                value={state.lessonType}
                onChange={(event) => setState((prev) => ({ ...prev, lessonType: event.target.value }))}
                required
              >
                {lessonTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`edit-lesson-order-${lesson.id}`}>Orden</Label>
              <Input
                id={`edit-lesson-order-${lesson.id}`}
                type="number"
                value={state.orderIndex}
                onChange={(event) => setState((prev) => ({ ...prev, orderIndex: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`edit-lesson-duration-${lesson.id}`}>Duración (min)</Label>
              <Input
                id={`edit-lesson-duration-${lesson.id}`}
                type="number"
                value={state.duration}
                onChange={(event) => setState((prev) => ({ ...prev, duration: event.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-lesson-video-${lesson.id}`}>URL del video</Label>
            <Input
              id={`edit-lesson-video-${lesson.id}`}
              value={state.videoUrl}
              onChange={(event) => setState((prev) => ({ ...prev, videoUrl: event.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`edit-lesson-content-${lesson.id}`}>Contenido</Label>
            <Textarea
              id={`edit-lesson-content-${lesson.id}`}
              value={state.content}
              onChange={(event) => setState((prev) => ({ ...prev, content: event.target.value }))}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />} Guardar cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function DeleteLessonDialog({
  lesson,
  onDeleted,
}: {
  lesson: LessonWithModule
  onDeleted: (lessonId: string) => void
}) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from("lessons").delete().eq("id", lesson.id)
    setIsDeleting(false)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      })
      return
    }

    onDeleted(lesson.id)
    toast({
      title: "Lección eliminada",
      description: `Se eliminó "${lesson.title}" correctamente.`,
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="mr-1 h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar esta lección?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará la lección "{lesson.title}" de forma permanente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}