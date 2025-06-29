'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { expenseAPI } from '@/lib/api';
import { mockExpenseAPI } from '@/lib/mockApi';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ExpenseData {
  month: string;
  categories: {
    food: number;
    transportation: number;
    entertainment: number;
    shopping: number;
    healthcare: number;
    education: number;
    housing: number;
    utilities: number;
    insurance: number;
    savings: number;
    debt: number;
    other: number;
  };
  total: number;
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FFC658', '#FF6B6B', '#4ECDC4', '#45B7D1',
  '#96CEB4', '#FFEAA7'
];

export default function ExpenseChart() {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user, selectedMonth]);

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Use mock API for testing - replace with expenseAPI.getExpenses(user.id, selectedMonth) when backend is ready
      const response = await mockExpenseAPI.getExpenses(user.id, selectedMonth === 'all' ? undefined : selectedMonth);
      setExpenses(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch expenses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const prepareChartData = () => {
    if (expenses.length === 0) return [];

    // If a specific month is selected, show that month's data
    if (selectedMonth !== 'all') {
      const monthData = expenses.find(exp => exp.month === selectedMonth);
      if (!monthData) return [];

      return Object.entries(monthData.categories)
        .filter(([_, value]) => value > 0)
        .map(([key, value]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value,
        }));
    }

    // If no month selected, aggregate all months
    const aggregatedData: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      Object.entries(expense.categories).forEach(([category, amount]) => {
        aggregatedData[category] = (aggregatedData[category] || 0) + amount;
      });
    });

    return Object.entries(aggregatedData)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
      }));
  };

  const chartData = prepareChartData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Expense Breakdown</CardTitle>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All months</SelectItem>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expense data available for the selected period.
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 