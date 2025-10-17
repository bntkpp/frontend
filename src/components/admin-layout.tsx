import type React from "react"
import { AdminNav } from "@/components/admin-nav"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8 bg-background overflow-y-auto">{children}</main>
    </div>
  )
}
