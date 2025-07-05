"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { dashboardAPI, transactionAPI, TransactionRequest } from "@/lib/api"

export interface Transaction {
  id: number
  type: "income" | "expense"
  description: string
  amount: number
  date: string
  category: string
  icon?: string
}

export interface FinancialData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  currentSavings: number
  lastMonthBalance: number
  recentTransactions: Transaction[]
  spendingCategories: {
    category: string
    amount: number
    percentage: number
    color: string
  }[]
}

const categoryColors: Record<string, string> = {
  Housing: "bg-purple-500",
  Food: "bg-blue-500",
  Transportation: "bg-green-500",
  Transport: "bg-green-500",
  Utilities: "bg-yellow-500",
  Entertainment: "bg-pink-500",
  Shopping: "bg-orange-500",
  Healthcare: "bg-red-500",
  Education: "bg-indigo-500",
  Personal: "bg-teal-500",
  Other: "bg-gray-500",
  Salary: "bg-green-600",
  Freelance: "bg-blue-600",
  Investment: "bg-purple-600",
}

const categoryIcons: Record<string, string> = {
  Housing: "🏠",
  Food: "🍽️",
  Transportation: "🚗",
  Transport: "🚗",
  Utilities: "⚡",
  Entertainment: "🎬",
  Shopping: "🛍️",
  Healthcare: "🏥",
  Education: "📚",
  Personal: "👤",
  Other: "📦",
  Salary: "💰",
  Freelance: "💼",
  Investment: "📈",
}

export function useFinancialData() {
  const [data, setData] = useState<FinancialData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsGoal: 10000,
    currentSavings: 0,
    lastMonthBalance: 0,
    recentTransactions: [],
    spendingCategories: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  // Load dashboard data from backend
  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)
      
      const response = await dashboardAPI.getDashboardData(parseInt(user.id))
      const dashboardData = response.data

      // Transform backend data to frontend format
      const transformedData: FinancialData = {
        totalBalance: dashboardData.summary.total_balance,
        monthlyIncome: dashboardData.summary.monthly_income,
        monthlyExpenses: dashboardData.summary.monthly_expenses,
        savingsGoal: dashboardData.summary.savings_goal,
        currentSavings: dashboardData.summary.current_savings,
        lastMonthBalance: dashboardData.summary.last_month_balance,
        recentTransactions: dashboardData.recent_transactions.map(tx => ({
          id: tx.id,
          type: tx.type as "income" | "expense",
          description: tx.description,
          amount: tx.amount,
          date: tx.date,
          category: tx.category,
          icon: categoryIcons[tx.category] || "📦",
        })),
        spendingCategories: dashboardData.spending_categories.map(cat => ({
          category: cat.category,
          amount: cat.amount,
          percentage: cat.percentage,
          color: categoryColors[cat.category] || "bg-gray-500",
        })),
      }

      setData(transformedData)
    } catch (err) {
      console.error("Error loading dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Load data when user changes
  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    if (!user) return

    try {
      const transactionData: TransactionRequest = {
        user_id: parseInt(user.id),
        type: transaction.type,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        date: transaction.date,
      }

      await transactionAPI.addTransaction(transactionData)
      
      // Reload dashboard data to get updated information
      await loadDashboardData()
    } catch (err) {
      console.error("Error adding transaction:", err)
      throw new Error("Failed to add transaction")
    }
  }

  const updateSavings = (amount: number) => {
    setData(prev => ({
      ...prev,
      currentSavings: amount,
    }))
  }

  const updateSavingsGoal = async (amount: number) => {
    if (!user) return;
    try {
      await dashboardAPI.updateSavingsGoal(parseInt(user.id), amount);
      await loadDashboardData();
    } catch (err) {
      console.error("Error updating savings goal:", err);
      setError("Failed to update savings goal");
    }
  }

  const refreshData = () => {
    loadDashboardData()
  }

  return {
    data,
    loading,
    error,
    addTransaction,
    updateSavings,
    updateSavingsGoal,
    refreshData,
  }
}
