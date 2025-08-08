'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign, Target, Brain, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI } from '@/lib/api';

interface PredictionData {
  predictedExpense: number;
  predictedSavings: number;
  confidence: number;
  recommendations: string[];
}

export default function PredictionsPage() {
  const [income, setIncome] = useState('');
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
      // The backend will identify the user from the auth token
      const response = await expenseAPI.predictExpense({
        income: Number(income),
        user_id: 'current_user', // Placeholder user ID
        month: new Date().toISOString().slice(0, 7), // Current month
      });

      setPredictions(response.data);
      toast({
        title: 'Success!',
        description: 'Predictions generated successfully',
      });
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate predictions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            AI Financial Predictions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get AI-powered insights about your future expenses and savings
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Generate Predictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="Enter your monthly income"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handlePredict} 
                disabled={loading || !income}
                className="w-full"
              >
                {loading ? 'Generating...' : 'Generate Predictions'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Predictions Display */}
        {predictions && (
          <div className="space-y-6">
            {/* Predicted Expenses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Predicted Monthly Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    ${predictions.predictedExpense.toLocaleString()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Based on your income and spending patterns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Predicted Savings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Predicted Monthly Savings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    ${predictions.predictedSavings.toLocaleString()}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Potential savings based on your income
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Confidence Level */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Prediction Confidence
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="text-sm font-medium">{predictions.confidence}%</span>
                  </div>
                  <Progress value={predictions.confidence} className="h-2" />
                  <p className="text-sm text-gray-600">
                    Based on historical data and spending patterns
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {predictions.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Predictions State */}
        {!predictions && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Ready to Get Predictions?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Enter your monthly income above to generate AI-powered financial predictions
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 