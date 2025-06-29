"use client"

import { useState, useEffect } from "react"
import type { Transaction } from "../components/add-transaction-modal"

export interface FinancialData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoal: number
  currentSavings: number
  recentTransactions: Transaction[]
  spendingCategories: {
    category: string
    amount: number
    percentage: number
    color: string
  }[]
}

const defaultData: FinancialData = {
  totalBalance: 24650.8,
  monthlyIncome: 5200,
  monthlyExpenses: 3450,
  savingsGoal: 10000,
  currentSavings: 6500,
  recentTransactions: [
    {
      id: 1,
      type: "expense",
      description: "Grocery Shopping",
      amount: 156.78,
      date: "2024-01-17",
      category: "Food",
      icon: "🛒",
    },
    {
      id: 2,
      type: "income",
      description: "Salary Deposit",
      amount: 2600.0,
      date: "2024-01-15",
      category: "Salary",
      icon: "💰",
    },
    {
      id: 3,
      type: "expense",
      description: "Netflix Subscription",
      amount: 15.99,
      date: "2024-01-14",
      category: "Entertainment",
      icon: "📺",
    },
    {
      id: 4,
      type: "expense",
      description: "Electric Bill",
      amount: 89.5,
      date: "2024-01-13",
      category: "Utilities",
      icon: "⚡",
    },
  ],
  spendingCategories: [
    { category: "Housing", amount: 1200, percentage: 35, color: "bg-purple-500" },
    { category: "Food", amount: 600, percentage: 17, color: "bg-blue-500" },
    { category: "Transportation", amount: 400, percentage: 12, color: "bg-green-500" },
    { category: "Utilities", amount: 350, percentage: 10, color: "bg-yellow-500" },
    { category: "Entertainment", amount: 300, percentage: 9, color: "bg-pink-500" },
  ],
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
}

export function useFinancialData() {
  const [data, setData] = useState<FinancialData>(defaultData)

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("financialData")
    if (savedData) {
      setData(JSON.parse(savedData))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("financialData", JSON.stringify(data))
  }, [data])

  const addTransaction = (transaction: Transaction) => {
    // Add transaction to recent transactions
    const updatedTransactions = [transaction, ...data.recentTransactions].slice(0, 10)

    // Update financial data based on transaction type
    let updatedData = { ...data, recentTransactions: updatedTransactions }

    if (transaction.type === "income") {
      updatedData = {
        ...updatedData,
        totalBalance: data.totalBalance + transaction.amount,
        monthlyIncome: data.monthlyIncome + transaction.amount,
      }
    } else {
      updatedData = {
        ...updatedData,
        totalBalance: data.totalBalance - transaction.amount,
        monthlyExpenses: data.monthlyExpenses + transaction.amount,
      }

      // Update spending categories
      const existingCategoryIndex = data.spendingCategories.findIndex((cat) => cat.category === transaction.category)

      let updatedCategories = [...data.spendingCategories]

      if (existingCategoryIndex >= 0) {
        // Update existing category
        updatedCategories[existingCategoryIndex] = {
          ...updatedCategories[existingCategoryIndex],
          amount: updatedCategories[existingCategoryIndex].amount + transaction.amount,
        }
      } else {
        // Add new category
        updatedCategories.push({
          category: transaction.category,
          amount: transaction.amount,
          percentage: 0, // Will be calculated below
          color: categoryColors[transaction.category] || "bg-gray-500",
        })
      }

      // Recalculate percentages
      const totalExpenses = updatedCategories.reduce((sum, cat) => sum + cat.amount, 0)
      updatedCategories = updatedCategories.map((cat) => ({
        ...cat,
        percentage: Math.round((cat.amount / totalExpenses) * 100),
      }))

      updatedData.spendingCategories = updatedCategories
    }

    setData(updatedData)
  }

  const updateSavings = (amount: number) => {
    setData({
      ...data,
      currentSavings: amount,
    })
  }

  const updateSavingsGoal = (amount: number) => {
    setData({
      ...data,
      savingsGoal: amount,
    })
  }

  const resetData = () => {
    localStorage.removeItem("financialData")
    setData(defaultData)
  }

  return {
    data,
    addTransaction,
    updateSavings,
    updateSavingsGoal,
    resetData,
  }
}
