"use client";

import React from "react";
import Link from "next/link";

const features = [
  {
    title: "Track Expenses Instantly",
    description: "Monitor your spending in real time with beautiful charts and breakdowns.",
  },
  {
    title: "AI-Powered Insights",
    description: "Get personalized predictions and tips to improve your financial health.",
  },
  {
    title: "Personalized Dashboard",
    description: "All your finances, investments, and goals in one secure place.",
  },
  {
    title: "Secure & Private",
    description: "Your data is encrypted and never shared. You're always in control.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-900 to-gray-900 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-400 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Wealthify</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <button className="px-6 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 border border-white/20">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-6 py-2.5 rounded-lg font-medium bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 transition-all duration-200 shadow-lg">
              Sign Up
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 leading-tight">
            Personalized Finance.<br />
            <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">
              Smarter Decisions.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Take control of your money with Wealthify. Track expenses, get AI-powered insights, and achieve your financial goals—all in one beautiful dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <button className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold text-xl shadow-2xl hover:from-purple-700 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
                Get Started Free
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            Why Choose <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">Wealthify</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="bg-white/5 rounded-2xl p-8 shadow-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-500 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-lg">{idx + 1}</span>
                </div>
                <h3 className="text-2xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            What our users <span className="bg-gradient-to-r from-purple-400 to-purple-200 bg-clip-text text-transparent">say</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                "Wealthify changed my life! Now I understand my money better and make smarter financial decisions."
              </p>
              <div className="text-white font-semibold">— Priya Sharma</div>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                "The AI insights are spot on. I feel more in control of my finances than ever before."
              </p>
              <div className="text-white font-semibold">— Rahul Mehta</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full text-center py-8 text-gray-400 text-sm border-t border-white/10 bg-black/20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-purple-400 rounded-lg flex items-center justify-center">
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
