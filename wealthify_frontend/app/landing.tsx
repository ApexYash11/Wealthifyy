"use client";

import Link from "next/link";

export default function PurpleLanding() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Wealthify</span>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/login">
            <button className="px-6 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 border border-white/20">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-white hover:from-purple-500 hover:to-purple-700 transition-all duration-200 shadow-lg">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight drop-shadow-lg">
            Smarter Finance.<br />
            <span className="bg-gradient-to-r from-purple-200 to-purple-400 bg-clip-text text-transparent">
              Brighter Future.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 mb-12 max-w-2xl mx-auto leading-relaxed">
            Take control of your money with Wealthify. Track expenses, get AI-powered insights, and achieve your financial goals—all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold text-xl shadow-2xl hover:from-purple-500 hover:to-purple-700 transition-all duration-300 transform hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
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
                className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-8 shadow-xl border border-purple-400/20 hover:border-purple-200/40 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">{i + 1}</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{f.title}</h3>
                <p className="text-purple-100 text-lg leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-purple-200 text-sm border-t border-purple-400/20 bg-gradient-to-r from-purple-800 to-purple-700">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-white font-semibold">Wealthify</span>
          </div>
          <p>© 2025 Wealthify. All rights reserved. | Secure • Private • Yours</p>
        </div>
      </footer>
    </div>
  );
} 