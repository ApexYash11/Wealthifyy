'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

export default function ExpenseTable() {
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading expenses...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Expenses</CardTitle>
          <div className="flex gap-2">
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
            <Button onClick={fetchExpenses} variant="outline" size="sm">
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No expenses found for the selected period.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Food</TableHead>
                <TableHead>Transportation</TableHead>
                <TableHead>Entertainment</TableHead>
                <TableHead>Shopping</TableHead>
                <TableHead>Healthcare</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Housing</TableHead>
                <TableHead>Utilities</TableHead>
                <TableHead>Insurance</TableHead>
                <TableHead>Savings</TableHead>
                <TableHead>Debt</TableHead>
                <TableHead>Other</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{expense.month}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.food)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.transportation)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.entertainment)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.shopping)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.healthcare)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.education)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.housing)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.utilities)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.insurance)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.savings)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.debt)}</TableCell>
                  <TableCell>{formatCurrency(expense.categories.other)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(expense.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
} 