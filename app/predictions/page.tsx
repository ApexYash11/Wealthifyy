'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, TrendingUp, Calculator, DollarSign } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI } from '@/lib/api';
import { mockExpenseAPI } from '@/lib/mockApi';

const predictionSchema = z.object({
  income: z.number().min(1, 'Income must be greater than 0'),
  month: z.string().min(1, 'Please select a month'),
});

type PredictionForm = z.infer<typeof predictionSchema>;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PredictionsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [expensePrediction, setExpensePrediction] = useState<number | null>(null);
  const [savingsPrediction, setSavingsPrediction] = useState<number | null>(null);
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PredictionForm>({
    resolver: zodResolver(predictionSchema),
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const onSubmit = async (data: PredictionForm) => {
    if (!user) return;

    setIsLoading(true);
    setExpensePrediction(null);
    setSavingsPrediction(null);

    try {
      const predictionData = {
        income: data.income,
        user_id: user.id,
        month: data.month,
      };

      // Get both predictions using mock API for testing
      const [expenseResponse, savingsResponse] = await Promise.all([
        mockExpenseAPI.predictExpense(predictionData),
        mockExpenseAPI.predictSavings(predictionData),
      ]);

      setExpensePrediction(expenseResponse.data.prediction || expenseResponse.data.total);
      setSavingsPrediction(savingsResponse.data.prediction || savingsResponse.data.savings);

      toast({
        title: 'Success',
        description: 'Predictions generated successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to generate predictions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const watchedValues = watch();
  const income = watchedValues.income || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Financial Predictions
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calculator className="w-5 h-5" />
                  <span>Prediction Input</span>
                </CardTitle>
                <CardDescription>
                  Enter your income and select a month to get AI-powered predictions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="income">Monthly Income</Label>
                    <Input
                      id="income"
                      type="number"
                      step="0.01"
                      placeholder="Enter your monthly income"
                      {...register('income', { valueAsNumber: true })}
                      className={errors.income ? 'border-red-500' : ''}
                    />
                    {errors.income && (
                      <p className="text-sm text-red-500">{errors.income.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select onValueChange={(value) => setValue('month', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.month && (
                      <p className="text-sm text-red-500">{errors.month.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isLoading ? 'Generating Predictions...' : 'Generate Predictions'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Predictions Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expense Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-600">
                  <DollarSign className="w-5 h-5" />
                  <span>Predicted Expenses</span>
                </CardTitle>
                <CardDescription>
                  AI prediction of your total expenses for the selected month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {expensePrediction !== null ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-red-600 mb-2">
                      {formatCurrency(expensePrediction)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Predicted total expenses for {watchedValues.month}
                    </p>
                    {income > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          This represents {(expensePrediction / income * 100).toFixed(1)}% of your income
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Enter your income and select a month to see expense predictions.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Savings Prediction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-600">
                  <TrendingUp className="w-5 h-5" />
                  <span>Predicted Savings</span>
                </CardTitle>
                <CardDescription>
                  AI prediction of your potential savings for the selected month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savingsPrediction !== null ? (
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {formatCurrency(savingsPrediction)}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Predicted savings for {watchedValues.month}
                    </p>
                    {income > 0 && expensePrediction !== null && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          This represents {(savingsPrediction / income * 100).toFixed(1)}% of your income
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Net income after expenses: {formatCurrency(income - expensePrediction)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Enter your income and select a month to see savings predictions.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Our AI Predictions Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Historical Analysis</h4>
                <p>Our AI analyzes your past spending patterns to understand your financial behavior.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Seasonal Trends</h4>
                <p>We consider seasonal variations and monthly patterns in your spending habits.</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Income Correlation</h4>
                <p>Predictions are adjusted based on your income level and spending-to-income ratios.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 