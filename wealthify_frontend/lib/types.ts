export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
  current_savings: number;
  savings_goal: number;
  avatar_url: string;
}

export interface FinancialData {
  id: string;
  user_id: string;
  total_income: number;
  total_expenses: number;
  current_savings: number;
  savings_goal: number;
  monthly_budget: number;
  budget_used: number;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  user_id: number;
  name: string;
  symbol: string;
  quantity: number;
  buy_price: number;
  buy_date: string;
  type: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  type: 'income' | 'expense';
  description: string;
  amount: number;
  category: string;
  date: string;
  created_at: string;
  recurring: boolean;
}

export interface Expense {
  id: number;
  user_id: number;
  month: string;
  rent: number;
  loan_repayment: number;
  insurance: number;
  groceries: number;
  transport: number;
  eating_out: number;
  entertainment: number;
  utilities: number;
  healthcare: number;
  education: number;
  miscellaneous: number;
  total_expense: number;
}

export interface PortfolioSnapshot {
  id: number;
  user_id: number;
  value: number;
  timestamp: string;
}

export interface Feedback {
  id: number;
  user_id: number;
  message: string;
  created_at: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  currentSavings: number;
  savingsGoal: number;
  monthlyBudget: number;
  budgetUsed: number;
  monthlyIncome: number;
  totalIncomeChange: number;
  expenseChange: number;
  lastUpdate: string;
  recentTransactions: Array<{
    id: number;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    date: string;
  }>;
  expenseBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

export const TransactionCategories = {
  INCOME: ['Salary', 'Investment', 'Freelance', 'Other'],
  EXPENSE: ['Food', 'Transportation', 'Housing', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Utilities', 'Insurance', 'Other']
} as const;
