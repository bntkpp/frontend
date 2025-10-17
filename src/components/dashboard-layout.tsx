import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-6 md:p-8 bg-background">{children}</main>
    </div>
  )
}
