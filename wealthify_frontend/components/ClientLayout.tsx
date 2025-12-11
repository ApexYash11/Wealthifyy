'use client'

import React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        {children}
        <footer className="w-full text-center py-4 text-xs text-gray-400 border-t mt-auto">
          © 2025 Wealthify. All rights reserved.
        </footer>
      </main>
    </div>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebar = pathname === '/' || pathname === '/login' || pathname === '/register';

  if (noSidebar) {
    return <>{children}</>;
  }

  return <LayoutWithSidebar>{children}</LayoutWithSidebar>;
} 