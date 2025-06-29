"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, BarChart2, Repeat, CheckCircle } from "lucide-react";

// Mock data
const summary = [
  { label: "Total Spend", value: "₹12,500", icon: <BarChart2 className="w-7 h-7 text-purple-400" /> },
  { label: "Top Category", value: "Food", icon: <TrendingUp className="w-7 h-7 text-pink-400" /> },
  { label: "Savings Rate", value: "18%", icon: <CheckCircle className="w-7 h-7 text-green-400" /> },
];

const categoryInsights = [
  { category: "Food", amount: 4500, percent: 36 },
  { category: "Utilities", amount: 2200, percent: 18 },
  { category: "Shopping", amount: 1800, percent: 14 },
  { category: "Entertainment", amount: 1200, percent: 10 },
];

const trends = [
  { label: "Netflix", type: "Recurring", icon: <Repeat className="w-5 h-5 text-blue-400" /> },
  { label: "Electric Bill", type: "Spike", icon: <TrendingUp className="w-5 h-5 text-red-400" /> },
];

const suggestions = [
  "Try meal prepping to save on food costs.",
  "Switch to a cheaper mobile plan.",
];

export default function InsightsPage() {
  return (
    <div className="flex flex-col gap-8 p-10 max-w-6xl mx-auto">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summary.map((item) => (
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
              {categoryInsights.map((cat) => (
                <div key={cat.category} className="flex items-center gap-4">
                  <div className="w-28 text-lg font-semibold">{cat.category}</div>
                  <Progress value={cat.percent} className="flex-1 h-4 bg-purple-950" />
                  <div className="w-24 text-right text-lg">₹{cat.amount.toLocaleString("en-IN")}</div>
                  <div className="w-14 text-right text-base text-purple-200">{cat.percent}%</div>
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
              {suggestions.map((tip, i) => (
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
            <div className="h-48 flex items-center justify-center text-purple-200 text-xl">[Charts/Graphs/Heatmaps]</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 