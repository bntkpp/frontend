export interface AdminCollectionInventoryItem {
  table: string
  description: string
  adminPages: string[]
  operations: string[]
}

export const adminCollectionInventory: AdminCollectionInventoryItem[] = [
  {
    table: "profiles",
    description: "Perfiles de usuario y roles utilizados para validar acceso a la administración.",
    adminPages: ["/admin", "/admin/users", "/admin/enrollments", "/admin/payments"],
    operations: [
      "select",
      "role-check",
    ],
  },
  {
    table: "courses",
    description: "Cursos publicados y en borrador con sus precios y metadatos.",
    adminPages: ["/admin", "/admin/courses", "/admin/modules", "/admin/lessons", "/admin/payments"],
    operations: ["select", "update", "insert", "delete"],
  },
  {
    table: "modules",
    description: "Módulos que estructuran los cursos y agrupan lecciones.",
    adminPages: ["/admin/modules", "/admin/lessons"],
    operations: ["select", "insert", "update", "delete"],
  },
  {
    table: "lessons",
    description: "Lecciones con contenido, videos y evaluaciones.",
    adminPages: ["/admin/lessons"],
    operations: ["select", "insert", "update", "delete"],
  },
  {
    table: "payments",
    description: "Pagos realizados por los estudiantes y su estado de cobro.",
    adminPages: ["/admin", "/admin/payments"],
    operations: ["select"],
  },
  {
    table: "reviews",
    description: "Reseñas y puntuaciones dejadas por los estudiantes.",
    adminPages: ["/admin/reviews"],
    operations: ["select", "delete"],
  },
  {
    table: "enrollments",
    description: "Inscripciones activas de los estudiantes a los cursos.",
    adminPages: ["/admin", "/admin/enrollments"],
    operations: ["select", "insert", "update", "delete"],
  },
]