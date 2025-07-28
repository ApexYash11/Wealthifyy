'use client';

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { transactionAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatRupees } from '@/lib/utils';

interface Transaction {
  id: number;
  type: "income" | "expense";
  description: string;
  amount: number;
  date: string;
  category: string;
  recurring?: boolean;
}

const COLORS = [
  '#10B981', // Green for income
  '#EF4444', // Red for expenses
  '#3B82F6', // Blue
  '#F59E0B', // Orange
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F43F5E', // Rose
];

const categoryIcons: Record<string, string> = {
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Gift: "🎁",
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Utilities: "⚡",
  Entertainment: "🎬",
  Shopping: "🛒",
  Healthcare: "🏥",
  Education: "📚",
  Personal: "👤",
  Other: "📋",
};

export default function TransactionChart() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const periods = [
    { value: 'all', label: 'All Time' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'this_year', label: 'This Year' },
  ];

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user, selectedPeriod]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await transactionAPI.getTransactions(parseInt(user.id), 1000);
      setTransactions(response.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to fetch transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByPeriod = (transactions: Transaction[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      
      switch (selectedPeriod) {
        case 'this_month':
          return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
        case 'last_month':
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          return txDate.getMonth() === lastMonth && txDate.getFullYear() === lastMonthYear;
        case 'this_year':
          return txDate.getFullYear() === currentYear;
        default:
          return true;
      }
    });
  };

  const prepareChartData = () => {
    const filteredTransactions = filterTransactionsByPeriod(transactions);
    
    const categoryTotals: { [key: string]: number } = {};
    
    filteredTransactions.forEach(tx => {
      const category = tx.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += Math.abs(tx.amount);
    });

    const chartData = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        icon: categoryIcons[category] || "📋"
      }))
      .sort((a, b) => b.value - a.value);

    return chartData;
  };

  const chartData = prepareChartData();
  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Transaction Breakdown</h3>
        </div>
        <div className="text-center py-8 text-gray-400">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Transaction Breakdown</h3>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40 bg-[#232325] border-gray-700 text-white">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent className="bg-[#232325] border-gray-700">
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value} className="text-white hover:bg-gray-700">
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        {chartData.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No transaction data available for the selected period.
          </div>
        ) : (
          <>
            <div className="h-96 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-[#18181a] border border-gray-700 rounded-lg p-2 shadow-lg text-sm">
                            <div className="text-white font-medium">
                              {categoryIcons[data.name as string] || "📋"} {data.name}
                            </div>
                            <div className="text-purple-400 font-semibold">
                              {formatRupees(data.value as number)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                    wrapperStyle={{ outline: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 