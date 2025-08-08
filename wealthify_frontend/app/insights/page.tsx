"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI } from '@/lib/api';

interface InsightData {
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  topCategory: string;
  topCategoryAmount: number;
  totalSpending: number;
  savingsRate: number;
  budgetUtilization: number;
  recommendations: string[];
  alerts: string[];
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      // The backend will identify the user from the auth token
      const response = await expenseAPI.getExpenses('current_user'); // Placeholder user ID
      
      // Mock insights data - in real app, this would come from backend
      const mockInsights: InsightData = {
        spendingTrend: 'increasing',
        topCategory: 'Food & Dining',
        topCategoryAmount: 850,
        totalSpending: 2500,
        savingsRate: 35,
        budgetUtilization: 78,
        recommendations: [
          'Consider meal prepping to reduce food expenses',
          'Your entertainment spending is 20% higher than last month',
          'Great job on maintaining a 35% savings rate!',
          'Consider setting up automatic savings transfers'
        ],
        alerts: [
          'You\'re approaching your monthly budget limit',
          'Transportation expenses increased by 15% this month'
        ]
      };
      
      setInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching insights:', error);
      toast({
        title: 'Error',
        description: 'Failed to load insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No insights available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Financial Insights
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analysis of your spending patterns and recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Insights */}
          <div className="lg:col-span-2 space-y-6">
            {/* Spending Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  Spending Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Spending</span>
                      <span className="font-semibold">${insights.totalSpending.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-4 w-4 ${insights.spendingTrend === 'increasing' ? 'text-red-600' : 'text-green-600'}`} />
                      <span className="text-sm text-gray-600">
                        {insights.spendingTrend === 'increasing' ? 'Trending up' : 'Trending down'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Top Category</span>
                      <span className="font-semibold">{insights.topCategory}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      ${insights.topCategoryAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Budget Utilization</span>
                    <span className="text-sm font-medium">{insights.budgetUtilization}%</span>
                  </div>
                  <Progress value={insights.budgetUtilization} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Savings Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Savings Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {insights.savingsRate}%
                  </div>
                  <p className="text-gray-600">Current Savings Rate</p>
                  <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Excellent! You're saving more than the recommended 20% of your income.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {insights.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.alerts.map((alert, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        {alert}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-gray-600" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Average</span>
                  <span className="font-semibold">$2,450</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Category</span>
                  <span className="font-semibold">Savings</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days to Budget</span>
                  <span className="font-semibold">8 days</span>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Smart Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    💡 Set up automatic transfers to savings
                  </div>
                  <div className="text-sm text-gray-600">
                    💡 Review subscriptions monthly
                  </div>
                  <div className="text-sm text-gray-600">
                    💡 Use cashback cards for purchases
                  </div>
                  <div className="text-sm text-gray-600">
                    💡 Track every expense for better insights
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 