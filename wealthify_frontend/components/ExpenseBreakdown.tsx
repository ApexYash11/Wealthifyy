'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes';

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

// Mock data for demonstration
const mockData = {
  housing: 1200,
  food: 600,
  transportation: 400,
  utilities: 350,
  entertainment: 300,
  shopping: 250,
  healthcare: 1000,
  education: 0,
  insurance: 200,
  savings: 500,
  debt: 300,
  other: 100,
};

const total = Object.values(mockData).reduce((sum, v) => sum + v, 0);

export default function ExpenseBreakdown() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const series = [
    {
      data: categories.map(cat => mockData[cat.key]),
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
      categories: categories.map(cat => `${cat.icon} ${cat.label}`),
      labels: {
        style: {
          fontSize: '16px',
          fontWeight: 600,
          colors: isDark ? '#fff' : '#222',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '16px',
          fontWeight: 600,
          colors: isDark ? '#fff' : '#222',
        },
      },
    },
    grid: {
      borderColor: isDark ? '#22223b' : '#f3f4f6',
      row: { colors: [isDark ? '#181825' : '#fff', isDark ? '#23233a' : '#f9fafb'], opacity: 0.5 },
    },
    tooltip: {
      y: {
        formatter: (val: number) => `₹${val.toLocaleString()}`,
      },
      theme: isDark ? 'dark' : 'light',
    },
    legend: { show: false },
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Monthly Spending Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <ReactApexChart options={options} series={series} type="bar" height={420} />
        </div>
      </CardContent>
    </Card>
  );
} 