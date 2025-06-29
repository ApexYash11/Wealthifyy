'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ExpenseBreakdown from './ExpenseBreakdown';

const mockTransactions = [
  { date: '2025-06-01', description: 'Grocery Shopping', amount: -1200, category: 'Food' },
  { date: '2025-06-02', description: 'Salary', amount: 5200, category: 'Income' },
  { date: '2025-06-03', description: 'Electricity Bill', amount: -350, category: 'Utilities' },
  { date: '2025-06-04', description: 'Movie Night', amount: -300, category: 'Entertainment' },
];

const mockInvestments = [
  { date: '2025-05-15', type: 'Mutual Fund', amount: 2000, status: 'Active' },
  { date: '2025-04-10', type: 'Stocks', amount: 1500, status: 'Active' },
  { date: '2025-03-20', type: 'FD', amount: 5000, status: 'Matured' },
];

export default function DashboardTabs() {
  return (
    <Tabs defaultValue="breakdown" className="w-full mb-8">
      <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex gap-2">
        <TabsTrigger value="breakdown" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">Spending Breakdown</TabsTrigger>
        <TabsTrigger value="transactions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">Recent Transactions</TabsTrigger>
        <TabsTrigger value="investments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-900 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md px-4 py-2 font-semibold">Investments</TabsTrigger>
      </TabsList>
      <TabsContent value="breakdown">
        <ExpenseBreakdown />
      </TabsContent>
      <TabsContent value="transactions">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4">
          <div className="font-bold text-lg mb-2">Recent Transactions</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Category</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2">{tx.date}</td>
                  <td className="py-2">{tx.description}</td>
                  <td className="py-2">{tx.category}</td>
                  <td className={`py-2 text-right font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>{tx.amount < 0 ? '-' : ''}₹{Math.abs(tx.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
      <TabsContent value="investments">
        <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm p-4">
          <div className="font-bold text-lg mb-2">Investments</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">Status</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {mockInvestments.map((inv, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-2">{inv.date}</td>
                  <td className="py-2">{inv.type}</td>
                  <td className="py-2">{inv.status}</td>
                  <td className="py-2 text-right font-semibold text-blue-700">₹{inv.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TabsContent>
    </Tabs>
  );
} 