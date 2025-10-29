"use client"

import { useState } from "react"
import { createModule, updateModule, deleteModule } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
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
  Card,
  CardContent,
  CardDescription,
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
import { Pencil, Trash2, Plus, BookOpen, Layers3 } from "lucide-react"

interface CourseOption {
  id: string
  title: string
}

export interface ModuleWithCourse {
  id: string
  title: string
  description: string | null
  order_index: number
  course_id: string
  courses: {
    title: string
  }
  created_at: string
  updated_at: string
}

interface AdminModulesManagerProps {
  initialModules: ModuleWithCourse[]
  courses: CourseOption[]
}

export function AdminModulesManager({ initialModules, courses }: AdminModulesManagerProps) {
  const [modules, setModules] = useState(initialModules)

  const handleModuleCreated = (module: ModuleWithCourse) => {
    setModules((prev) => [module, ...prev])
  }

  const handleModuleUpdated = (module: ModuleWithCourse) => {
    setModules((prev) => prev.map((m) => (m.id === module.id ? module : m)))
  }

  const handleModuleDeleted = (moduleId: string) => {
    setModules((prev) => prev.filter((m) => m.id !== moduleId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Módulos</h1>
          <p className="text-muted-foreground">Gestiona los módulos de los cursos</p>
        </div>
        <CreateModuleDialog courses={courses} onCreated={handleModuleCreated} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="line-clamp-1">{module.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {module.courses.title}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <EditModuleDialog
                    module={module}
                    courses={courses}
                    onUpdated={handleModuleUpdated}
                  />
                  <DeleteModuleDialog module={module} onDeleted={handleModuleDeleted} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {module.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {module.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Orden: {module.order_index}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {modules.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Layers3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay módulos creados aún</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ==================== CREATE DIALOG ====================
function CreateModuleDialog({
  courses,
  onCreated,
}: {
  courses: CourseOption[]
  onCreated: (module: ModuleWithCourse) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      course_id: formData.get("course_id") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      order_index: parseInt(formData.get("order_index") as string) || 1,
    }

    try {
      const module = await createModule(payload)
      onCreated(module)
      toast({
        title: "Módulo creado",
        description: "El módulo se creó correctamente.",
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
          Crear Módulo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nuevo Módulo</DialogTitle>
          <DialogDescription>Completa los datos del nuevo módulo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_id">Curso *</Label>
            <Select name="course_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Orden</Label>
            <Input id="order_index" name="order_index" type="number" defaultValue={1} min={1} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Módulo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EDIT DIALOG ====================
function EditModuleDialog({
  module,
  courses,
  onUpdated,
}: {
  module: ModuleWithCourse
  courses: CourseOption[]
  onUpdated: (module: ModuleWithCourse) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      course_id: formData.get("course_id") as string,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      order_index: parseInt(formData.get("order_index") as string),
    }

    try {
      const updatedModule = await updateModule(module.id, payload)
      onUpdated(updatedModule)
      toast({
        title: "Módulo actualizado",
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
          <DialogDescription>Modifica los datos del módulo</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-course_id">Curso</Label>
            <Select name="course_id" defaultValue={module.course_id} required>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input id="edit-title" name="title" defaultValue={module.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              name="description"
              rows={3}
              defaultValue={module.description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-order_index">Orden</Label>
            <Input
              id="edit-order_index"
              name="order_index"
              type="number"
              defaultValue={module.order_index}
              min={1}
            />
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
function DeleteModuleDialog({
  module,
  onDeleted,
}: {
  module: ModuleWithCourse
  onDeleted: (moduleId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteModule(module.id)
      onDeleted(module.id)
      toast({
        title: "Módulo eliminado",
        description: `Se eliminó "${module.title}" correctamente.`,
      })
      setIsOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al eliminar",
        description: error.message,
      })
    } finally {
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
          <DialogTitle>¿Eliminar módulo?</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar "{module.title}". Esta acción no se puede deshacer.
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