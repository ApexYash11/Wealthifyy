"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Upload, Tag, Repeat, Sparkles, Search } from "lucide-react";

const transactions = [
  {
    id: 1,
    label: "Grocery Shopping",
    date: "2024-01-17",
    amount: -156.78,
    type: "expense",
    category: "Food",
    recurring: false,
    aiSuggestion: "Consider buying in bulk for savings.",
    tags: ["groceries"],
    icon: "🛒",
  },
  {
    id: 2,
    label: "Salary Deposit",
    date: "2024-01-15",
    amount: 2600,
    type: "income",
    category: "Salary",
    recurring: true,
    aiSuggestion: null,
    tags: ["salary"],
    icon: "💰",
  },
  {
    id: 3,
    label: "Netflix Subscription",
    date: "2024-01-14",
    amount: -15.99,
    type: "expense",
    category: "Entertainment",
    recurring: true,
    aiSuggestion: "This is a recurring subscription.",
    tags: ["subscription"],
    icon: "📺",
  },
  {
    id: 4,
    label: "Electric Bill",
    date: "2024-01-13",
    amount: -89.5,
    type: "expense",
    category: "Utilities",
    recurring: true,
    aiSuggestion: "Your bill is higher than last month.",
    tags: ["utilities"],
    icon: "⚡",
  },
];

function formatCurrency(amount: number) {
  return `${amount < 0 ? "-" : "+"}₹${Math.abs(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showRecurring, setShowRecurring] = useState(false);

  // Filter logic
  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.label.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || tx.category === category;
    const matchesRecurring = !showRecurring || tx.recurring;
    return matchesSearch && matchesCategory && matchesRecurring;
  });

  // Summaries
  const totalSpent = transactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const totalRecurring = transactions.filter(tx => tx.recurring).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="flex justify-center items-start min-h-screen bg-background py-12">
      <div className="w-full max-w-3xl">
        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 p-5 text-white shadow-lg">
            <div className="text-xs uppercase mb-1">Total Spent</div>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-indigo-700 to-purple-600 p-5 text-white shadow-lg">
            <div className="text-xs uppercase mb-1">Recurring</div>
            <div className="text-2xl font-bold">₹{totalRecurring.toLocaleString("en-IN")}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-purple-900 to-purple-700 p-5 text-white shadow-lg flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <div>
              <div className="text-xs uppercase mb-1">Insights</div>
              <div className="text-sm">You have 3 subscriptions this month</div>
            </div>
          </div>
        </div>

        {/* Filter/Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
            <Input
              className="pl-10 bg-[#18181a] text-white border-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search transactions..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant={showRecurring ? "default" : "outline"} className="bg-gradient-to-r from-purple-700 to-purple-500 text-white border-none" onClick={() => setShowRecurring(r => !r)}>
            <Repeat className="w-4 h-4 mr-2" /> Recurring
          </Button>
          <Button variant="outline" className="border-purple-700 text-purple-700 bg-white/10 hover:bg-purple-700/20">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button variant="outline" className="border-purple-700 text-purple-700 bg-white/10 hover:bg-purple-700/20">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>

        {/* Transaction List */}
        <div className="rounded-2xl bg-gradient-to-b from-[#18181a] to-[#111113] shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Transactions</h2>
              <p className="text-gray-400 text-sm">Your latest financial activities</p>
            </div>
            <Button variant="outline" className="border-gray-700 text-white bg-black/30 hover:bg-black/50">
              View All <span className="ml-2">&rarr;</span>
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            {filtered.map((tx) => (
              <div
                key={tx.id}
                className={`flex items-center gap-4 rounded-xl px-6 py-5 ${tx.type === "income" ? "bg-[#232325]" : "bg-[#18181a]"}`}
              >
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-black/30 p-2 flex items-center justify-center text-2xl">
                    {tx.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-white font-semibold text-lg flex items-center gap-2">
                    {tx.label}
                    {tx.recurring && <span className="ml-2 px-2 py-0.5 rounded bg-purple-800 text-xs text-purple-200 flex items-center gap-1"><Repeat className="w-3 h-3 inline" /> Recurring</span>}
                    {tx.tags && tx.tags.map(tag => <span key={tag} className="ml-2 px-2 py-0.5 rounded bg-purple-900 text-xs text-purple-200"><Tag className="w-3 h-3 inline mr-1" />{tag}</span>)}
                  </div>
                  <div className="text-gray-400 text-xs mt-1">{tx.date}</div>
                  {tx.aiSuggestion && <div className="text-yellow-300 text-xs mt-1 flex items-center gap-1"><Sparkles className="w-3 h-3" /> {tx.aiSuggestion}</div>}
                </div>
                <div className={`text-lg font-bold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 