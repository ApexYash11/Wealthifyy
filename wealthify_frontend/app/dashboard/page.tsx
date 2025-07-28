"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  TrendingUp,
  Plus,
  Bell,
  Settings,
  CreditCard,
  Wallet,
  ChevronRight,
  IndianRupee,
  Edit,
  BarChart2,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AddTransactionModal from "@/components/add-transaction-modal";
import EditSavingsModal from "@/components/edit-savings-modal";
import { useFinancialData } from "@/hooks/use-financial-data";
import { useAuth } from "@/context/AuthContext";
import { Toaster } from "@/components/toaster";
import { Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import { useRouter } from 'next/navigation';
import { formatRupees } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';
import type { Transaction } from "@/components/add-transaction-modal";

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, LineElement, PointElement, LinearScale, CategoryScale);

export default function DashboardPage() {
  const { data, addTransaction, updateSavings, updateSavingsGoal, loading, error } = useFinancialData();
  const { user } = useAuth();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isEditSavingsModalOpen, setIsEditSavingsModalOpen] = useState(false);
  const router = useRouter();

  // Get user's display name
  const getUserDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.email) return user.email.split('@')[0]; // Use email prefix as fallback
    return 'User';
  };

  // Handler for adding a transaction
  const handleAddTransaction = async (transaction: Transaction) => {
    try {
      await addTransaction(transaction);
      // Optionally, you can call refreshData() if available from useFinancialData
      if (typeof window !== 'undefined') {
        // Force a reload of dashboard data if needed
        window.location.reload();
      }
      setIsAddTransactionModalOpen(false);
    } catch (e) {
      alert('Failed to add transaction. Please try again.');
    }
  };

  // JWT token check
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (!token) {
      router.replace('/login');
    }
  }, [router]);

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Calculate top category and savings rate
  const topCategory = data.spendingCategories.length > 0 ? data.spendingCategories[0] : null;
  const savingsRate = data.monthlyIncome > 0 ? Math.round((data.currentSavings / data.monthlyIncome) * 100) : 0;

  // Define vibrantColors for both chart and breakdown
  const vibrantColors = [
    'rgba(162,89,255,0.9)', 'rgba(110,193,228,0.9)', 'rgba(126,231,135,0.9)', 'rgba(255,224,102,0.9)', 'rgba(255,179,198,0.9)',
    'rgba(255,214,224,0.9)', 'rgba(181,234,215,0.9)', 'rgba(247,214,224,0.9)', 'rgba(255,180,162,0.9)', 'rgba(178,247,239,0.9)',
    'rgba(181,185,255,0.9)', 'rgba(212,252,121,0.9)',
  ];
  // Map each category to its color by index
  const categoryColorMap = Object.fromEntries(
    data.spendingCategories.map((cat, idx) => [cat.category, vibrantColors[idx % vibrantColors.length]])
  );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-[#181c2a] to-[#232946]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold mb-1">
            Welcome back, <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">{getUserDisplayName()}</span>
          </h1>
          <p className="text-gray-400 text-lg">Here's your financial overview</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            className="bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold shadow-md hover:from-purple-600 hover:to-purple-800 px-6 py-2 text-lg"
            onClick={() => setIsAddTransactionModalOpen(true)}
          >
            + Add Transaction
          </Button>
          <AddTransactionModal
            isOpen={isAddTransactionModalOpen}
            onClose={() => setIsAddTransactionModalOpen(false)}
            onAddTransaction={handleAddTransaction}
          />
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#181c2a] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Total Balance</CardTitle>
            <IndianRupee className="h-6 w-6 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{data.totalBalance.toLocaleString()}</div>
            <div className="text-green-400 text-sm flex items-center gap-1">
              {data.lastMonthBalance > 0 ? 
                `${data.totalBalance > data.lastMonthBalance ? '+' : ''}${(((data.totalBalance - data.lastMonthBalance) / data.lastMonthBalance) * 100).toFixed(1)}% from last month` :
                'New this month'
              }
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#181c2a] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Monthly Income</CardTitle>
            <ArrowUpCircle className="h-6 w-6 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{data.monthlyIncome}</div>
            <div className="text-gray-400 text-sm">Last updated today</div>
          </CardContent>
        </Card>
        <Card className="bg-[#181c2a] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Monthly Expenses</CardTitle>
            <ArrowDownCircle className="h-6 w-6 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{data.monthlyExpenses.toLocaleString()}</div>
            <div className="text-red-400 text-sm flex items-center gap-1">
              {data.lastMonthExpenses > 0 ? 
                `${data.monthlyExpenses > data.lastMonthExpenses ? '+' : ''}${(((data.monthlyExpenses - data.lastMonthExpenses) / data.lastMonthExpenses) * 100).toFixed(1)}% from last month` :
                'New this month'
              }
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#181c2a] text-white rounded-2xl shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Savings Goal</CardTitle>
            <div className="flex items-center gap-2">
              <PiggyBank className="h-6 w-6 text-purple-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditSavingsModalOpen(true)}
                className="p-1 h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-1">₹{data.savingsGoal.toLocaleString()}</div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(100, (data.currentSavings / data.savingsGoal) * 100)}%` }}></div>
            </div>
            <div className="text-gray-400 text-sm">
              ₹{(data.savingsGoal - data.currentSavings).toLocaleString()} to goal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spending Breakdown */}
      <div className="bg-[#181c2a] rounded-2xl shadow-lg p-6 mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Monthly Spending Breakdown</h3>
        <p className="text-gray-400 mb-6">Your spending categorized by type</p>
        <div className="space-y-4">
          {data.spendingCategories.map((cat, idx) => (
            <div key={cat.category} className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-semibold`} style={{ color: vibrantColors[idx % vibrantColors.length] }}>{cat.category}</span>
                <span className="text-white font-semibold">₹{cat.amount}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${cat.percentage}%`,
                    background: vibrantColors[idx % vibrantColors.length],
                  }}
                ></div>
              </div>
              <div className="text-right text-gray-400 text-xs mt-1">{cat.percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Savings Modal */}
      <EditSavingsModal
        isOpen={isEditSavingsModalOpen}
        onClose={() => setIsEditSavingsModalOpen(false)}
        currentSavings={data.currentSavings}
        savingsGoal={data.savingsGoal}
        onUpdateSavings={updateSavings}
        onUpdateGoal={updateSavingsGoal}
      />

      {/* Add more sections here for Recent Transactions, Investments, etc. */}
    </div>
  );
}
