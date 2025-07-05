"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, BarChart2, Repeat, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dashboardAPI } from "@/lib/api";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface FinancialSummary {
  total_balance: number;
  monthly_income: number;
  monthly_expenses: number;
  savings_goal: number;
  current_savings: number;
  last_month_expenses?: number;
  last_month_income?: number;
}

export default function InsightsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const loadInsightsData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);
        const response = await dashboardAPI.getDashboardData(parseInt(user.id));
        const data = response.data;
        
        setSummary(data.summary);
        setSpendingCategories(data.spending_categories);
      } catch (err) {
        console.error("Error loading insights data:", err);
        setError("Failed to load insights data");
      } finally {
        setLoading(false);
      }
    };

    loadInsightsData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Insights</h2>
          <p className="text-muted-foreground mb-4">{error || "No data available"}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = [
    { 
      label: "Total Spend", 
      value: `₹${summary.monthly_expenses.toLocaleString()}`, 
      icon: <BarChart2 className="w-7 h-7 text-purple-400" /> 
    },
    { 
      label: "Top Category", 
      value: spendingCategories.length > 0 ? spendingCategories[0].category : "N/A", 
      icon: <TrendingUp className="w-7 h-7 text-pink-400" /> 
    },
    { 
      label: "Savings Rate", 
      value: summary.monthly_income > 0 ? `${Math.round((summary.current_savings / summary.monthly_income) * 100)}%` : "0%", 
      icon: <CheckCircle className="w-7 h-7 text-green-400" /> 
    },
  ];

  const trends = [
    { label: "Monthly Expenses", type: summary.monthly_expenses > 0 ? "Active" : "No Data", icon: <TrendingUp className="w-5 h-5 text-blue-400" /> },
    { label: "Savings Progress", type: summary.current_savings > 0 ? "Growing" : "Start Saving", icon: <Repeat className="w-5 h-5 text-green-400" /> },
  ];

  const biggestCategory = spendingCategories.length > 0 ? spendingCategories[0] : null;
  const lastMonthExpenses = summary.last_month_expenses ?? 0;
  const lastMonthIncome = summary.last_month_income ?? 0;

  const suggestions = [
    summary.monthly_expenses > summary.monthly_income * 0.8
      ? "Your expenses are high. Consider reducing non-essential spending."
      : "Great job keeping expenses under control!",

    summary.current_savings < summary.savings_goal * 0.5
      ? "Try to increase your savings rate to reach your goal faster."
      : "You're on track with your savings goal!",

    spendingCategories.length > 0 && spendingCategories[0].percentage > 40
      ? `Your ${spendingCategories[0].category} spending is high. Consider budgeting for this category.`
      : "Your spending is well distributed across categories.",

    summary.current_savings === 0
      ? "You haven't saved anything this month. Try to set aside a portion of your income."
      : null,

    biggestCategory
      ? `Your largest category spend was ₹${biggestCategory.amount.toLocaleString("en-IN")} on ${biggestCategory.category}.`
      : null,

    lastMonthExpenses > 0
      ? `Your expenses have ${summary.monthly_expenses > lastMonthExpenses ? "increased" : "decreased"} by ${Math.abs(((summary.monthly_expenses - lastMonthExpenses) / lastMonthExpenses) * 100).toFixed(1)}% compared to last month.`
      : null,

    lastMonthIncome > 0
      ? `Your income has ${summary.monthly_income > lastMonthIncome ? "increased" : "decreased"} by ${Math.abs(((summary.monthly_income - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1)}% compared to last month.`
      : null,
  ].filter(Boolean);

  // Filter to keep only 3 suggestions: 2 text and 1 number-based
  const textSuggestions = suggestions.filter(s => !/\d/.test(s));
  const numberSuggestions = suggestions.filter(s => /\d/.test(s));
  const limitedSuggestions = [
    ...textSuggestions.slice(0, 2),
    ...numberSuggestions.slice(0, 1),
  ];

  return (
    <div className="flex flex-col gap-8 p-10 max-w-6xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((item) => (
          <Card key={item.label} className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-4">
              <CardTitle className="text-2xl font-bold">{item.label}</CardTitle>
              {item.icon}
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="text-4xl font-extrabold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Insights */}
        <Card className="bg-[#111113] text-white p-8 rounded-2xl border border-[#232325]">
          <CardHeader className="pb-4 px-4">
            <CardTitle className="text-2xl font-bold">Categories</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            <div className="space-y-4">
              {spendingCategories.map((cat) => (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className="w-28 text-lg font-semibold">{cat.category}</div>
                  <Progress value={cat.percentage} className="flex-1 h-4 bg-purple-950" />
                  <div className="w-24 text-right text-lg">₹{cat.amount.toLocaleString("en-IN")}</div>
                  <div className="w-14 text-right text-base text-purple-200">{cat.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Detection */}
        <Card className="bg-[#111113] text-white p-8 rounded-2xl border border-[#232325]">
          <CardHeader className="pb-4 px-4">
            <CardTitle className="text-2xl font-bold">Trends</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            <ul className="space-y-3">
              {trends.map((trend, i) => (
                <li key={i} className="flex items-center gap-3 text-lg">
                  {trend.icon}
                  <span className="font-semibold">{trend.label}</span>
                  <span className="ml-2 px-3 py-1 rounded bg-purple-800 text-base text-purple-200">{trend.type}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card className="bg-[#111113] text-white p-8 rounded-2xl border border-[#232325]">
          <CardHeader className="pb-4 px-4">
            <CardTitle className="text-2xl font-bold">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            <ul className="list-disc pl-8 space-y-3 text-lg">
              {limitedSuggestions.map((tip, i) => (
                <li key={i} className="text-purple-100">{tip}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Visuals (Placeholder for charts/graphs) */}
        <Card className="bg-[#111113] text-white p-8 rounded-2xl border border-[#232325]">
          <CardHeader className="pb-4 px-4">
            <CardTitle className="text-2xl font-bold">Visuals</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pt-0 pb-4">
            {spendingCategories.length > 0 ? (
              <Bar
                data={{
                  labels: spendingCategories.map(cat => cat.category),
                  datasets: [
                    {
                      label: 'Spending by Category',
                      data: spendingCategories.map(cat => cat.amount),
                      backgroundColor: 'rgba(168, 85, 247, 0.7)',
                      borderRadius: 8,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    title: { display: false },
                  },
                  scales: {
                    x: { grid: { color: '#232325' }, ticks: { color: '#fff' } },
                    y: { grid: { color: '#232325' }, ticks: { color: '#fff' } },
                  },
                }}
                height={180}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-purple-200 text-xl">No category data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 