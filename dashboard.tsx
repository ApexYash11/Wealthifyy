"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import AddTransactionModal from "./components/add-transaction-modal"
import EditSavingsModal from "./components/edit-savings-modal"
import { useFinancialData } from "./hooks/use-financial-data"
import { Toaster } from "./components/toaster"

export default function Dashboard() {
  const { data, addTransaction, updateSavings, updateSavingsGoal, resetData } = useFinancialData()
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false)
  const [isEditSavingsModalOpen, setIsEditSavingsModalOpen] = useState(false)

  const quickActions = [
    { title: "Send Money", icon: <Wallet className="h-5 w-5" />, color: "bg-blue-500" },
    { title: "Add Card", icon: <CreditCard className="h-5 w-5" />, color: "bg-purple-500" },
    { title: "Pay Bills", icon: <IndianRupee className="h-5 w-5" />, color: "bg-green-500" },
    { title: "Settings", icon: <Settings className="h-5 w-5" />, color: "bg-orange-500" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 p-4 border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl">YASH</span>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">YASH</p>
              <p className="text-sm text-muted-foreground">Premium Member</p>
            </div>
          </div>

          <nav className="space-y-2">
            {["Dashboard", "Transactions", "Cards", "Savings", "Investments", "Settings"].map((item) => (
              <Button
                key={item}
                variant={item === "Dashboard" ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                {item}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome back, YASH
            </h1>
            <p className="text-muted-foreground">Here's your financial overview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"></span>
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-purple-600"
              onClick={() => setIsAddTransactionModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <IndianRupee className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.totalBalance.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <ArrowUpCircle className="h-4 w-4 text-green-500 mr-1" />
                <p className="text-xs text-green-500">+2.5% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
              <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <ArrowUpCircle className="h-4 w-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.monthlyIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Last updated today</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <ArrowDownCircle className="h-4 w-4 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.monthlyExpenses.toLocaleString()}</div>
              <div className="flex items-center mt-1">
                <ArrowUpCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-xs text-red-500">+12% from last month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsEditSavingsModalOpen(true)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <PiggyBank className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{data.currentSavings.toLocaleString()}</div>
              <Progress value={(data.currentSavings / data.savingsGoal) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ₹{(data.savingsGoal - data.currentSavings).toLocaleString()} to goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="spending" className="space-y-4">
          <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
            <TabsTrigger
              value="spending"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
            >
              Spending Breakdown
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
            >
              Recent Transactions
            </TabsTrigger>
            <TabsTrigger
              value="investments"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12"
            >
              Investments
            </TabsTrigger>
          </TabsList>

          {/* Spending Breakdown Tab */}
          <TabsContent value="spending">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Breakdown</CardTitle>
                <CardDescription>Your spending categorized by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {data.spendingCategories.map((category) => (
                    <div key={category.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${category.color}`} />
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-muted-foreground">₹{category.amount.toLocaleString()}</span>
                        </div>
                        <span className="text-sm font-medium">{category.percentage}%</span>
                      </div>
                      <Progress value={category.percentage} className={`h-2 ${category.color}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your latest financial activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {transaction.icon}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.date}</p>
                        </div>
                      </div>
                      <span
                        className={`font-medium ${transaction.type === "expense" ? "text-red-500" : "text-green-500"}`}
                      >
                        {transaction.type === "expense" ? "-" : "+"}₹{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Investment Portfolio</CardTitle>
                    <CardDescription>Your investment performance</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage Portfolio
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Stock Portfolio</p>
                          <p className="text-sm text-muted-foreground">15 stocks</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹12,450.00</p>
                        <p className="text-sm text-green-500">+5.2% this month</p>
                      </div>
                    </div>
                    <Progress value={75} className="h-2 bg-blue-200" />
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-purple-500 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">Crypto Portfolio</p>
                          <p className="text-sm text-muted-foreground">4 currencies</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹3,200.00</p>
                        <p className="text-sm text-red-500">-2.1% this month</p>
                      </div>
                    </div>
                    <Progress value={45} className="h-2 bg-purple-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        onAddTransaction={addTransaction}
      />

      <EditSavingsModal
        isOpen={isEditSavingsModalOpen}
        onClose={() => setIsEditSavingsModalOpen(false)}
        currentSavings={data.currentSavings}
        savingsGoal={data.savingsGoal}
        onUpdateSavings={updateSavings}
        onUpdateGoal={updateSavingsGoal}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  )
}
