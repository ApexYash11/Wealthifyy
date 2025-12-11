'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { transactionAPI } from '@/lib/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface TransactionData {
  category: string;
  amount: number;
  count: number;
}

export default function TransactionChart() {
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    try {
      // Use the updated API call without parameters
      const response = await transactionAPI.getTransactions();
      console.log('Transaction chart response:', response);
      
      // Handle Axios response - data is in response.data
      const transactions = response?.data?.transactions || response?.data || [];
      const categoryMap = new Map<string, { amount: number; count: number }>();
      
      transactions.forEach((transaction: any) => {
        const category = transaction.category;
        if (categoryMap.has(category)) {
          const existing = categoryMap.get(category)!;
          existing.amount += transaction.amount;
          existing.count += 1;
        } else {
          categoryMap.set(category, { amount: transaction.amount, count: 1 });
        }
      });
      
      const processedData = Array.from(categoryMap.entries()).map(([category, data]) => ({
        category,
        amount: data.amount,
        count: data.count,
      }));
      
      console.log('Processed transaction chart data:', processedData);
      setTransactionData(processedData);
    } catch (error) {
      console.error('Error fetching transaction data:', error);
      // Set fallback data for the chart
      setTransactionData([
        { category: 'Housing', amount: 25000, count: 1 },
        { category: 'Food', amount: 16500, count: 5 },
        { category: 'Transportation', amount: 1700, count: 3 },
        { category: 'Utilities', amount: 3599, count: 2 },
        { category: 'Entertainment', amount: 800, count: 1 },
        { category: 'Shopping', amount: 2500, count: 1 },
        { category: 'Healthcare', amount: 650, count: 1 },
        { category: 'Salary', amount: 85000, count: 1 },
        { category: 'Freelance', amount: 15000, count: 1 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: transactionData.map(item => item.category),
    datasets: [
      {
        label: 'Amount Spent',
        data: transactionData.map(item => item.amount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Transaction Count',
        data: transactionData.map(item => item.count * 100), // Scale for visibility
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading chart...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {transactionData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No transaction data available</p>
          </div>
        ) : (
          <div className="h-64">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 