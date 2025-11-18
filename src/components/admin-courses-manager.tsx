"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCourse, updateCourse, deleteCourse } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, DollarSign, Clock, BookOpen, Video } from "lucide-react"

interface AdminCoursesManagerProps {
  initialCourses: any[]
}

export function AdminCoursesManager({ initialCourses }: AdminCoursesManagerProps) {
  const [courses, setCourses] = useState(initialCourses)
  const router = useRouter()

  const handleCourseCreated = (course: any) => {
    setCourses((prev) => [course, ...prev])
    router.refresh()
  }

  const handleCourseUpdated = (course: any) => {
    setCourses((prev) => prev.map((c) => (c.id === course.id ? course : c)))
    router.refresh()
  }

  const handleCourseDeleted = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId))
    setTimeout(() => {
      router.refresh()
      window.location.href = "/admin/courses"
    }, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="text-muted-foreground">Gestiona los cursos de la plataforma</p>
        </div>
        <CreateCourseDialog onCreated={handleCourseCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {course.short_description || course.description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <EditCourseDialog course={course} onUpdated={handleCourseUpdated} />
                  <DeleteCourseDialog course={course} onDeleted={handleCourseDeleted} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>1 mes: ${course.price_1_month?.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>4 meses: ${course.price_4_months?.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>8 meses: ${course.price_8_months?.toLocaleString("es-CL")}</span>
                </div>
                {course.duration_hours && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{course.duration_hours} horas</span>
                  </div>
                )}
                {course.video_url && (
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="text-green-600">Video añadido</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex items-center justify-between w-full">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    course.published
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }`}
                >
                  {course.published ? "Publicado" : "Borrador"}
                </span>
                {course.level && (
                  <span className="text-xs text-muted-foreground capitalize">{course.level}</span>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay cursos creados aún</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== CREATE DIALOG ====================
function CreateCourseDialog({ onCreated }: { onCreated: (course: any) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [paymentType, setPaymentType] = useState<"one_time" | "subscription">("subscription")
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)

    const formData = new FormData(event.currentTarget)

    const paymentType = formData.get("payment_type") as string

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      short_description: formData.get("short_description") as string,
      image_url: formData.get("image_url") as string,
      video_url: formData.get("video_url") as string,
      payment_type: paymentType,
      one_time_price: paymentType === "one_time" ? parseFloat(formData.get("one_time_price") as string) || null : null,
      price_1_month: paymentType === "subscription" ? parseFloat(formData.get("price_1_month") as string) || null : null,
      price_4_months: paymentType === "subscription" ? parseFloat(formData.get("price_4_months") as string) || null : null,
      price_8_months: paymentType === "subscription" ? parseFloat(formData.get("price_8_months") as string) || null : null,
      duration_hours: parseInt(formData.get("duration_hours") as string) || null,
      level: formData.get("level") as string,
      published: formData.get("published") === "on",
      has_questions_pack: formData.get("has_questions_pack") === "on",
      questions_pack_price: formData.get("has_questions_pack") === "on" ? parseFloat(formData.get("questions_pack_price") as string) || null : null,
    }

    try {
      const course = await createCourse(payload)
      onCreated(course)
      toast({
        title: "Curso creado",
        description: "El curso se creó correctamente.",
      })
      setIsOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al crear",
        description: error.message,
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Crear Curso
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Curso</DialogTitle>
          <DialogDescription>Completa los datos del nuevo curso</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="short_description">Descripción Corta</Label>
            <Input id="short_description" name="short_description" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción Completa *</Label>
            <Textarea id="description" name="description" rows={4} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">URL de Imagen</Label>
            <Input id="image_url" name="image_url" type="url" placeholder="https://ejemplo.com/imagen.jpg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">URL del Video (YouTube/Vimeo)</Label>
            <Input id="video_url" name="video_url" type="url" placeholder="https://www.youtube.com/embed/VIDEO_ID" />
            <p className="text-xs text-muted-foreground">
              Para YouTube usa: https://www.youtube.com/embed/VIDEO_ID
            </p>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Tipo de Pago</Label>
              <Select name="payment_type" value={paymentType} onValueChange={(value: "one_time" | "subscription") => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one_time">Pago Único</SelectItem>
                  <SelectItem value="subscription">Suscripción (múltiples planes)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentType === "one_time" ? (
              <div className="space-y-2">
                <Label htmlFor="one_time_price">Precio Único (CLP)</Label>
                <Input
                  id="one_time_price"
                  name="one_time_price"
                  type="number"
                  defaultValue={50000}
                  step="1000"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_1_month">Precio 1 Mes (CLP)</Label>
                  <Input
                    id="price_1_month"
                    name="price_1_month"
                    type="number"
                    defaultValue={35000}
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_4_months">Precio 4 Meses (CLP)</Label>
                  <Input
                    id="price_4_months"
                    name="price_4_months"
                    type="number"
                    defaultValue={140000}
                    step="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_8_months">Precio 8 Meses (CLP)</Label>
                  <Input
                    id="price_8_months"
                    name="price_8_months"
                    type="number"
                    defaultValue={280000}
                    step="1000"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration_hours">Duración (horas)</Label>
              <Input id="duration_hours" name="duration_hours" type="number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nivel</Label>
              <Select name="level" defaultValue="beginner">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="published" name="published" />
            <Label htmlFor="published">Publicado</Label>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="has_questions_pack" name="has_questions_pack" />
              <Label htmlFor="has_questions_pack">Ofrecer banco de preguntas adicional</Label>
            </div>

            <div className="space-y-2 ml-8">
              <Label htmlFor="questions_pack_price">Precio del Banco de Preguntas (CLP)</Label>
              <Input
                id="questions_pack_price"
                name="questions_pack_price"
                type="number"
                step="1000"
                placeholder="25000"
              />
              <p className="text-xs text-muted-foreground">
                Este precio se agregará al checkout como una opción adicional
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Curso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EDIT DIALOG ====================
function EditCourseDialog({
  course,
  onUpdated,
}: {
  course: any
  onUpdated: (course: any) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [paymentType, setPaymentType] = useState<"one_time" | "subscription">(course.payment_type || "subscription")
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)

    const currentPaymentType = formData.get("payment_type") as string

    const payload = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      short_description: formData.get("short_description") as string,
      image_url: formData.get("image_url") as string,
      video_url: formData.get("video_url") as string,
      payment_type: currentPaymentType,
      one_time_price: currentPaymentType === "one_time" ? parseFloat(formData.get("one_time_price") as string) || null : null,
      price_1_month: currentPaymentType === "subscription" ? parseFloat(formData.get("price_1_month") as string) || null : null,
      price_4_months: currentPaymentType === "subscription" ? parseFloat(formData.get("price_4_months") as string) || null : null,
      price_8_months: currentPaymentType === "subscription" ? parseFloat(formData.get("price_8_months") as string) || null : null,
      duration_hours: parseInt(formData.get("duration_hours") as string) || null,
      level: formData.get("level") as string,
      published: formData.get("published") === "on",
      has_questions_pack: formData.get("has_questions_pack") === "on",
      questions_pack_price: formData.get("has_questions_pack") === "on" ? parseFloat(formData.get("questions_pack_price") as string) || null : null,
    }

    try {
      const updatedCourse = await updateCourse(course.id, payload)
      onUpdated(updatedCourse)
      toast({
        title: "Curso actualizado",
        description: "Los cambios se guardaron correctamente.",
      })
      setIsOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al actualizar",
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
          <DialogDescription>Modifica los datos del curso</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input id="edit-title" name="title" defaultValue={course.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-short_description">Descripción Corta</Label>
            <Input
              id="edit-short_description"
              name="short_description"
              defaultValue={course.short_description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción Completa</Label>
            <Textarea
              id="edit-description"
              name="description"
              rows={4}
              defaultValue={course.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-image_url">URL de Imagen</Label>
            <Input
              id="edit-image_url"
              name="image_url"
              type="url"
              defaultValue={course.image_url || ""}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-video_url">URL del Video (YouTube/Vimeo)</Label>
            <Input
              id="edit-video_url"
              name="video_url"
              type="url"
              defaultValue={course.video_url || ""}
              placeholder="https://www.youtube.com/embed/VIDEO_ID"
            />
            <p className="text-xs text-muted-foreground">
              Para YouTube usa: https://www.youtube.com/embed/VIDEO_ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-payment_type">Tipo de Pago</Label>
            <Select 
              name="payment_type" 
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as "one_time" | "subscription")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one_time">Pago Único</SelectItem>
                <SelectItem value="subscription">Suscripción (múltiples planes)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentType === "one_time" ? (
            <div className="space-y-2">
              <Label htmlFor="edit-one_time_price">Precio (CLP)</Label>
              <Input
                id="edit-one_time_price"
                name="one_time_price"
                type="number"
                defaultValue={course.one_time_price || 35000}
                step="1000"
                required
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price_1_month">Precio 1 Mes (CLP)</Label>
                <Input
                  id="edit-price_1_month"
                  name="price_1_month"
                  type="number"
                  defaultValue={course.price_1_month || 35000}
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price_4_months">Precio 4 Meses (CLP)</Label>
                <Input
                  id="edit-price_4_months"
                  name="price_4_months"
                  type="number"
                  defaultValue={course.price_4_months || 140000}
                  step="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price_8_months">Precio 8 Meses (CLP)</Label>
                <Input
                  id="edit-price_8_months"
                  name="price_8_months"
                  type="number"
                  defaultValue={course.price_8_months || 280000}
                  step="1000"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration_hours">Duración (horas)</Label>
              <Input
                id="edit-duration_hours"
                name="duration_hours"
                type="number"
                defaultValue={course.duration_hours || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-level">Nivel</Label>
              <Select name="level" defaultValue={course.level || "beginner"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Principiante</SelectItem>
                  <SelectItem value="intermediate">Intermedio</SelectItem>
                  <SelectItem value="advanced">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="edit-published" name="published" defaultChecked={course.published} />
            <Label htmlFor="edit-published">Publicado</Label>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch id="edit-has_questions_pack" name="has_questions_pack" defaultChecked={course.has_questions_pack || false} />
              <Label htmlFor="edit-has_questions_pack">Ofrecer banco de preguntas adicional</Label>
            </div>

            <div className="space-y-2 ml-8">
              <Label htmlFor="edit-questions_pack_price">Precio del Banco de Preguntas (CLP)</Label>
              <Input
                id="edit-questions_pack_price"
                name="questions_pack_price"
                type="number"
                step="1000"
                placeholder="25000"
                defaultValue={course.questions_pack_price || ""}
              />
              <p className="text-xs text-muted-foreground">
                Este precio se agregará al checkout como una opción adicional
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== DELETE DIALOG ====================
function DeleteCourseDialog({
  course,
  onDeleted,
}: {
  course: any
  onDeleted: (courseId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteCourse(course.id)
      
      toast({
        title: "Curso eliminado",
        description: `Se eliminó "${course.title}" correctamente.`,
      })
      
      setIsOpen(false)
      onDeleted(course.id)
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      })
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar curso?</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar "{course.title}". Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}