"use client"

import { useFinancialContext } from "@/context/financial-context"

// Re-export types if needed by consumers
export type { Transaction } from "@/lib/types"

export function useFinancialData() {
  const context = useFinancialContext();
  
  return {
    data: {
      totalBalance: context.summary.totalBalance,
      monthlyIncome: context.summary.monthlyIncome,
      monthlyExpenses: context.summary.monthlyExpenses,
      savingsGoal: context.summary.savingsGoal,
      currentSavings: context.summary.currentSavings,
      // These "lastMonth" values could be added to the context/utils if needed
      lastMonthBalance: 0, 
      lastMonthIncome: 0,
      lastMonthExpenses: 0,
      recentTransactions: context.transactions.slice(0, 5), // Top 5 recent
      spendingCategories: context.spendingCategories
    },
    loading: context.loading,
    error: context.error,
    refreshData: context.refreshData,
    updateSavingsGoal: context.updateSavingsGoal
  };
}
