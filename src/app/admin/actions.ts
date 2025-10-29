"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

// ==================== COURSES ====================
export async function createCourse(data: any) {
  const supabase = await createClient()
  
  const { data: course, error } = await supabase
    .from("courses")
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error("Error creating course:", error)
    throw new Error(`Error al crear curso: ${error.message}`)
  }

  revalidatePath("/admin/courses")
  revalidatePath("/courses")
  return course
}

export async function updateCourse(courseId: string, data: any) {
  console.log("🔄 Updating course:", courseId, data)
  
  const supabase = await createClient()
  
  // Primero verificar que el curso existe
  const { data: existingCourse, error: checkError } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking course:", checkError)
    throw new Error(`Error al verificar curso: ${checkError.message}`)
  }

  if (!existingCourse) {
    console.error("Course not found:", courseId)
    throw new Error(`No se encontró el curso con ID: ${courseId}`)
  }

  // Ahora actualizar
  const { data: course, error } = await supabase
    .from("courses")
    .update(data)
    .eq("id", courseId)
    .select()
    .maybeSingle()

  if (error) {
    console.error("Error updating course:", error)
    throw new Error(`Error al actualizar curso: ${error.message}`)
  }

  if (!course) {
    console.error("No course returned after update")
    throw new Error("No se pudo actualizar el curso")
  }

  console.log("✅ Course updated successfully:", course)

  revalidatePath("/admin/courses")
  revalidatePath("/courses")
  revalidatePath(`/courses/${courseId}`)
  
  return course
}

export async function deleteCourse(courseId: string) {
  console.log("🗑️ Deleting course:", courseId)
  
  const supabase = await createClient()
  
  // Verificar si hay módulos asociados
  const { data: modules, error: modulesError } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId)
    .limit(1)

  if (modulesError) {
    console.error("Error checking modules:", modulesError)
    throw new Error(`Error al verificar módulos: ${modulesError.message}`)
  }

  if (modules && modules.length > 0) {
    throw new Error("No puedes eliminar un curso que tiene módulos asociados. Elimina primero los módulos.")
  }

  // Verificar si hay inscripciones asociadas
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("course_id", courseId)
    .limit(1)

  if (enrollmentsError) {
    console.error("Error checking enrollments:", enrollmentsError)
    throw new Error(`Error al verificar inscripciones: ${enrollmentsError.message}`)
  }

  if (enrollments && enrollments.length > 0) {
    throw new Error("No puedes eliminar un curso que tiene inscripciones. Elimina primero las inscripciones.")
  }

  // Ahora sí eliminar
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", courseId)

  if (error) {
    console.error("Error deleting course:", error)
    throw new Error(`Error al eliminar curso: ${error.message}`)
  }

  console.log("✅ Course deleted successfully")

  revalidatePath("/admin/courses")
  revalidatePath("/courses")
}

// ==================== MODULES ====================
export async function createModule(data: any) {
  const supabase = await createClient()
  
  const { data: module, error } = await supabase
    .from("modules")
    .insert(data)
    .select("*, courses(title)")
    .maybeSingle()

  if (error) {
    console.error("Error creating module:", error)
    throw new Error(`Error al crear módulo: ${error.message}`)
  }

  revalidatePath("/admin/modules")
  return module
}

export async function updateModule(moduleId: string, data: any) {
  const supabase = await createClient()
  
  const { data: module, error } = await supabase
    .from("modules")
    .update(data)
    .eq("id", moduleId)
    .select("*, courses(title)")
    .maybeSingle()

  if (error) {
    console.error("Error updating module:", error)
    throw new Error(`Error al actualizar módulo: ${error.message}`)
  }

  if (!module) {
    throw new Error("No se encontró el módulo")
  }

  revalidatePath("/admin/modules")
  return module
}

export async function deleteModule(moduleId: string) {
  console.log("🗑️ Deleting module:", moduleId)
  
  const supabase = await createClient()
  
  // Verificar si hay lecciones asociadas
  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id")
    .eq("module_id", moduleId)
    .limit(1)

  if (lessonsError) {
    console.error("Error checking lessons:", lessonsError)
    throw new Error(`Error al verificar lecciones: ${lessonsError.message}`)
  }

  if (lessons && lessons.length > 0) {
    throw new Error("No puedes eliminar un módulo que tiene lecciones. Elimina primero las lecciones.")
  }

  const { error } = await supabase
    .from("modules")
    .delete()
    .eq("id", moduleId)

  if (error) {
    console.error("Error deleting module:", error)
    throw new Error(`Error al eliminar módulo: ${error.message}`)
  }

  console.log("✅ Module deleted successfully")

  revalidatePath("/admin/modules")
}

// ==================== LESSONS ====================
export async function createLesson(data: any) {
  const supabase = await createClient()
  
  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert(data)
    .select("*, modules(title, course_id, courses(title))")
    .maybeSingle()

  if (error) {
    console.error("Error creating lesson:", error)
    throw new Error(`Error al crear lección: ${error.message}`)
  }

  revalidatePath("/admin/lessons")
  return lesson
}

export async function updateLesson(lessonId: string, data: any) {
  const supabase = await createClient()
  
  const { data: lesson, error } = await supabase
    .from("lessons")
    .update(data)
    .eq("id", lessonId)
    .select("*, modules(title, course_id, courses(title))")
    .maybeSingle()

  if (error) {
    console.error("Error updating lesson:", error)
    throw new Error(`Error al actualizar lección: ${error.message}`)
  }

  if (!lesson) {
    throw new Error("No se encontró la lección")
  }

  revalidatePath("/admin/lessons")
  return lesson
}

export async function deleteLesson(lessonId: string) {
  console.log("🗑️ Deleting lesson:", lessonId)
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)

  if (error) {
    console.error("Error deleting lesson:", error)
    throw new Error(`Error al eliminar lección: ${error.message}`)
  }

  console.log("✅ Lesson deleted successfully")

  revalidatePath("/admin/lessons")
}

// ==================== ENROLLMENTS ====================
export async function createEnrollment(data: any) {
  const supabase = await createClient()
  
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .insert(data)
    .select(`
      *,
      profiles(full_name, email),
      courses(title)
    `)
    .maybeSingle()

  if (error) {
    console.error("Error creating enrollment:", error)
    throw new Error(`Error al crear inscripción: ${error.message}`)
  }

  revalidatePath("/admin/enrollments")
  return enrollment
}

export async function updateEnrollment(enrollmentId: string, data: any) {
  const supabase = await createClient()
  
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .update(data)
    .eq("id", enrollmentId)
    .select(`
      *,
      profiles(full_name, email),
      courses(title)
    `)
    .maybeSingle()

  if (error) {
    console.error("Error updating enrollment:", error)
    throw new Error(`Error al actualizar inscripción: ${error.message}`)
  }

  if (!enrollment) {
    throw new Error("No se encontró la inscripción")
  }

  revalidatePath("/admin/enrollments")
  return enrollment
}

export async function deleteEnrollment(enrollmentId: string) {
  console.log("🗑️ Deleting enrollment:", enrollmentId)
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("id", enrollmentId)

  if (error) {
    console.error("Error deleting enrollment:", error)
    throw new Error(`Error al eliminar inscripción: ${error.message}`)
  }

  console.log("✅ Enrollment deleted successfully")

  revalidatePath("/admin/enrollments")
}

// ==================== USERS ====================
export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .maybeSingle()

  if (error) {
    console.error("Error updating user role:", error)
    throw new Error(`Error al actualizar rol: ${error.message}`)
  }

  revalidatePath("/admin/users")
  return data
}

export async function deleteUser(userId: string) {
  console.log("🗑️ Deleting user:", userId)
  
  const supabase = await createClient()
  
  // Verificar si hay inscripciones
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .limit(1)

  if (enrollmentsError) {
    console.error("Error checking enrollments:", enrollmentsError)
    throw new Error(`Error al verificar inscripciones: ${enrollmentsError.message}`)
  }

  if (enrollments && enrollments.length > 0) {
    throw new Error("No puedes eliminar un usuario que tiene inscripciones. Elimina primero las inscripciones.")
  }

  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId)

  if (error) {
    console.error("Error deleting user:", error)
    throw new Error(`Error al eliminar usuario: ${error.message}`)
  }

  console.log("✅ User deleted successfully")

  revalidatePath("/admin/users")
}