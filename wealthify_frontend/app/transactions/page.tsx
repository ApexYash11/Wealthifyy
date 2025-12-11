"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, Plus, Search, Repeat, BarChart2, List, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFinancialContext } from '@/context/financial-context';
import AddTransactionModal from '@/components/add-transaction-modal';
import TransactionChart from '@/components/TransactionChart';
import ExpenseChart from '@/components/ExpenseChart';

export default function TransactionsPage() {
  const { transactions, summary, loading, error, refreshData } = useFinancialContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'charts'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showRecurring, setShowRecurring] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();

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

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || filterType === 'charts' ? true : t.type === filterType;
    const matchesCategory = filterCategory === 'all' ? true : t.category === filterCategory;
    const matchesRecurring = showRecurring ? t.recurring : true;
    
    return matchesSearch && matchesType && matchesCategory && matchesRecurring;
  });

  // Calculate totals from context summary (Source of Truth)
  const totalIncome = summary.monthlyIncome;
  const totalExpenses = summary.monthlyExpenses;
  const totalTransactions = transactions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-red-500 text-xl">Error loading transactions</div>
        <Button onClick={() => refreshData()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-24 md:pb-6">
      {/* Summary Cards - Using Global Context Values */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Monthly Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-purple-200 mt-1">
              Based on current month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Monthly Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-purple-200 mt-1">
              Based on current month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-400 to-purple-500 border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">
              Total Transactions
            </CardTitle>
            <List className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-purple-200 mt-1">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
          <div className="flex bg-secondary rounded-lg p-1">
            <Button
              variant={filterType === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('all')}
              className={filterType === 'all' ? 'bg-background shadow-sm' : ''}
            >
              <List className="h-4 w-4 mr-2" /> List
            </Button>
            <Button
              variant={filterType === 'charts' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setFilterType('charts')}
              className={filterType === 'charts' ? 'bg-background shadow-sm' : ''}
            >
              <BarChart2 className="h-4 w-4 mr-2" /> Charts
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button
            variant={showRecurring ? "secondary" : "outline"}
            size="icon"
            onClick={() => setShowRecurring(!showRecurring)}
            title="Toggle Recurring"
          >
            <Repeat className={`h-4 w-4 ${showRecurring ? 'text-purple-600' : ''}`} />
          </Button>

          <Button variant="outline" size="sm" onClick={() => refreshData()}>
            Refresh
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* Content */}
      {filterType === 'charts' ? (
        <div className="grid gap-6 md:grid-cols-2">
          <TransactionChart transactions={transactions} />
          <ExpenseChart transactions={transactions} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found matching your filters.
                </div>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {transaction.type === 'income' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{transaction.date}</span>
                          {transaction.recurring && (
                            <Badge variant="secondary" className="text-xs">Recurring</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`font-bold ${
                      transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          refreshData();
          setIsAddModalOpen(false);
        }}
      />
    </div>
  );
}