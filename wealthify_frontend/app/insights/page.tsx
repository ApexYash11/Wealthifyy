"use client";

import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap } from 'lucide-react';
import { useFinancialData } from '@/hooks/use-financial-data';

export default function InsightsPage() {
  const { data, loading } = useFinancialData();

  // Category breakdown from real data
  const categoryBreakdown = data.spendingCategories.map(cat => ({
    name: cat.category,
    amount: cat.amount,
    percent: cat.percentage,
  }));

  // Simple trend detection: recurring = appears >1x, spike = amount > 2x avg
  const trends: { label: string; type: 'recurring' | 'spike' }[] = [];
  const descCount: Record<string, number> = {};
  const descAmount: Record<string, number[]> = {};
  data.recentTransactions.forEach(tx => {
    descCount[tx.description] = (descCount[tx.description] || 0) + 1;
    if (!descAmount[tx.description]) descAmount[tx.description] = [];
    descAmount[tx.description].push(tx.amount);
  });
  Object.keys(descCount).forEach(desc => {
    if (descCount[desc] > 1) trends.push({ label: desc, type: 'recurring' });
    const amounts = descAmount[desc];
    if (amounts.length > 1) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      if (amounts.some(a => a > 2 * avg)) trends.push({ label: desc, type: 'spike' });
    }
  });

  // Suggestions based on spending patterns
  const suggestions: string[] = [];
  
  if (categoryBreakdown.length === 0) {
    suggestions.push('Add transactions to get personalized insights!');
    suggestions.push('Track your house rent, groceries, and transportation expenses for better insights.');
    suggestions.push('Consider setting up automatic tracking for recurring expenses.');
  } else {
    // Housing suggestions
    if (categoryBreakdown.some(c => c.name.toLowerCase().includes('rent') && c.percent > 40)) {
      suggestions.push('Your rent is over 40% of expenses. Consider finding a more affordable place or taking a roommate.');
    }
    
    // Food suggestions
    if (categoryBreakdown.some(c => (c.name.toLowerCase().includes('food') || c.name.toLowerCase().includes('groceries')) && c.percent > 25)) {
      suggestions.push('Try meal prepping and cooking at home to save on food costs.');
    }
    
    // Transportation suggestions
    if (categoryBreakdown.some(c => c.name.toLowerCase().includes('transport') && c.percent > 15)) {
      suggestions.push('Consider using public transport, metro, or carpooling to reduce transportation costs.');
    }
    
    // Entertainment suggestions
    if (categoryBreakdown.some(c => c.name.toLowerCase().includes('entertainment') && c.percent > 10)) {
      suggestions.push('Review your entertainment subscriptions (Netflix, Spotify, etc.) for potential savings.');
    }
    
    // Shopping suggestions
    if (categoryBreakdown.some(c => c.name.toLowerCase().includes('shopping') && c.percent > 15)) {
      suggestions.push('Set a monthly shopping budget and stick to it. Consider waiting 24 hours before making non-essential purchases.');
    }
    
    // General financial health suggestions
    const totalExpensePercent = categoryBreakdown.reduce((sum, cat) => sum + cat.percent, 0);
    if (totalExpensePercent > 80) {
      suggestions.push('Your expenses are quite high. Try to aim for the 50/30/20 rule: 50% needs, 30% wants, 20% savings.');
    }
    
    // Positive suggestions
    if (data.currentSavings > data.monthlyExpenses * 3) {
      suggestions.push('Great job! You have a good emergency fund. Consider investing in mutual funds or stocks.');
    } else if (data.currentSavings > 0) {
      suggestions.push('Keep building your emergency fund. Aim for 3-6 months of expenses as emergency savings.');
    }
    
    // Default helpful suggestions if no specific patterns found
    if (suggestions.length === 0) {
      suggestions.push('Consider using a budgeting app to track your expenses better.');
      suggestions.push('Set up automatic savings to pay yourself first each month.');
      suggestions.push('Review your subscriptions monthly and cancel unused ones.');
    }
  }

  return (
    <div className="min-h-screen bg-[#0e1021] py-8">
      <div className="max-w-3xl mx-auto px-4 flex flex-col gap-6">
        {/* Category Breakdown */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-500 p-6 mb-2">
          <h2 className="text-xl font-bold text-white mb-4">Spending Breakdown</h2>
          {categoryBreakdown.length === 0 ? (
            <div className="text-zinc-200">No data yet.</div>
          ) : categoryBreakdown.map((cat, idx) => (
            <div key={cat.name} className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">{cat.name}</span>
              <div className="flex-1 mx-4">
                <Progress value={cat.percent} className="h-2 bg-purple-900" />
              </div>
              <span className="text-white font-semibold">₹{cat.amount.toLocaleString('en-IN')}</span>
              <span className="ml-2 text-white text-sm">{cat.percent}%</span>
            </div>
          ))}
        </div>

        {/* Trend Detection */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-500 p-6 mb-2">
          <h2 className="text-xl font-bold text-white mb-4">Trend Detection</h2>
          <div className="flex flex-col gap-2">
            {trends.length === 0 ? (
              <div className="text-zinc-200">No trends detected yet.</div>
            ) : trends.map((trend, idx) => (
              <div key={trend.label + trend.type} className="flex items-center gap-3">
                {trend.type === 'recurring' ? (
                  <RefreshCw className="h-5 w-5 text-blue-200" />
                ) : (
                  <Zap className="h-5 w-5 text-orange-300" />
                )}
                <span className="font-medium text-white">{trend.label}</span>
                <Badge className={`ml-2 ${trend.type === 'recurring' ? 'bg-blue-600' : 'bg-orange-600'} text-white`}>{trend.type === 'recurring' ? 'Recurring' : 'Spike'}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-700 to-purple-500 p-6 mb-2">
          <h2 className="text-xl font-bold text-white mb-4">Suggestions</h2>
          <ul className="list-disc pl-6 text-white space-y-2">
            {suggestions.length === 0 ? (
              <li>Add more transactions to get personalized suggestions!</li>
            ) : suggestions.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ul>
        </div>

        {/* No Visuals section as per latest design */}
      </div>
    </div>
  );
}