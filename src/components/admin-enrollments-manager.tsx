"use client"

import { useState } from "react"
import { updateEnrollment, deleteEnrollment, createEnrollment } from "@/app/admin/actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Calendar, GraduationCap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface EnrollmentWithDetails {
  id: string
  user_id: string
  course_id: string
  is_active: boolean
  subscription_type: string | null
  expires_at: string | null
  enrolled_at: string
  profiles: {
    full_name: string
    email: string
  }
  courses: {
    title: string
  }
}

interface AdminEnrollmentsManagerProps {
  initialEnrollments: EnrollmentWithDetails[]
  users: Array<{ id: string; full_name: string; email: string }>
  courses: Array<{ id: string; title: string }>
}

export function AdminEnrollmentsManager({
  initialEnrollments,
  users,
  courses,
}: AdminEnrollmentsManagerProps) {
  const [enrollments, setEnrollments] = useState(initialEnrollments)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courses.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEnrollmentCreated = (enrollment: EnrollmentWithDetails) => {
    setEnrollments((prev) => [enrollment, ...prev])
  }

  const handleEnrollmentUpdated = (enrollment: EnrollmentWithDetails) => {
    setEnrollments((prev) => prev.map((e) => (e.id === enrollment.id ? enrollment : e)))
  }

  const handleEnrollmentDeleted = (enrollmentId: string) => {
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inscripciones</h1>
          <p className="text-muted-foreground">Gestiona las inscripciones de estudiantes</p>
        </div>
        <CreateEnrollmentDialog
          users={users}
          courses={courses}
          onCreated={handleEnrollmentCreated}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas las Inscripciones</CardTitle>
          <CardDescription>
            <Input
              placeholder="Buscar por nombre, email o curso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Expira</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Inscrito</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{enrollment.profiles.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {enrollment.profiles.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.courses.title}</TableCell>
                  <TableCell>
                    {enrollment.subscription_type ? (
                      <Badge variant="outline">
                        {enrollment.subscription_type.replace("_", " ")}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {enrollment.expires_at ? (
                      <div className="text-sm">
                        {new Date(enrollment.expires_at).toLocaleDateString("es-CL")}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin límite</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {enrollment.is_active ? (
                      <Badge className="bg-green-500">Activo</Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(enrollment.enrolled_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditEnrollmentDialog
                        enrollment={enrollment}
                        users={users}
                        courses={courses}
                        onUpdated={handleEnrollmentUpdated}
                      />
                      <DeleteEnrollmentDialog
                        enrollment={enrollment}
                        onDeleted={handleEnrollmentDeleted}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No se encontraron inscripciones" : "No hay inscripciones aún"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== CREATE DIALOG ====================
function CreateEnrollmentDialog({
  users,
  courses,
  onCreated,
}: {
  users: Array<{ id: string; full_name: string; email: string }>
  courses: Array<{ id: string; title: string }>
  onCreated: (enrollment: EnrollmentWithDetails) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)

    const formData = new FormData(event.currentTarget)
    const subscriptionType = formData.get("subscription_type") as string

    // Calcular fecha de expiración
    let expiresAt = null
    if (subscriptionType && subscriptionType !== "none") {
      const now = new Date()
      switch (subscriptionType) {
        case "1_month":
          now.setMonth(now.getMonth() + 1)
          break
        case "4_months":
          now.setMonth(now.getMonth() + 4)
          break
        case "8_months":
          now.setMonth(now.getMonth() + 8)
          break
      }
      expiresAt = now.toISOString()
    }

    const payload = {
      user_id: formData.get("user_id") as string,
      course_id: formData.get("course_id") as string,
      is_active: formData.get("is_active") === "on",
      subscription_type: subscriptionType === "none" ? null : subscriptionType,
      expires_at: expiresAt,
      enrolled_at: new Date().toISOString(),
    }

    try {
      const enrollment = await createEnrollment(payload)
      onCreated(enrollment)
      toast({
        title: "Inscripción creada",
        description: "La inscripción se creó correctamente.",
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
          Nueva Inscripción
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Nueva Inscripción</DialogTitle>
          <DialogDescription>Inscribe a un estudiante en un curso</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">Estudiante *</Label>
            <Select name="user_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estudiante" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <Label htmlFor="subscription_type">Tipo de Suscripción</Label>
            <Select name="subscription_type" defaultValue="4_months">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin suscripción</SelectItem>
                <SelectItem value="1_month">1 Mes</SelectItem>
                <SelectItem value="4_months">4 Meses</SelectItem>
                <SelectItem value="8_months">8 Meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_active" name="is_active" defaultChecked />
            <Label htmlFor="is_active">Activo</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Inscripción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EDIT DIALOG ====================
function EditEnrollmentDialog({
  enrollment,
  users,
  courses,
  onUpdated,
}: {
  enrollment: EnrollmentWithDetails
  users: Array<{ id: string; full_name: string; email: string }>
  courses: Array<{ id: string; title: string }>
  onUpdated: (enrollment: EnrollmentWithDetails) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)
    const subscriptionType = formData.get("subscription_type") as string

    // Calcular nueva fecha de expiración si cambió el tipo
    let expiresAt = enrollment.expires_at
    if (subscriptionType && subscriptionType !== "none" && subscriptionType !== enrollment.subscription_type) {
      const now = new Date()
      switch (subscriptionType) {
        case "1_month":
          now.setMonth(now.getMonth() + 1)
          break
        case "4_months":
          now.setMonth(now.getMonth() + 4)
          break
        case "8_months":
          now.setMonth(now.getMonth() + 8)
          break
      }
      expiresAt = now.toISOString()
    } else if (subscriptionType === "none") {
      expiresAt = null
    }

    const payload = {
      is_active: formData.get("is_active") === "on",
      subscription_type: subscriptionType === "none" ? null : subscriptionType,
      expires_at: expiresAt,
    }

    try {
      const updatedEnrollment = await updateEnrollment(enrollment.id, payload)
      onUpdated(updatedEnrollment)
      toast({
        title: "Inscripción actualizada",
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
          <DialogTitle>Editar Inscripción</DialogTitle>
          <DialogDescription>
            {enrollment.profiles.full_name} - {enrollment.courses.title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscription_type">Tipo de Suscripción</Label>
            <Select
              name="subscription_type"
              defaultValue={enrollment.subscription_type || "none"}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin suscripción</SelectItem>
                <SelectItem value="1_month">1 Mes</SelectItem>
                <SelectItem value="4_months">4 Meses</SelectItem>
                <SelectItem value="8_months">8 Meses</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-is_active"
              name="is_active"
              defaultChecked={enrollment.is_active}
            />
            <Label htmlFor="edit-is_active">Activo</Label>
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
function DeleteEnrollmentDialog({
  enrollment,
  onDeleted,
}: {
  enrollment: EnrollmentWithDetails
  onDeleted: (enrollmentId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      await deleteEnrollment(enrollment.id)
      onDeleted(enrollment.id)
      toast({
        title: "Inscripción eliminada",
        description: "La inscripción se eliminó correctamente.",
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
          <DialogTitle>¿Eliminar inscripción?</DialogTitle>
          <DialogDescription>
            Se eliminará la inscripción de {enrollment.profiles.full_name} en{" "}
            {enrollment.courses.title}
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