"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Download, Tag, Repeat, Sparkles, Search, BarChart3, List } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { transactionAPI } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Papa from "papaparse";
import { formatRupees } from '@/lib/utils';
import TransactionChart from "@/components/TransactionChart";

interface Transaction {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  category: string;
  recurring?: boolean;
}

const categoryIcons: Record<string, string> = {
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Gift: "🎁",
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Utilities: "⚡",
  Entertainment: "🎬",
  Shopping: "🛒",
  Healthcare: "🏥",
  Education: "📚",
  Personal: "👤",
  Other: "📋",
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [showRecurring, setShowRecurring] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");
  const { user } = useAuth();

  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const response = await transactionAPI.getTransactions(parseInt(user.id), 50);
        setTransactions(response.data);
      } catch (err) {
        console.error("Error loading transactions:", err);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  // Filter logic
  const filtered = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || tx.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !category || tx.category === category;
    const matchesRecurring = !showRecurring || !!tx.recurring;
    return matchesSearch && matchesCategory && matchesRecurring;
  });

  // Summaries
  const totalSpent = transactions.filter(tx => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
  const totalRecurring = transactions.filter(tx => tx.type === "expense" && !!tx.recurring).reduce((sum, tx) => sum + tx.amount, 0);



  // Export handler
  const handleExport = () => {
    const csvRows = [
      ["Date", "Description", "Category", "Type", "Amount"],
      ...transactions.map(tx => [tx.date, tx.description, tx.category, tx.type, tx.amount])
    ];
    const csvContent = csvRows.map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Transactions</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start min-h-screen bg-background py-12">
      <div className="w-full max-w-3xl">
        {/* Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-500 p-5 text-white shadow-lg">
            <div className="text-xs uppercase mb-1">Total Spent</div>
            <div className="text-2xl font-bold">{formatRupees(totalSpent)}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-indigo-700 to-purple-600 p-5 text-white shadow-lg">
            <div className="text-xs uppercase mb-1">Recurring</div>
            <div className="text-2xl font-bold">{formatRupees(totalRecurring)}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-purple-900 to-purple-700 p-5 text-white shadow-lg flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-300" />
            <div>
              <div className="text-xs uppercase mb-1">Insights</div>
              <div className="text-sm">You have {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} this month</div>
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
          
          {/* View Toggle Buttons */}
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "list" ? "default" : "outline"} 
              className={viewMode === "list" ? "bg-gradient-to-r from-purple-700 to-purple-500 text-white border-none" : "border-purple-700 text-purple-700 bg-white/10 hover:bg-purple-700/20"}
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4 mr-2" /> List
            </Button>
            <Button 
              variant={viewMode === "chart" ? "default" : "outline"} 
              className={viewMode === "chart" ? "bg-gradient-to-r from-purple-700 to-purple-500 text-white border-none" : "border-purple-700 text-purple-700 bg-white/10 hover:bg-purple-700/20"}
              onClick={() => setViewMode("chart")}
            >
              <BarChart3 className="w-4 h-4 mr-2" /> Charts
            </Button>
          </div>
          
          <Button variant={showRecurring ? "default" : "outline"} className="bg-gradient-to-r from-purple-700 to-purple-500 text-white border-none" onClick={() => setShowRecurring(r => !r)}>
            <Repeat className="w-4 h-4 mr-2" /> Recurring
          </Button>
          <Button variant="outline" className="border-purple-700 text-purple-700 bg-white/10 hover:bg-purple-700/20" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>

        {/* Main Content Area */}
        {viewMode === "list" ? (
          /* Transaction List */
          <div className="rounded-2xl bg-gradient-to-b from-[#18181a] to-[#111113] shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Transactions</h2>
                <p className="text-gray-400 text-sm">Your latest financial activities</p>
              </div>
              <Button variant="outline" className="border-gray-700 text-white bg-black/30 hover:bg-black/50" onClick={() => setShowAllModal(true)}>
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
                      {categoryIcons[tx.category] || "📋"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg flex items-center gap-2">
                      {tx.description}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{tx.date}</div>
                  </div>
                  <div className={`text-lg font-bold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "expense" ? '-' : '+'}{formatRupees(Math.abs(tx.amount))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Chart View */
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-b from-[#18181a] to-[#111113] shadow-lg p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Transaction Analytics</h2>
                <p className="text-gray-400 text-sm">Visual breakdown of your spending patterns</p>
              </div>
              <TransactionChart />
            </div>
          </div>
        )}

        {/* View All Modal */}
        <Dialog open={showAllModal} onOpenChange={setShowAllModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>All Transactions</DialogTitle>
              <DialogDescription>Full list of your transactions</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 ${tx.type === "income" ? "bg-[#232325]" : "bg-[#18181a]"}`}
                >
                  <div className="flex-shrink-0">
                    <div className="rounded-full bg-black/30 p-2 flex items-center justify-center text-2xl">
                      {categoryIcons[tx.category] || "📋"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-semibold text-lg flex items-center gap-2">
                      {tx.description}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{tx.date}</div>
                  </div>
                  <div className={`text-lg font-bold ${tx.type === "income" ? "text-green-400" : "text-red-400"}`}>
                    {tx.type === "expense" ? '-' : '+'}{formatRupees(Math.abs(tx.amount))}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 