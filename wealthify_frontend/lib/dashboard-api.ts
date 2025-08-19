import type { DashboardData } from './types';
import { supabase } from './supabaseClient';

interface DashboardAPI {
  getDashboardData: () => Promise<DashboardData | ApiError>;
  updateSavingsGoal: (newGoal: number) => Promise<void>;
  updateMonthlyBudget: (budget: number) => Promise<void>;
}

type ApiError = {
  error: true;
  message: string;
  details?: any;
  code?: string | number | null;
  hint?: string | null;
  stack?: string | null;
};

// Initialize financial data for new user
const initializeFinancialData = async (userId: string): Promise<void> => {
  const { data: existingData } = await supabase
    .from('financial_data')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingData) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    await supabase.from('financial_data').insert([{
      user_id: userId,
      month: currentMonth,
      total_income: 0,
      total_expenses: 0,
      current_savings: 0,
      savings_goal: 0,
      monthly_budget: 0,
      budget_used: 0
    }]);
  }
};

export const dashboardAPI: DashboardAPI = {
  getDashboardData: async () => {
    try {
      // Step 1: Authenticate user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('Authentication error:', {
          message: userError.message,
          status: userError.status,
          name: userError.name,
          details: userError
        });
        throw new Error(`Authentication failed: ${userError.message}`);
      }
      
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('Please sign in to access your dashboard');
      }

      // Step 2: Get current month's financial data
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();

      if (financialError) {
        const payload: ApiError = {
          error: true,
          message: `Financial data fetch failed: ${financialError.message}`,
          details: financialError.details,
          code: financialError.code,
          hint: financialError.hint,
          stack: (financialError as any)?.stack || null,
        };

        console.error('Failed to fetch financial data:', payload);

        // Initialize if not found, otherwise return structured error
        if (financialError.code === 'PGRST116') {
          await initializeFinancialData(user.id);
        } else {
          return payload;
        }
      }

      // Step 3: Get expense data
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .single();
      if (expenseError) {
        const payload: ApiError = {
          error: true,
          message: `Expense data fetch failed: ${expenseError.message}`,
          details: expenseError.details,
          code: expenseError.code,
          hint: expenseError.hint,
          stack: (expenseError as any)?.stack || null,
        };

        console.error('Failed to fetch expense data:', payload);

        if (expenseError.code !== 'PGRST116') {
          return payload;
        }
      }

      // Step 4: Get recent transactions
      const { data: transactionData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);
      if (transactionsError) {
        const payload: ApiError = {
          error: true,
          message: `Transactions fetch failed: ${transactionsError.message}`,
          details: transactionsError.details,
          code: transactionsError.code,
          hint: transactionsError.hint,
          stack: (transactionsError as any)?.stack || null,
        };

        console.error('Failed to fetch transactions:', payload);

        if (transactionsError.code !== 'PGRST116') {
          return payload;
        }
      }

      // Step 5: Get monthly expense breakdown
      const { data: monthlyExpenses, error: monthlyExpensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);
      if (monthlyExpensesError) {
        const payload: ApiError = {
          error: true,
          message: `Monthly expenses fetch failed: ${monthlyExpensesError.message}`,
          details: monthlyExpensesError.details,
          code: monthlyExpensesError.code,
          hint: monthlyExpensesError.hint,
          stack: (monthlyExpensesError as any)?.stack || null,
        };

        console.error('Failed to fetch monthly expenses:', payload);

        if (monthlyExpensesError.code !== 'PGRST116') {
          return payload;
        }
      }

      // Step 6: Get last month's comparison data
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      
      const { data: lastMonthData, error: lastMonthError } = await supabase
        .from('financial_data')
        .select('total_income, total_expenses')
        .eq('user_id', user.id)
        .eq('month', lastMonthStr)
        .single();
      if (lastMonthError) {
        const payload: ApiError = {
          error: true,
          message: `Last month data fetch failed: ${lastMonthError.message}`,
          details: lastMonthError.details,
          code: lastMonthError.code,
          hint: lastMonthError.hint,
          stack: (lastMonthError as any)?.stack || null,
        };

        console.error('Failed to fetch last month data:', payload);

        if (lastMonthError.code !== 'PGRST116') {
          return payload;
        }
      }

      // Prepare data with safe defaults
      const safeFinancialData = financialData || {
        total_income: 0,
        total_expenses: 0,
        current_savings: 0,
        savings_goal: 0,
        monthly_budget: 0,
        budget_used: 0,
        monthly_income: 0
      };

      const transactions = transactionData || [];
      const expenses = monthlyExpenses || [];
      const latestExpense = expenses[0] || {};

      // Calculate expense categories
      const expenseCategories = {
        Rent: latestExpense.rent || 0,
        'Loan Repayment': latestExpense.loan_repayment || 0,
        Insurance: latestExpense.insurance || 0,
        Groceries: latestExpense.groceries || 0,
        Transport: latestExpense.transport || 0,
        'Eating Out': latestExpense.eating_out || 0,
        Entertainment: latestExpense.entertainment || 0,
        Utilities: latestExpense.utilities || 0,
        Healthcare: latestExpense.healthcare || 0,
        Education: latestExpense.education || 0,
        Miscellaneous: latestExpense.miscellaneous || 0
      };

      const totalExpenses = Object.values(expenseCategories).reduce((a, b) => a + b, 0);

      // Calculate changes from last month
      const lastMonthIncome = lastMonthData?.total_income || 0;
      const lastMonthExpenses = lastMonthData?.total_expenses || 0;

      const totalIncomeChange = lastMonthIncome ? 
        ((safeFinancialData.total_income - lastMonthIncome) / lastMonthIncome * 100) : 0;
      
      const expenseChange = lastMonthExpenses ? 
        ((safeFinancialData.total_expenses - lastMonthExpenses) / lastMonthExpenses * 100) : 0;

      // Prepare and filter expense breakdown
      const expenseBreakdown = Object.entries(expenseCategories)
        .filter(([_, amount]) => amount > 0)
        .sort(([_, a], [__, b]) => b - a)
        .map(([category, amount]) => ({
          category,
          amount,
          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
        }));

      // Return complete dashboard data
      return {
        totalIncome: safeFinancialData.total_income,
        totalExpenses: safeFinancialData.total_expenses,
        currentSavings: safeFinancialData.current_savings,
        savingsGoal: safeFinancialData.savings_goal,
        monthlyBudget: safeFinancialData.monthly_budget,
        budgetUsed: safeFinancialData.budget_used,
        monthlyIncome: safeFinancialData.monthly_income || safeFinancialData.total_income,
        totalIncomeChange,
        expenseChange,
        lastUpdate: new Date().toLocaleDateString(),
        recentTransactions: transactions.map(t => ({
          id: t.id || 0,
          description: t.description || 'Unnamed transaction',
          amount: t.amount || 0,
          type: t.type || 'expense',
          date: t.date || new Date().toISOString()
        })),
        expenseBreakdown
      };

    } catch (error: any) {
      const payload: ApiError = {
        error: true,
        message: error?.message || 'Unknown error in getDashboardData',
        details: error?.details || null,
        code: error?.code || null,
        hint: error?.hint || null,
        stack: error?.stack || null,
      };

      console.error('Error in getDashboardData:', payload);

      // Preserve authentication errors so caller can handle redirect/login
      if (error?.message && error.message.includes('sign in')) {
        return payload;
      }

      // Return safe defaults so the UI can still render partially, but attach details
      return {
        error: false as any,
        totalIncome: 0,
        totalExpenses: 0,
        currentSavings: 0,
        savingsGoal: 0,
        monthlyBudget: 0,
        budgetUsed: 0,
        monthlyIncome: 0,
        totalIncomeChange: 0,
        expenseChange: 0,
        lastUpdate: new Date().toLocaleDateString(),
        recentTransactions: [],
        expenseBreakdown: [],
        _errorDetails: payload
      } as unknown as DashboardData;
    }
  },

  updateSavingsGoal: async (newGoal: number) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('financial_data')
        .update({ savings_goal: newGoal })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating savings goal:', error);
      throw error;
    }
  },

  updateMonthlyBudget: async (budget: number) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('financial_data')
        .update({ monthly_budget: budget })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating monthly budget:', error);
      throw error;
    }
  }
};

export default dashboardAPI;
