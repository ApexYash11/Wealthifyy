'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useFinancialData } from '@/hooks/use-financial-data';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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
  if (total === 0) {
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

  const series = [
    {
      data: expenseData,
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: { show: false },
      background: 'transparent',
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 8,
        barHeight: '40%',
        distributed: true,
        dataLabels: {
          position: 'right',
        },
      },
    },
    colors,
    dataLabels: {
      enabled: true,
      formatter: function (val: number, opts: any) {
        const percent = total ? ((val / total) * 100).toFixed(0) : 0;
        return `₹${val.toLocaleString()}  |  ${percent}%`;
      },
      style: {
        fontWeight: 700,
        fontSize: '15px',
        colors: isDark
          ? ['#fff']
          : ['#222'],
        textShadow: isDark
          ? '0 1px 4px rgba(0,0,0,0.7)'
          : '0 1px 4px rgba(255,255,255,0.7)',
      },
      offsetX: 10,
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 2,
        color: isDark ? '#000' : '#fff',
        opacity: 0.3,
      },
    },
    xaxis: {
      categories: categories.map(cat => cat.label),
      labels: {
        style: {
          colors: isDark ? '#fff' : '#222',
          fontSize: '12px',
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: isDark ? '#fff' : '#222',
          fontSize: '12px',
        },
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `₹${val.toLocaleString()}`;
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={350}
        />
      </CardContent>
    </Card>
  );
} 