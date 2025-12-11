'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useFinancialData } from '@/hooks/use-financial-data';
import AddTransactionModal from '@/components/add-transaction-modal';
import authAPI from '@/lib/auth-api';

export default function DashboardContent() {
  const { data, loading, error, refreshData, updateSavingsGoal } = useFinancialData();
  const [showBalance, setShowBalance] = useState(true);
  const [editingGoal, setEditingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const formatPercentage = (current: number, previous: number) => {
    if (previous === 0) {
      if (current > 0) return "+100.0%";
      if (current < 0) return "-100.0%";
      return "0.0%";
    }
    const change = ((current - previous) / Math.abs(previous)) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(1)}%`;
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        if (user) {
          const name = user.user_metadata?.name || user.user_metadata?.full_name || user.email;
          setUserName(name);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleGoalSave = async () => {
    if (!newGoal || isNaN(Number(newGoal))) {
      toast({
        title: "Invalid Goal",
        description: "Please enter a valid number for your savings goal.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSavingsGoal(Number(newGoal));
      setEditingGoal(false);
      setNewGoal("");
      toast({
        title: "Goal Updated",
        description: "Your savings goal has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update savings goal. Please try again.",
        variant: "destructive",
      });
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
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Unable to load dashboard
          </h2>
          <p className="text-gray-400">{error}</p>
          <div className="flex justify-center space-x-4 mt-6">
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => refreshData()}
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, <span className="text-purple-500">{userName || 'User'}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
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
          <div className="bg-white dark:bg-[#1a1a2e] shadow-sm dark:shadow-none rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Total Balance</h3>
              <svg className="w-6 h-6 text-purple-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ₹{data?.totalBalance.toLocaleString()}
            </div>
            <div className={`text-sm ${((data?.totalBalance || 0) - (data?.lastMonthBalance || 0)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data?.totalBalance || 0, data?.lastMonthBalance || 0)} from last month
            </div>
          </div>

          {/* Monthly Income */}
          <div className="bg-white dark:bg-[#1a1a2e] shadow-sm dark:shadow-none rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Monthly Income</h3>
              <svg className="w-6 h-6 text-green-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ₹{data?.monthlyIncome.toLocaleString()}
            </div>
            <div className={`text-sm ${((data?.monthlyIncome || 0) - (data?.lastMonthIncome || 0)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data?.monthlyIncome || 0, data?.lastMonthIncome || 0)} from last month
            </div>
          </div>

          {/* Monthly Expenses */}
          <div className="bg-white dark:bg-[#1a1a2e] shadow-sm dark:shadow-none rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Monthly Expenses</h3>
              <svg className="w-6 h-6 text-red-500" fill="none" strokeWidth={2} stroke="currentColor" viewBox="0 0 24 24">
                <path d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              ₹{data?.monthlyExpenses.toLocaleString()}
            </div>
            <div className={`text-sm ${((data?.monthlyExpenses || 0) - (data?.lastMonthExpenses || 0)) <= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercentage(data?.monthlyExpenses || 0, data?.lastMonthExpenses || 0)} from last month
            </div>
          </div>

          {/* Savings Goal */}
          <div className="bg-white dark:bg-[#1a1a2e] shadow-sm dark:shadow-none rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-500 dark:text-gray-400">Savings Goal</h3>
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
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {editingGoal ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder={data?.savingsGoal.toString()}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded w-32 text-lg"
                    autoFocus
                  />
                  <button
                    onClick={handleGoalSave}
                    className="text-green-500 hover:text-green-400 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingGoal(false)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                showBalance ? `₹${data?.savingsGoal.toLocaleString()}` : '••••••'
              )}
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                <div
                  style={{ width: `${((data?.currentSavings || 0) / (data?.savingsGoal || 1) * 100).toFixed(1)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                />
              </div>
              <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">
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
            refreshData();
          }}
        />
        <div className="bg-white dark:bg-[#1a1a2e] shadow-sm dark:shadow-none rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending Breakdown</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Your spending categorized by type</p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              {data?.spendingCategories.map((expense) => (
                <div key={expense.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={expense.color.replace('bg-', 'text-').replace('500', '400')}>
                      {expense.category}
                    </span>
                    <span className="text-gray-900 dark:text-white">₹{expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100 dark:bg-gray-800">
                      <div 
                        style={{ width: `${expense.percentage}%` }} 
                        className={expense.color}
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
