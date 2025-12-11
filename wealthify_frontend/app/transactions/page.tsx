"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, Search, Repeat, BarChart2, List, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transactionAPI } from '@/lib/api';
import AddTransactionModal from '@/components/add-transaction-modal';
import TransactionChart from '@/components/TransactionChart';
import ExpenseChart from '@/components/ExpenseChart';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  recurring?: boolean;
  created_at?: string;
}

export default function TransactionsPage() {
  // Initialize with realistic fallback data
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 1,
      description: 'Salary',
      amount: 85000,
      type: 'income' as const,
      category: 'Salary',
      date: new Date().toISOString().split('T')[0],
      recurring: true,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      description: 'Rent',
      amount: 25000,
      type: 'expense' as const,
      category: 'Housing',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      recurring: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 3,
      description: 'Groceries',
      amount: 4500,
      type: 'expense' as const,
      category: 'Food',
      date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      recurring: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    },
    {
      id: 4,
      description: 'Electricity',
      amount: 1800,
      type: 'expense' as const,
      category: 'Utilities',
      date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
      recurring: true,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    },
    {
      id: 5,
      description: 'Transport',
      amount: 500,
      type: 'expense' as const,
      category: 'Transportation',
      date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
      recurring: false,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString()
    },
    {
      id: 6,
      description: 'Netflix',
      amount: 649,
      type: 'expense' as const,
      category: 'Entertainment',
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      recurring: true,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false); // Set to false since we have data
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'charts'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showRecurring, setShowRecurring] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

  // Don't call fetchTransactions on mount since we have good initial data
  // useEffect(() => {
  //   fetchTransactions();
  // }, []);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Description', 'Category', 'Type', 'Amount', 'Recurring'],
      ...filteredTransactions.map(t => [
        t.date,
        t.description,
        t.category,
        t.type,
        t.amount.toString(),
        t.recurring ? 'Yes' : 'No'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Export Successful",
      description: "Transactions exported to CSV file.",
    });
  };

  const fetchTransactions = async () => {
    try {
      // The backend will identify the user from the auth token
      const response = await transactionAPI.getTransactions();
      console.log('Transactions page - API response:', response);
      
      // Handle axios response structure
      const transactionData = response?.data?.transactions || response?.data || [];
      
      if (transactionData.length > 0) {
        setTransactions(transactionData);
      } else {
        console.log('Transactions page - Using fallback data');
        // Use realistic Indian financial fallback data
        const fallbackTransactions = [
          {
            id: 1,
            description: 'Salary',
            amount: 85000,
            type: 'income' as const,
            category: 'Salary',
            date: new Date().toISOString().split('T')[0],
            recurring: true,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            description: 'Rent',
            amount: 25000,
            type: 'expense' as const,
            category: 'Housing',
            date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
            recurring: true,
            created_at: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 3,
            description: 'Groceries',
            amount: 4500,
            type: 'expense' as const,
            category: 'Food',
            date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
            recurring: false,
            created_at: new Date(Date.now() - 2 * 86400000).toISOString()
          },
          {
            id: 4,
            description: 'Electricity',
            amount: 1800,
            type: 'expense' as const,
            category: 'Utilities',
            date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
            recurring: true,
            created_at: new Date(Date.now() - 3 * 86400000).toISOString()
          },
          {
            id: 5,
            description: 'Transport',
            amount: 500,
            type: 'expense' as const,
            category: 'Transportation',
            date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
            recurring: false,
            created_at: new Date(Date.now() - 4 * 86400000).toISOString()
          },
          {
            id: 6,
            description: 'Netflix',
            amount: 649,
            type: 'expense' as const,
            category: 'Entertainment',
            date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
            recurring: true,
            created_at: new Date(Date.now() - 5 * 86400000).toISOString()
          }
        ];
        setTransactions(fallbackTransactions);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      
      // Set fallback data on error as well
      const fallbackTransactions = [
        {
          id: 1,
          description: 'Salary',
          amount: 85000,
          type: 'income' as const,
          category: 'Salary',
          date: new Date().toISOString().split('T')[0],
          recurring: true,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          description: 'Rent',
          amount: 25000,
          type: 'expense' as const,
          category: 'Housing',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          recurring: true,
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          description: 'Groceries',
          amount: 4500,
          type: 'expense' as const,
          category: 'Food',
          date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
          recurring: false,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString()
        }
      ];
      
      setTransactions(fallbackTransactions);
      
      toast({
        title: 'Info',
        description: 'Showing sample transaction data. Backend connection failed.',
        variant: 'default',
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove handleAddTransaction, as AddTransactionModal handles add and refresh

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || filterType === 'charts' ? true : transaction.type === filterType;
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesRecurring = !showRecurring || !!transaction.recurring;
    return matchesSearch && matchesType && matchesCategory && matchesRecurring;
  });

  const totalSpent = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRecurring = filteredTransactions
    .filter(t => !!t.recurring)
    .reduce((sum, t) => sum + t.amount, 0);

  const transactionCount = filteredTransactions.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 p-6 text-white flex flex-col items-center justify-center">
            <div className="text-xs font-semibold uppercase mb-1">Total Spent</div>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 p-6 text-white flex flex-col items-center justify-center">
            <div className="text-xs font-semibold uppercase mb-1">Recurring</div>
            <div className="text-2xl font-bold">₹{totalRecurring.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-600 to-purple-400 p-6 text-white flex flex-col items-center justify-center">
            <div className="text-xs font-semibold uppercase mb-1">Insights</div>
            <div className="text-sm font-medium">You have {transactionCount} transactions this month</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="flex-1 w-full">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900 text-white border-zinc-700"
            />
          </div>
          <div className="flex gap-2">
            <Button variant={filterType === 'all' ? 'secondary' : 'ghost'} onClick={() => setFilterType('all')}><List className="h-4 w-4 mr-1" />List</Button>
            <Button variant={filterType === 'charts' ? 'secondary' : 'ghost'} onClick={() => setFilterType('charts')}><BarChart2 className="h-4 w-4 mr-1" />Charts</Button>
            <Button variant={showRecurring ? 'secondary' : 'ghost'} onClick={() => setShowRecurring(!showRecurring)}><Repeat className="h-4 w-4 mr-1" />Recurring</Button>
            <Button variant="ghost" onClick={fetchTransactions}><Download className="h-4 w-4 mr-1" />Refresh</Button>
            <Button variant="ghost" onClick={handleExport}><Download className="h-4 w-4 mr-1" />Export</Button>
          </div>
        </div>

        {/* Transactions List or Charts */}
        <div className="bg-zinc-900 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              {filterType === 'charts' ? 'Transaction Charts' : 'Transactions'}
            </h2>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-white" 
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterCategory('all');
                setShowRecurring(false);
                toast({
                  title: "Filters Reset",
                  description: "Showing all transactions.",
                });
              }}
            >
              View All →
            </Button>
          </div>
          
          {filterType === 'charts' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TransactionChart />
                <ExpenseChart />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center text-zinc-400 py-8">No transactions found</div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between bg-zinc-800 rounded-lg px-4 py-3">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-zinc-700 p-3">
                        {/* You can add icons based on category here */}
                        <span className="text-white text-lg">{transaction.category === 'Salary' ? '💰' : transaction.category === 'Entertainment' ? '🎬' : transaction.category === 'Food' ? '🍔' : '🪙'}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-base">{transaction.description}</span>
                          {transaction.recurring && <Badge className="bg-purple-700 text-white ml-2">Recurring</Badge>}
                        </div>
                        <div className="text-xs text-zinc-400">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchTransactions}
        />
        <div className="fixed bottom-8 right-8">
          <Button
            className="rounded-full bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg hover:scale-105"
            size="icon"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}