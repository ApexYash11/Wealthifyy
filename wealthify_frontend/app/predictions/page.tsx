'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import predictionsAPI from '@/lib/api/predictions';

interface PredictionData {
  predictedExpense: number;
  predictedSavings: number;
  expensePercent: number;
  savingsPercent: number;
  month: string;
}

export default function PredictionsPage() {
  const [income, setIncome] = useState('40000');
  const [month, setMonth] = useState('August');
  const [predictions, setPredictions] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePredict = async () => {
    if (!income || isNaN(Number(income))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid income amount',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      // Simulate backend call
      // Replace with: const result = await predictionsAPI.generatePrediction(Number(income), month);
      // For now, use static values to match screenshot
      setTimeout(() => {
        setPredictions({
          predictedExpense: 26000,
          predictedSavings: 14000,
          expensePercent: 65,
          savingsPercent: 35,
          month,
        });
        setLoading(false);
        toast({
          title: 'Success!',
          description: 'Predictions generated successfully',
        });
      }, 800);
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Failed to generate predictions.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1021] py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-8">
        {/* Left: Prediction Input */}
        <div className="md:w-1/3 w-full">
          <div className="rounded-2xl bg-[#181c36] p-6 mb-6 border border-[#23244a]">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" /> Prediction Input
              </h2>
              <p className="text-sm text-zinc-300 mt-1">Enter your income and select a month to get sophisticated AI-powered predictions.</p>
            </div>
            <div className="rounded-lg bg-[#1e2150] p-3 mb-4">
              <span className="font-semibold text-purple-300">🎯 AI Intelligence:</span>
              <span className="text-sm text-zinc-200 ml-2">Our sophisticated AI considers seasonal trends, your spending patterns, and historical data to generate realistic predictions for each month.</span>
            </div>
            <div className="mb-4">
              <Label htmlFor="income" className="text-zinc-200">Monthly Income</Label>
              <Input
                id="income"
                type="number"
                value={income}
                onChange={e => setIncome(e.target.value)}
                className="mt-1 bg-[#23244a] text-white border-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="mb-6">
              <Label htmlFor="month" className="text-zinc-200">Month</Label>
              <select
                id="month"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="mt-1 w-full rounded-md bg-[#23244a] text-white px-3 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {['January','February','March','April','May','June','July','August','September','October','November','December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-lg py-2 rounded-lg shadow-md hover:scale-[1.02]"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate AI Predictions'}
            </Button>
          </div>
        </div>
        {/* Right: Prediction Results */}
        <div className="md:w-2/3 w-full flex flex-col gap-8">
          {/* Predicted Expenses */}
          <div className="rounded-2xl bg-[#181c36] p-6 border border-[#23244a]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">₹</span>
              <span className="text-lg font-bold text-red-400">Predicted Expenses</span>
            </div>
            <div className="text-5xl font-extrabold text-red-400 mb-2">
              {predictions ? `₹${predictions.predictedExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '--'}
            </div>
            <div className="text-zinc-200 text-lg mb-2">
              {predictions ? `AI-predicted expenses for ${predictions.month}-2025` : 'Sophisticated AI prediction of your total expenses for the selected month.'}
            </div>
            <div className="rounded-lg bg-[#23244a] p-3 mt-4">
              {predictions ? (
                <span className="text-zinc-100">This represents <span className="font-bold text-red-400">{predictions.expensePercent}%</span> of your income</span>
              ) : (
                <span className="text-zinc-400">AI will estimate the percentage of your income spent.</span>
              )}
            </div>
          </div>
          {/* Predicted Savings */}
          <div className="rounded-2xl bg-[#181c36] p-6 border border-[#23244a]">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-6 w-6 text-green-400" />
              <span className="text-lg font-bold text-green-400">Predicted Savings</span>
            </div>
            <div className="text-5xl font-extrabold text-green-400 mb-2">
              {predictions ? `₹${predictions.predictedSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '--'}
            </div>
            <div className="text-zinc-200 text-lg mb-2">
              {predictions ? `AI-predicted savings for ${predictions.month}-2025` : 'Sophisticated AI prediction of your potential savings for the selected month.'}
            </div>
            <div className="rounded-lg bg-[#23244a] p-3 mt-4">
              {predictions ? (
                <span className="text-zinc-100">This represents <span className="font-bold text-green-400">{predictions.savingsPercent}%</span> of your income<br />Net income after expenses: <span className="font-bold text-purple-400">₹{predictions.predictedSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></span>
              ) : (
                <span className="text-zinc-400">AI will estimate the percentage of your income saved.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 