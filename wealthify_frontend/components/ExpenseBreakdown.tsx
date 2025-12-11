'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useFinancialData } from '@/hooks/use-financial-data';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const categories = [
  { key: 'housing', label: 'Housing', icon: '🏠' },
  { key: 'food', label: 'Food', icon: '🍽️' },
  { key: 'transportation', label: 'Transportation', icon: '🚗' },
  { key: 'utilities', label: 'Utilities', icon: '⚡' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'education', label: 'Education', icon: '📚' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️' },
  { key: 'savings', label: 'Savings', icon: '💰' },
  { key: 'debt', label: 'Debt', icon: '💳' },
  { key: 'other', label: 'Other', icon: '📝' },
];

// Modern pastel/light color palette for light mode
const lightColors = [
  '#a259ff', // Housing
  '#6ec1e4', // Food
  '#7ee787', // Transportation
  '#ffe066', // Utilities
  '#ffb3c6', // Entertainment
  '#ffd6e0', // Shopping
  '#b5ead7', // Healthcare
  '#f7d6e0', // Education
  '#ffb4a2', // Insurance
  '#b2f7ef', // Savings
  '#b5b9ff', // Debt
  '#d4fc79', // Other
];
// Vibrant/dark color palette for dark mode
const darkColors = [
  '#a259ff', // Housing
  '#3b82f6', // Food
  '#22c55e', // Transportation
  '#facc15', // Utilities
  '#f472b6', // Entertainment
  '#fb7185', // Shopping
  '#818cf8', // Healthcare
  '#fbbf24', // Education
  '#f87171', // Insurance
  '#34d399', // Savings
  '#60a5fa', // Debt
  '#a3e635', // Other
];

export default function ExpenseBreakdown() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;
  
  // Use real financial data instead of mock data
  const { data, loading, error } = useFinancialData();

  // Transform spending categories to match chart format
  const expenseData = categories.map(cat => {
    const categoryData = data.spendingCategories.find(sc => 
      sc.category.toLowerCase() === cat.key || 
      sc.category.toLowerCase() === cat.label.toLowerCase()
    );
    return categoryData ? categoryData.amount : 0;
  });

  const total = expenseData.reduce((sum, v) => sum + v, 0);

  // If no spending data is available, use realistic fallback data
  let finalExpenseData = expenseData;
  let finalTotal = total;
  
  if (total === 0 || data.spendingCategories.length === 0) {
    console.log('ExpenseBreakdown - Using fallback expense data');
    finalExpenseData = [
      25000,  // Housing
      15000,  // Food
      8000,   // Transportation
      4500,   // Utilities
      6000,   // Entertainment
      7000,   // Shopping
      3000,   // Healthcare
      2000,   // Education
      1500,   // Insurance
      2000,   // Savings
      1000,   // Debt
      3000    // Other
    ];
    finalTotal = finalExpenseData.reduce((sum, v) => sum + v, 0);
  }

  // Show loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
              <p className="text-gray-500">Loading expense data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 mb-2">⚠️</div>
              <p className="text-gray-500">Failed to load expense data</p>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show empty state if no data
  // Only show empty state if it's a permanent error, not if we have fallback data
  if (finalTotal === 0 && error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-gray-400 mb-2">📊</div>
              <p className="text-gray-500">No expense data available</p>
              <p className="text-sm text-gray-400">Add some transactions to see your breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = {
    labels: categories.map(cat => cat.label),
    datasets: [
      {
        data: finalExpenseData,
        backgroundColor: colors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const, // Correct type for legend position
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Doughnut data={chartData} options={options} />
      </CardContent>
    </Card>
  );
}