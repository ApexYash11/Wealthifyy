import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/toaster"
import ClientLayout from "@/components/ClientLayout"
import AuthTokenCleaner from "@/components/AuthTokenCleaner"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Wealthify - Personal Finance Dashboard",
  description: "Track your finances and investments in one place",
  generator: 'v0.dev'
}

import { FinancialProvider } from "@/context/financial-context"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className + " bg-gray-50 dark:bg-gray-900 min-h-screen"}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <FinancialProvider>
            <AuthTokenCleaner />
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster />
          </FinancialProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}