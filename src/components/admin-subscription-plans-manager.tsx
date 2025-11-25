"use client"

import { useState } from "react"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Plus, Star, TrendingUp, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SubscriptionPlan {
  id: string
  course_id: string
  duration_months: number
  price: number
  name: string | null
  description: string | null
  is_popular: boolean
  display_order: number
  is_active: boolean
}

interface AdminSubscriptionPlansManagerProps {
  courseId: string
  courseName: string
  plans: SubscriptionPlan[]
}

export function AdminSubscriptionPlansManager({ 
  courseId, 
  courseName,
  plans: initialPlans 
}: AdminSubscriptionPlansManagerProps) {
  const [plans, setPlans] = useState(initialPlans)
  const router = useRouter()

  const handlePlanCreated = (plan: SubscriptionPlan) => {
    setPlans((prev) => [...prev, plan].sort((a, b) => a.display_order - b.display_order))
  }

  const handlePlanUpdated = (plan: SubscriptionPlan) => {
    setPlans((prev) => 
      prev.map((p) => (p.id === plan.id ? plan : p))
        .sort((a, b) => a.display_order - b.display_order)
    )
  }

  const handlePlanDeleted = (planId: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== planId))
  }

  const activePlans = plans.filter(p => p.is_active)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activePlans.length} {activePlans.length === 1 ? 'plan activo' : 'planes activos'}
        </p>
        <CreatePlanDialog courseId={courseId} onCreated={handlePlanCreated} />
      </div>

      {activePlans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h4 className="text-sm font-semibold mb-1">No hay planes configurados</h4>
            <p className="text-xs text-muted-foreground mb-4">
              Crea planes con cualquier duración
            </p>
            <CreatePlanDialog courseId={courseId} onCreated={handlePlanCreated} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activePlans.map((plan) => (
            <Card key={plan.id} className={plan.is_popular ? "border-primary border-2" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-base mb-1.5">
                      {plan.name || `Plan ${plan.duration_months} ${plan.duration_months === 1 ? 'Mes' : 'Meses'}`}
                    </CardTitle>
                    {plan.is_popular && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <EditPlanDialog plan={plan} onUpdated={handlePlanUpdated} />
                    <DeletePlanDialog plan={plan} onDeleted={handlePlanDeleted} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    ${plan.price.toLocaleString("es-CL")}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5">
                    {plan.duration_months} {plan.duration_months === 1 ? 'mes' : 'meses'} de acceso
                  </div>
                  {plan.duration_months > 1 && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      ${Math.round(plan.price / plan.duration_months).toLocaleString("es-CL")}/mes
                    </div>
                  )}
                </div>
                
                {plan.description && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {plan.description}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center text-xs text-muted-foreground pt-1">
                  <span className="px-2 py-0.5 bg-secondary rounded text-xs">
                    Orden: {plan.display_order}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ==================== CREATE DIALOG ====================
function CreatePlanDialog({
  courseId,
  onCreated,
}: {
  courseId: string
  onCreated: (plan: SubscriptionPlan) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isTestMode, setIsTestMode] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsCreating(true)

    const formData = new FormData(event.currentTarget)

    // Si está en modo prueba, convertir minutos a meses (decimal)
    let durationMonths: number
    if (isTestMode) {
      const minutes = parseInt(formData.get("test_minutes") as string)
      // Convertir minutos a fracción de mes
      // 1 mes ≈ 43800 minutos (30 días * 24 horas * 60 minutos)
      // Para 1 minuto: 1/43800 ≈ 0.0000228 meses
      durationMonths = minutes / 43800
    } else {
      durationMonths = parseInt(formData.get("duration_months") as string)
    }

    const payload = {
      course_id: courseId,
      duration_months: durationMonths,
      price: parseFloat(formData.get("price") as string),
      name: formData.get("name") as string || null,
      description: formData.get("description") as string || null,
      is_popular: formData.get("is_popular") === "on",
      display_order: parseInt(formData.get("display_order") as string) || 0,
      is_active: true,
    }

    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      onCreated(data)
      toast({
        title: "Plan creado",
        description: isTestMode 
          ? `Plan de prueba creado (expira en ${formData.get("test_minutes")} minutos)`
          : "El plan de suscripción se creó correctamente.",
      })
      setIsOpen(false)
      setIsTestMode(false)
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
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Crear Plan
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Plan de Suscripción</DialogTitle>
          <DialogDescription>
            Define la duración y precio del plan. Puedes crear planes de cualquier duración.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 pb-2">
            <Switch
              id="test-mode"
              checked={isTestMode}
              onCheckedChange={setIsTestMode}
            />
            <Label htmlFor="test-mode" className="cursor-pointer text-sm">
              Modo de prueba (duración en minutos)
            </Label>
          </div>

          {isTestMode ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="test_minutes">Duración (minutos) *</Label>
                <Input
                  id="test_minutes"
                  name="test_minutes"
                  type="number"
                  min="1"
                  max="1440"
                  required
                  placeholder="1"
                  defaultValue="1"
                />
                <p className="text-xs text-muted-foreground">
                  1 minuto = expira en 60 segundos
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Precio (CLP) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1000"
                  min="0"
                  required
                  placeholder="1000"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration_months">Duración (meses) *</Label>
                <Input
                  id="duration_months"
                  name="duration_months"
                  type="number"
                  min="1"
                  required
                  placeholder="1, 2, 3, 4..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (CLP) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="1000"
                  min="0"
                  required
                  placeholder="35000"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Plan</Label>
            <Input
              id="name"
              name="name"
              placeholder='ej: "Plan Mensual", "Plan Trimestral"'
            />
            <p className="text-xs text-muted-foreground">
              Opcional. Si no se especifica, se usará "Plan X Meses"
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              placeholder="Descripción opcional del plan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_order">Orden de Visualización</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={0}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Menor número aparece primero
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_popular" name="is_popular" />
            <Label htmlFor="is_popular" className="cursor-pointer">
              Marcar como "Plan Popular"
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== EDIT DIALOG ====================
function EditPlanDialog({
  plan,
  onUpdated,
}: {
  plan: SubscriptionPlan
  onUpdated: (plan: SubscriptionPlan) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)

    const formData = new FormData(event.currentTarget)

    const payload = {
      duration_months: parseInt(formData.get("duration_months") as string),
      price: parseFloat(formData.get("price") as string),
      name: formData.get("name") as string || null,
      description: formData.get("description") as string || null,
      is_popular: formData.get("is_popular") === "on",
      display_order: parseInt(formData.get("display_order") as string),
    }

    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .update(payload)
        .eq("id", plan.id)
        .select()
        .single()

      if (error) throw error

      onUpdated(data)
      toast({
        title: "Plan actualizado",
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
          <DialogTitle>Editar Plan de Suscripción</DialogTitle>
          <DialogDescription>Modifica los detalles del plan</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-duration_months">Duración (meses) *</Label>
              <Input
                id="edit-duration_months"
                name="duration_months"
                type="number"
                min="1"
                required
                defaultValue={plan.duration_months}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-price">Precio (CLP) *</Label>
              <Input
                id="edit-price"
                name="price"
                type="number"
                step="1000"
                min="0"
                required
                defaultValue={plan.price}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Nombre del Plan</Label>
            <Input
              id="edit-name"
              name="name"
              defaultValue={plan.name || ""}
              placeholder='ej: "Plan Mensual"'
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descripción</Label>
            <Textarea
              id="edit-description"
              name="description"
              rows={2}
              defaultValue={plan.description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-display_order">Orden de Visualización</Label>
            <Input
              id="edit-display_order"
              name="display_order"
              type="number"
              defaultValue={plan.display_order}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-is_popular"
              name="is_popular"
              defaultChecked={plan.is_popular}
            />
            <Label htmlFor="edit-is_popular" className="cursor-pointer">
              Marcar como "Plan Popular"
            </Label>
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
function DeletePlanDialog({
  plan,
  onDeleted,
}: {
  plan: SubscriptionPlan
  onDeleted: (planId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", plan.id)

      if (error) throw error

      onDeleted(plan.id)
      toast({
        title: "Plan eliminado",
        description: "El plan se eliminó correctamente.",
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
          <DialogTitle>¿Eliminar plan?</DialogTitle>
          <DialogDescription>
            Estás a punto de eliminar el plan "{plan.name || `${plan.duration_months} meses`}". Esta acción no se puede deshacer.
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
