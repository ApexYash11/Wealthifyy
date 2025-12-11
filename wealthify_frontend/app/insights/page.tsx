"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Zap, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import { useFinancialContext } from '@/context/financial-context';
import { calculateHealthScore, analyzeTrends, generateSuggestions } from '@/lib/insights-logic';

export default function InsightsPage() {
  const { transactions, summary, spendingCategories, loading } = useFinancialContext();

  // Calculate Insights
  const healthScore = calculateHealthScore(
    summary.monthlyIncome,
    summary.monthlyExpenses,
    summary.savingsGoal,
    summary.currentSavings
  );

  const trends = analyzeTrends(transactions);
  const suggestions = generateSuggestions(
    spendingCategories,
    summary.monthlyIncome,
    summary.monthlyExpenses
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-24 md:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Financial Insights</h1>
        <p className="text-muted-foreground">AI-powered analysis of your financial health.</p>
      </div>

      {/* Health Score Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 bg-gradient-to-br from-purple-900 to-gray-900 border-purple-500/20">
          <CardHeader>
            <CardTitle className="text-white">Financial Health Score</CardTitle>
            <CardDescription className="text-purple-200">Based on your spending & savings</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {summary.monthlyIncome === 0 ? (
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-white/10">
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Income Missing</p>
                  <p className="text-sm text-purple-200 mt-1">Add your income to calculate your score.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="relative flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      className="text-purple-900/50"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="currentColor"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={351.86}
                      strokeDashoffset={351.86 - (351.86 * healthScore) / 100}
                      className={`text-purple-500 transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <span className="absolute text-4xl font-bold text-white">{healthScore}</span>
                </div>
                <p className="mt-4 text-sm text-purple-200 text-center">
                  {healthScore >= 80 ? "Excellent! You're a financial wizard." : 
                   healthScore >= 50 ? "Good job, but there's room to improve." : 
                   healthScore > 0 ? "Needs attention. Let's optimize your budget." :
                   "Expenses exceed income. Time to review!"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50 border border-border/50">
                  <div className={`p-2 rounded-full shrink-0 ${
                    suggestion.type === 'warning' ? 'bg-red-500/10 text-red-500' :
                    suggestion.type === 'success' ? 'bg-green-500/10 text-green-500' :
                    'bg-blue-500/10 text-blue-500'
                  }`}>
                    {suggestion.type === 'warning' ? <AlertTriangle className="h-5 w-5" /> :
                     suggestion.type === 'success' ? <CheckCircle className="h-5 w-5" /> :
                     <Lightbulb className="h-5 w-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{suggestion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Spending Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Breakdown</CardTitle>
            <CardDescription>Where your money went this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {spendingCategories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No spending data available.</div>
              ) : spendingCategories.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      <span className="font-medium">{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">{cat.percentage.toFixed(1)}%</span>
                      <span className="font-bold">₹{cat.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Progress value={cat.percentage} className={`h-2 ${cat.color.replace('bg-', 'text-')}`} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>Recurring payments and unusual spikes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trends.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                  <div className="p-3 bg-secondary rounded-full">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-medium">No trends detected yet</p>
                  <p className="text-xs text-muted-foreground max-w-[250px]">
                    We need a bit more transaction history to identify recurring payments or spending spikes.
                  </p>
                </div>
              ) : trends.map((trend, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      trend.type === 'recurring' ? 'bg-blue-500/10 text-blue-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {trend.type === 'recurring' ? <RefreshCw className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{trend.label}</p>
                      <p className="text-xs text-muted-foreground">{trend.description}</p>
                    </div>
                  </div>
                  <Badge variant={trend.type === 'recurring' ? 'secondary' : 'destructive'}>
                    {trend.type === 'recurring' ? 'Recurring' : 'Spike'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
