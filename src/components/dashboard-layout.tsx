import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <DashboardNav />
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-background">{children}</main>
    </div>
  )
}
