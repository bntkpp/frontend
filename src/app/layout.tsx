import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/components/auth-provider"
import { ChatbotWidget } from "@/components/chatbot-widget"
import "./globals.css"

export const metadata: Metadata = {
  title: "Paidek - Plataforma Educativa",
  description: "Preparación para exámenes libres",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          {children}
          <ChatbotWidget />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}