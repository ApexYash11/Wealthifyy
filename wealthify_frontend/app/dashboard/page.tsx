"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PiggyBank,
  TrendingUp,
  Plus,
  Bell,
  Settings,
  CreditCard,
  Wallet,
  ChevronRight,
  IndianRupee,
  Edit,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import AddTransactionModal from "@/components/add-transaction-modal";
import EditSavingsModal from "@/components/edit-savings-modal";
import { useFinancialData } from "@/hooks/use-financial-data";
import { Toaster } from "@/components/toaster";
import { Doughnut, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from 'chart.js';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { formatRupees } from '@/lib/utils';
import ThemeToggle from '@/components/ThemeToggle';

ChartJS.register(ArcElement, ChartTooltip, ChartLegend, LineElement, PointElement, LinearScale, CategoryScale);

export default function DashboardPage() {
  const { data, addTransaction, updateSavings, updateSavingsGoal, loading, error } = useFinancialData();
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isEditSavingsModalOpen, setIsEditSavingsModalOpen] = useState(false);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || !isAuthenticated) {
    return null; // or a spinner
  }

  if (loading) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your financial data...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const quickActions = [
    { title: "Send Money", icon: <Wallet className="h-5 w-5" />, color: "bg-blue-500" },
    { title: "Add Card", icon: <CreditCard className="h-5 w-5" />, color: "bg-purple-500" },
    { title: "Pay Bills", icon: <IndianRupee className="h-5 w-5" />, color: "bg-green-500" },
    { title: "Settings", icon: <Settings className="h-5 w-5" />, color: "bg-orange-500" },
  ];

  // Prepare data for charts
  const investments = data.investments || [];
  const portfolioHistory = data.portfolioHistory || [];
  const assetLabels = investments.map((inv: any) => inv.name);
  const assetValues = investments.map((inv: any) => inv.value);
  const pieData = {
    labels: assetLabels,
    datasets: [
      {
        data: assetValues,
        backgroundColor: [
          '#a259ff',
          '#6ec1e4',
          '#ffb366',
          '#b5ead7',
          '#f67280',
          '#355c7d',
        ],
        borderWidth: 1,
      },
    ],
  };
  const lineData = {
    labels: portfolioHistory.map((h: any) => new Date(h.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Portfolio Value',
        data: portfolioHistory.map((h: any) => h.value),
        borderColor: '#a259ff',
        backgroundColor: 'rgba(162,89,255,0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Define vibrantColors for both chart and breakdown
  const vibrantColors = [
    'rgba(162,89,255,0.9)', 'rgba(110,193,228,0.9)', 'rgba(126,231,135,0.9)', 'rgba(255,224,102,0.9)', 'rgba(255,179,198,0.9)',
    'rgba(255,214,224,0.9)', 'rgba(181,234,215,0.9)', 'rgba(247,214,224,0.9)', 'rgba(255,180,162,0.9)', 'rgba(178,247,239,0.9)',
    'rgba(181,185,255,0.9)', 'rgba(212,252,121,0.9)',
  ];
  // Map each category to its color by index
  const categoryColorMap = Object.fromEntries(
    data.spendingCategories.map((cat, idx) => [cat.category, vibrantColors[idx % vibrantColors.length]])
  );

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <ThemeToggle />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Account Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your account summary goes here.</p>
          <Button className="mt-4">Add Funds</Button>
        </CardContent>
      </Card>
    </div>
  );
}
