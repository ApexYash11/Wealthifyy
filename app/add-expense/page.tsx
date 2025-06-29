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
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { expenseAPI, ExpenseCategory } from '@/lib/api';
import { mockExpenseAPI } from '@/lib/mockApi';

const expenseSchema = z.object({
  month: z.string().min(1, 'Please select a month'),
  food: z.number().min(0, 'Amount must be non-negative'),
  transportation: z.number().min(0, 'Amount must be non-negative'),
  entertainment: z.number().min(0, 'Amount must be non-negative'),
  shopping: z.number().min(0, 'Amount must be non-negative'),
  healthcare: z.number().min(0, 'Amount must be non-negative'),
  education: z.number().min(0, 'Amount must be non-negative'),
  housing: z.number().min(0, 'Amount must be non-negative'),
  utilities: z.number().min(0, 'Amount must be non-negative'),
  insurance: z.number().min(0, 'Amount must be non-negative'),
  savings: z.number().min(0, 'Amount must be non-negative'),
  debt: z.number().min(0, 'Amount must be non-negative'),
  other: z.number().min(0, 'Amount must be non-negative'),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const categories = [
  { key: 'food', label: 'Food & Dining', icon: '🍽️' },
  { key: 'transportation', label: 'Transportation', icon: '🚗' },
  { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { key: 'shopping', label: 'Shopping', icon: '🛍️' },
  { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { key: 'education', label: 'Education', icon: '📚' },
  { key: 'housing', label: 'Housing', icon: '🏠' },
  { key: 'utilities', label: 'Utilities', icon: '⚡' },
  { key: 'insurance', label: 'Insurance', icon: '🛡️' },
  { key: 'savings', label: 'Savings', icon: '💰' },
  { key: 'debt', label: 'Debt Payments', icon: '💳' },
  { key: 'other', label: 'Other', icon: '📝' },
];

export default function AddExpensePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      food: 0,
      transportation: 0,
      entertainment: 0,
      shopping: 0,
      healthcare: 0,
      education: 0,
      housing: 0,
      utilities: 0,
      insurance: 0,
      savings: 0,
      debt: 0,
      other: 0,
    },
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const onSubmit = async (data: ExpenseForm) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const expenseData = {
        user_id: user.id,
        month: data.month,
        categories: {
          food: data.food,
          transportation: data.transportation,
          entertainment: data.entertainment,
          shopping: data.shopping,
          healthcare: data.healthcare,
          education: data.education,
          housing: data.housing,
          utilities: data.utilities,
          insurance: data.insurance,
          savings: data.savings,
          debt: data.debt,
          other: data.other,
        } as ExpenseCategory,
      };

      // Use mock API for testing - replace with expenseAPI.addExpense(expenseData) when backend is ready
      await mockExpenseAPI.addExpense(expenseData);
      toast({
        title: 'Success',
        description: 'Expense added successfully!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add expense',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const watchedValues = watch();
  const total = Object.values(watchedValues).reduce((sum, value) => {
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Add Expense
            </h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter Your Monthly Expenses</CardTitle>
            <CardDescription>
              Fill in the amounts for each expense category. You can leave categories at $0 if they don't apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Month Selection */}
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

              {/* Expense Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map((category) => (
                  <div key={category.key} className="space-y-2">
                    <Label htmlFor={category.key} className="flex items-center space-x-2">
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </Label>
                    <Input
                      id={category.key}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(category.key as keyof ExpenseForm, { valueAsNumber: true })}
                      className={errors[category.key as keyof ExpenseForm] ? 'border-red-500' : ''}
                    />
                    {errors[category.key as keyof ExpenseForm] && (
                      <p className="text-sm text-red-500">
                        {errors[category.key as keyof ExpenseForm]?.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Total Display */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total Expenses:</span>
                  <span className="text-blue-600">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 