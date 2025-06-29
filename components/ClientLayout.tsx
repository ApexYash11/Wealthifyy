'use client'

import React from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"

function LayoutWithSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
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
  const noSidebar = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register');

  if (noSidebar) {
    return <>{children}</>;
  }

  return <LayoutWithSidebar>{children}</LayoutWithSidebar>;
} 