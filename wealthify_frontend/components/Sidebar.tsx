'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, BarChart2, Brain, TrendingUp, Settings, LogOut, User, Sparkles, Menu, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: Home, emoji: '🏠' },
  { href: '/transactions', label: 'Transactions', icon: FileText, emoji: '📄' },
  { href: '/predictions', label: 'Predictions', icon: Sparkles, emoji: '🔮' },
  { href: '/insights', label: 'Insights', icon: Brain, emoji: '🧠' },
  { href: '/investments', label: 'Investments', icon: TrendingUp, emoji: '📈' },
  { href: '/settings', label: 'Settings', icon: Settings, emoji: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // The AuthContext will handle redirecting to login
  };

  // Sidebar content
  const sidebarContent = (
    <aside className="w-64 bg-gradient-to-b from-purple-900 to-gray-900 flex flex-col min-h-screen z-50 text-white">
      <div className="flex items-center justify-between h-20 border-b border-purple-800 px-4">
        <span className="text-2xl font-bold text-purple-300 tracking-tight">Wealthify</span>
        <ThemeToggle />
      </div>
      <div className="flex flex-col items-center py-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-700 to-purple-400 flex items-center justify-center text-white text-2xl font-bold mb-2">
          <User className="w-8 h-8" />
        </div>
        <div className="text-lg font-semibold">{user?.name || 'User'}</div>
        <div className="text-xs text-purple-200 mb-4">Premium Member</div>
      </div>
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link href={href} className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${pathname === href ? 'bg-gradient-to-r from-purple-700 to-purple-500 text-white' : 'text-purple-100 hover:bg-purple-800/60'}`} onClick={() => setOpen(false)}>
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            </li>
          ))}
          <li>
            <button 
              className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors text-purple-100 hover:bg-purple-800/60 w-full mt-2"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );

  return (
    <>
      {/* Hamburger menu for mobile */}
      <button
        className="fixed top-4 left-4 z-40 md:hidden bg-purple-900/80 text-white p-2 rounded-lg shadow-lg hover:bg-purple-800/90 transition"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 md:hidden ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      {/* Sidebar itself */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 transform transition-transform duration-300 md:translate-x-0 md:static md:block ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ width: 256 }}
      >
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 z-50 md:hidden p-2 rounded hover:bg-purple-800/60 transition"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}

// Add slide-in animation
// In your global CSS (e.g., app/globals.css or styles/globals.css), add:
// @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
// .animate-slide-in-left { animation: slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1); } 