'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExpenseBreakdown from './ExpenseBreakdown';
import { useFinancialData } from '@/hooks/use-financial-data';

export default function DashboardTabs() {
  const { data, loading, error } = useFinancialData();

  // Show loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-gray-500">Failed to load dashboard data</p>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Transform recent transactions for display
  const recentTransactions = data.recentTransactions.map(tx => ({
    date: tx.date,
    description: tx.description,
    amount: tx.type === 'income' ? tx.amount : -tx.amount,
    category: tx.category,
  }));

  // Mock investments data (since we don't have real investment data yet)
  // This should be replaced with real investment data when available
  const investments = [
    { date: '2025-05-15', type: 'Mutual Fund', amount: 2000, status: 'Active' },
    { date: '2025-04-10', type: 'Stocks', amount: 1500, status: 'Active' },
    { date: '2025-03-20', type: 'FD', amount: 5000, status: 'Matured' },
  ];

  return (
    <Tabs defaultValue="breakdown" className="w-full">
      <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex gap-2">
        <TabsTrigger value="breakdown" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">
          Spending Breakdown
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">
          Recent Transactions
        </TabsTrigger>
        <TabsTrigger value="investments" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">
          Investments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="breakdown">
        <ExpenseBreakdown />
      </TabsContent>

      <TabsContent value="transactions">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${tx.amount > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{tx.description}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{tx.category} • {tx.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent transactions</p>
                <p className="text-sm">Add some transactions to see them here</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="investments">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
            {investments.length > 0 ? (
              <div className="space-y-3">
                {investments.map((inv, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{inv.type}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{inv.date} • {inv.status}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      ₹{inv.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No investments yet</p>
                <p className="text-sm">Start investing to see your portfolio here</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
} 