"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, PieChart, TrendingUp } from "lucide-react";

// Mock data
const portfolio = {
  value: 125000,
  gain: 8500,
  gainPercent: 7.3,
  assets: 6,
  health: "good", // good, warning, bad
};

const allocation = [
  { label: "Stocks", percent: 45, value: 56250, color: "#a259ff" },
  { label: "Mutual Funds", percent: 30, value: 37500, color: "#6ec1e4" },
  { label: "Crypto", percent: 15, value: 18750, color: "#ffb366" },
  { label: "Cash", percent: 10, value: 12500, color: "#b5ead7" },
];

const performance = [
  { date: "2024-06-01", value: 120000 },
  { date: "2024-06-08", value: 122500 },
  { date: "2024-06-15", value: 124000 },
  { date: "2024-06-22", value: 125000 },
];

export default function InvestmentsPage() {
  return (
    <div className="flex flex-col gap-8 p-10 max-w-6xl mx-auto">
      {/* Portfolio Overview */}
      <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 px-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            💼 Portfolio Overview
          </CardTitle>
          <span className={`text-lg font-semibold px-3 py-1 rounded-full ${portfolio.gain >= 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
            {portfolio.gain >= 0 ? <ArrowUpRight className="inline w-5 h-5 mr-1 text-green-400" /> : <ArrowDownRight className="inline w-5 h-5 mr-1 text-red-400" />}
            {portfolio.gain >= 0 ? '+' : ''}{portfolio.gainPercent}%
          </span>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4 flex flex-wrap gap-8 items-center">
          <div className="flex flex-col gap-2 min-w-[180px]">
            <div className="text-lg text-gray-300">Total Value</div>
            <div className="text-3xl font-extrabold">₹{portfolio.value.toLocaleString('en-IN')}</div>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            <div className="text-lg text-gray-300">Assets</div>
            <div className="text-3xl font-extrabold">{portfolio.assets}</div>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            <div className="text-lg text-gray-300">Overall Gain/Loss</div>
            <div className={`text-2xl font-bold ${portfolio.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>{portfolio.gain >= 0 ? '+' : ''}₹{portfolio.gain.toLocaleString('en-IN')}</div>
          </div>
        </CardContent>
      </Card>

      {/* Asset Allocation */}
      <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 px-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            🌀 Asset Allocation
            <PieChart className="w-6 h-6 text-purple-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4 flex flex-col md:flex-row gap-8 items-center">
          {/* Pie chart placeholder */}
          <div className="w-48 h-48 flex items-center justify-center rounded-full bg-[#18181a] border border-[#232325]">
            <span className="text-purple-300 text-lg">[Pie Chart]</span>
          </div>
          {/* Legend */}
          <div className="flex-1 flex flex-col gap-4">
            {allocation.map((a) => (
              <div key={a.label} className="flex items-center gap-4">
                <span className="inline-block w-4 h-4 rounded-full" style={{ background: a.color }}></span>
                <span className="w-32 font-semibold">{a.label}</span>
                <span className="w-20 text-right">₹{a.value.toLocaleString('en-IN')}</span>
                <span className="w-12 text-right text-purple-300">{a.percent}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tracking */}
      <Card className="bg-[#111113] text-white shadow-lg p-8 rounded-2xl border border-[#232325]">
        <CardHeader className="flex flex-row items-center justify-between pb-4 px-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" /> Performance Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-0 pb-4">
          {/* Line chart placeholder */}
          <div className="w-full h-48 flex items-center justify-center rounded-xl bg-[#18181a] border border-[#232325] mb-6">
            <span className="text-green-300 text-lg">[Line Chart]</span>
          </div>
          {/* Recent performance table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-lg">
              <thead>
                <tr className="text-purple-300">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Portfolio Value</th>
                </tr>
              </thead>
              <tbody>
                {performance.map((p) => (
                  <tr key={p.date} className="border-b border-[#232325] last:border-0">
                    <td className="py-2 pr-4">{p.date}</td>
                    <td className="py-2 pr-4">₹{p.value.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 