"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
// This is your root route (/) - Landing page

export default function PurpleLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gradient-to-br dark:from-purple-700 dark:via-purple-600 dark:to-purple-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-white/80 dark:bg-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-purple-700 dark:text-white font-bold text-xl">W</span>
          </div>
          <span className="text-2xl font-bold text-purple-700 dark:text-white tracking-tight">Wealthify</span>
        </div>
        <div className="flex gap-3 items-center">
          <ThemeToggle />
          <Link 
            href="/login"
            className="px-6 py-2.5 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 dark:border-white/20 transition-colors duration-200 inline-block text-center"
          >
            Login
          </Link>
          <Link 
            href="/register"
            className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-lg inline-block text-center"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-white/80 dark:bg-transparent">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-purple-700 dark:text-white mb-8 leading-tight drop-shadow-lg">
            Smarter Finance.<br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-700 bg-clip-text text-transparent dark:from-purple-200 dark:to-purple-400">
              Brighter Future.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-700 dark:text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Take control of your money with Wealthify. Track expenses, get AI-powered insights, and achieve your financial goals—all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/register"
              className="px-10 py-4 rounded-xl bg-purple-100 text-purple-700 font-semibold text-xl shadow-2xl hover:bg-purple-200 dark:bg-gradient-to-r dark:from-purple-400 dark:to-purple-600 dark:text-white dark:hover:from-purple-500 dark:hover:to-purple-700 transition-all duration-300 transform hover:scale-105 inline-block text-center"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/80 dark:bg-transparent">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: "Track Expenses Instantly",
                desc: "Monitor your spending in real time with beautiful charts and breakdowns.",
              },
              {
                title: "AI-Powered Insights",
                desc: "Get personalized predictions and tips to improve your financial health.",
              },
              {
                title: "Personalized Dashboard",
                desc: "All your finances, investments, and goals in one secure place.",
              },
              {
                title: "Secure & Private",
                desc: "Your data is encrypted and never shared. You're always in control.",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="bg-purple-100 text-purple-700 dark:bg-gradient-to-br dark:from-purple-600 dark:to-purple-800 dark:text-white rounded-2xl p-8 shadow-xl border border-purple-200 hover:border-purple-300 dark:border-purple-400/20 dark:hover:border-purple-200/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-purple-700 dark:text-white font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="text-2xl font-semibold text-purple-700 dark:text-white mb-4">{f.title}</h3>
                <p className="text-purple-700 dark:text-purple-100 text-lg leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-purple-700 dark:text-purple-200 text-sm border-t border-purple-200 dark:border-purple-400/20 bg-white/80 dark:bg-gradient-to-r dark:from-purple-800 dark:to-purple-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-purple-700 dark:text-white font-bold text-sm">W</span>
            </div>
            <span className="text-purple-700 dark:text-white font-semibold">Wealthify</span>
          </div>
          <p>© 2025 Wealthify. All rights reserved. | Secure • Private • Yours</p>
        </div>
      </footer>
    </div>
  );
}
