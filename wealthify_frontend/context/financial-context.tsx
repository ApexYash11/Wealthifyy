"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction } from '@/lib/types';
import { transactionAPI, dashboardAPI } from '@/lib/api';
import { 
  calculateTotalBalance, 
  calculateMonthlyIncome, 
  calculateMonthlyExpenses, 
  calculateCategoryTotals 
} from '@/lib/financial-utils';

interface FinancialContextType {
  transactions: Transaction[];
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsGoal: number;
    currentSavings: number;
  };
  spendingCategories: {
    category: string;
    amount: number;
    percentage: number;
    color: string;
  }[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  updateSavingsGoal: (amount: number) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoal, setSavingsGoal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all transactions to ensure consistency
      const txResponse = await transactionAPI.getTransactions();
      let txData = txResponse?.data || [];
      if (!Array.isArray(txData)) {
        txData = txData?.transactions || [];
      }

      // Normalize transaction data
      const normalizedTransactions: Transaction[] = txData.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
        date: t.date ? (typeof t.date === 'string' ? t.date : new Date(t.date).toISOString()) : new Date().toISOString()
      }));

      setTransactions(normalizedTransactions);

      // Fetch savings goal (assuming it's part of dashboard data or user profile)
      // If dashboardAPI returns pre-calculated values, we might ignore them in favor of our own
      // BUT we need the savings goal.
      try {
        const dashResponse = await dashboardAPI.getDashboardData();
        if (dashResponse?.data?.savings_goal) {
          setSavingsGoal(Number(dashResponse.data.savings_goal));
        }
      } catch (e) {
        console.warn("Could not fetch dashboard specific data", e);
      }

    } catch (err) {
      console.error("Failed to fetch financial data:", err);
      setError("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateSavingsGoal = async (amount: number) => {
    try {
      // Optimistic update
      setSavingsGoal(amount);
      // API call would go here
      // await dashboardAPI.updateGoal(amount); 
    } catch (e) {
      console.error("Failed to update goal", e);
      refreshData(); // Revert on error
    }
  };

  // Derived State
  const summary = {
    totalBalance: calculateTotalBalance(transactions),
    monthlyIncome: calculateMonthlyIncome(transactions),
    monthlyExpenses: calculateMonthlyExpenses(transactions),
    savingsGoal: savingsGoal,
    currentSavings: calculateTotalBalance(transactions) // Assuming savings is just balance for now, or logic can be refined
  };

  const spendingCategories = calculateCategoryTotals(transactions);

  return (
    <FinancialContext.Provider value={{
      transactions,
      summary,
      spendingCategories,
      loading,
      error,
      refreshData,
      updateSavingsGoal
    }}>
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancialContext() {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialContext must be used within a FinancialProvider');
  }
  return context;
}
