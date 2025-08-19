'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import type { DashboardData } from '@/lib/types';
import AddTransactionModal from '@/components/add-transaction-modal';
import { transactionAPI as backendTransactionAPI } from '@/lib/api';

export default function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showBalance, setShowBalance] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Utility to log API errors with full details and return a friendly message
  const handleApiError = (error: any) => {
    try {
      const payload = {
        message: error?.message || (error && typeof error === 'object' && error.message) || 'Unknown error',
        code: error?.code ?? error?.status ?? null,
        details: error?.details ?? error?.body ?? null,
        hint: error?.hint ?? null,
        stack: error?.stack ?? null,
        original: error,
      };

      // Always log the full payload for debugging (server and client consoles)
      console.error('API Error:', payload);

      // Return a user-friendly message to display in the UI
      return payload.message || 'Could not fetch financial data. Please try again.';
    } catch (logErr) {
      // Fallback when logging itself fails
      console.error('Error while handling API error:', logErr, 'original:', error);
      return 'Could not fetch financial data. Please try again.';
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [retryCount]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call backend endpoints that return verified user data. We do not reimplement backend logic
      // — we map responses directly into the dashboard UI fields.
      const [txRes, portfolioRes, insightsRes] = await Promise.allSettled([
  apiClient.get('/transactions/'),
        apiClient.get('/portfolio/summary'),
        apiClient.get('/predictions/insights/expenses')
      ]);

      // Map recent transactions directly from backend response
      let recentTransactions: any[] = [];
      if (txRes.status === 'fulfilled') {
        const payload = txRes.value.data;
        recentTransactions = Array.isArray(payload) ? payload.slice(0, 5) : (payload?.transactions || []);
      } else {
        console.error('Failed to load transactions:', txRes.reason);
      }

      // Map portfolio/summary if present (use values as-is when available)
      let portfolio: any = null;
      if (portfolioRes.status === 'fulfilled') {
        portfolio = portfolioRes.value.data;
      } else {
        // portfolio is optional; log and continue
        console.error('Failed to load portfolio summary:', portfolioRes.status === 'rejected' ? portfolioRes.reason : null);
      }

      // Map expense insights directly
      let expenseInsights: any = null;
      if (insightsRes.status === 'fulfilled') {
        expenseInsights = insightsRes.value.data;
      } else {
        console.error('Failed to load expense insights:', insightsRes.status === 'rejected' ? insightsRes.reason : null);
      }

      // Populate DashboardData by preferring backend-provided fields. Avoid duplicating calculations.
      setData({
        totalIncome: (portfolio?.totalIncome ?? portfolio?.total_income ?? portfolio?.value ?? 0) as number,
        totalExpenses: (portfolio?.totalExpenses ?? portfolio?.total_expenses ?? 0) as number,
        currentSavings: (portfolio?.currentSavings ?? portfolio?.current_savings ?? 0) as number,
        savingsGoal: (portfolio?.savingsGoal ?? portfolio?.savings_goal ?? 0) as number,
        monthlyBudget: (portfolio?.monthlyBudget ?? portfolio?.monthly_budget ?? 0) as number,
        budgetUsed: (portfolio?.budgetUsed ?? portfolio?.budget_used ?? 0) as number,
        monthlyIncome: (portfolio?.monthlyIncome ?? portfolio?.monthly_income ?? 0) as number,
        totalIncomeChange: (portfolio?.totalIncomeChange ?? 0) as number,
        expenseChange: (expenseInsights?.expense_volatility ?? expenseInsights?.expenseChange ?? 0) as number,
        lastUpdate: portfolio?.lastUpdate ?? new Date().toLocaleDateString(),
        recentTransactions: recentTransactions.map((t: any) => ({ id: t.id, description: t.description, amount: t.amount, type: t.type, date: t.date })),
        expenseBreakdown: expenseInsights?.expenseBreakdown ?? []
      });
      
      // Only show success toast if recovering from an error
      if (error) {
        toast({
          title: "Dashboard Updated",
          description: "Your financial data has been loaded successfully",
        });
        setError(null);
      }
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      const isAuthError = (errorMessage || '').toLowerCase().includes('sign in') ||
        (errorMessage || '').toLowerCase().includes('authenticate') ||
        error?.code === 'auth/invalid-session';

      setError(errorMessage);
      
      // Handle authentication errors by redirecting to login
      if (isAuthError) {
        router.push("/login");
        toast({
          title: "Session Expired",
          description: "Please sign in again to continue",
          variant: "destructive"
        });
        return;
      }
      
  // Show error toast with retry option for non-auth errors
      toast({
        title: "Error Loading Dashboard",
        description: errorMessage,
        variant: "destructive",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setRetryCount(prev => prev + 1);
              toast({
                title: "Retrying...",
                description: "Attempting to reload your dashboard"
              });
            }}
          >
            Retry
          </Button>
        )
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-lg text-gray-400">Loading your financial dashboard...</p>
          <p className="text-sm text-gray-500">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4"></div>
          <h2 className="text-2xl font-semibold text-white">
            Unable to load dashboard
          </h2>
          <p className="text-gray-400">{error}</p>
          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setRetryCount(prev => prev + 1)}
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              className="text-purple-500 border-purple-500 hover:bg-purple-950"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Welcome back, <span className="text-purple-500">Yash Maheshwari</span>
            </h1>
            <p className="text-gray-400">
              Here's your financial overview
            </p>
          </div>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setShowAddModal(true)}
          >
            + Add Transaction
          </Button>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-400">Total Balance</h3>
              <svg className="w-6 h-6 text-purple-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {data?.totalIncome.toLocaleString()}
            </div>
            <div className="text-green-500 text-sm">+{(data?.totalIncomeChange || 0).toFixed(1)}% from last month</div>
          </div>

          {/* Monthly Income */}
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-400">Monthly Income</h3>
              <svg className="w-6 h-6 text-green-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ₹{data?.monthlyIncome.toLocaleString()}
            </div>
            <div className="text-green-500 text-sm">
              {(data?.totalIncomeChange || 0) > 0 ? '+' : ''}{(data?.totalIncomeChange || 0).toFixed(1)}% from last month
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-400">Monthly Expenses</h3>
              <svg className="w-6 h-6 text-red-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              ₹{data?.totalExpenses.toLocaleString()}
            </div>
            <div className="text-red-500 text-sm">
              {(data?.expenseChange || 0) > 0 ? '+' : ''}{(data?.expenseChange || 0).toFixed(1)}% from last month
            </div>
          </div>

          {/* Savings Goal */}
          <div className="bg-[#1a1a2e] rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-400">Savings Goal</h3>
              <div className="flex space-x-2">
                <button 
                  className="text-purple-500 hover:text-purple-400"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  <svg className="w-6 h-6" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  className="text-purple-500 hover:text-purple-400" 
                  onClick={() => setEditingGoal(true)}
                >
                  <svg className="w-6 h-6" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {showBalance ? `₹${data?.savingsGoal.toLocaleString()}` : '••••••'}
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${((data?.currentSavings || 0) / (data?.savingsGoal || 1) * 100).toFixed(1)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                />
              </div>
              <div className="text-gray-400 text-sm mt-1">
                ₹{Math.max(0, (data?.savingsGoal || 0) - (data?.currentSavings || 0)).toLocaleString()} to goal
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Spending Breakdown */}
        {/* Shared Add Transaction Modal */}
        <AddTransactionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchDashboardData();
          }}
        />
        <div className="bg-[#1a1a2e] rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Monthly Spending Breakdown</h2>
          <p className="text-gray-400 mb-6">Your spending categorized by type</p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              {data?.expenseBreakdown.map((expense) => (
                <div key={expense.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`
                      ${expense.category === 'Education' ? 'text-purple-400' :
                        expense.category === 'Entertainment' ? 'text-blue-400' :
                        expense.category === 'Food' ? 'text-green-400' :
                        expense.category === 'Healthcare' ? 'text-yellow-400' :
                        'text-gray-400'}
                    `}>
                      {expense.category}
                    </span>
                    <span className="text-white">₹{expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-800">
                      <div 
                        style={{ width: `${expense.percentage}%` }} 
                        className={`
                          ${expense.category === 'Education' ? 'bg-purple-500' :
                            expense.category === 'Entertainment' ? 'bg-blue-500' :
                            expense.category === 'Food' ? 'bg-green-500' :
                            expense.category === 'Healthcare' ? 'bg-yellow-500' :
                            'bg-gray-500'}
                        `}
                      />
                    </div>
                    <span className="text-gray-500 text-xs mt-1">{expense.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
