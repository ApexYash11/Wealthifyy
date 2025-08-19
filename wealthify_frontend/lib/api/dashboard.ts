import { supabase } from '../supabaseClient';
import type { 
  Transaction,
  Expense,
  DashboardData
} from '../types';


// Initialize financial data for new user
const initializeFinancialData = async (userId: string): Promise<void> => {
  const { data: existingData } = await supabase
    .from('financial_data')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingData) {
    await supabase.from('financial_data').insert([{
      user_id: userId,
      total_income: 0,
      total_expenses: 0,
      current_savings: 0,
      savings_goal: 0,
      monthly_budget: 0,
      budget_used: 0
    }]);
  }
};

export const dashboardAPI = {
  getDashboardData: async (): Promise<DashboardData | { error: true; message: string; details?: any }> => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        const payload: { error: true; message: string; details?: any } = { error: true, message: `Auth error: ${userError.message}`, details: userError };
        console.error('Auth error while getting dashboard data:', payload);
        return payload;
      }

      if (!user) return { error: true, message: 'No authenticated user' };

      await initializeFinancialData(user.id);

      // Get user's financial data
      const { data: financialData, error: financialError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (financialError) {
        const payload: { error: true; message: string; details?: any } = { error: true, message: `Financial data error: ${financialError.message}`, details: financialError };
        console.error('Financial data error:', payload);
        return payload;
      }

      // Get recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5);

      if (transactionsError) {
        const payload: { error: true; message: string; details?: any } = { error: true, message: `Transactions error: ${transactionsError.message}`, details: transactionsError };
        console.error('Transactions error:', payload);
        return payload;
      }

      // Get expense breakdown
      const { data: expenses, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: false })
        .limit(1);

      if (expensesError) {
        const payload: { error: true; message: string; details?: any } = { error: true, message: `Expenses error: ${expensesError.message}`, details: expensesError };
        console.error('Expenses error:', payload);
        return payload;
      }

      // Calculate expense breakdown from the most recent month's expenses
      const latestExpense = expenses?.[0] || {};
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

      const expenseBreakdown = Object.entries(expenseCategories).map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
      }));

      return {
        totalIncome: financialData?.total_income || 0,
        totalExpenses: financialData?.total_expenses || 0,
        currentSavings: financialData?.current_savings || 0,
        savingsGoal: financialData?.savings_goal || 0,
        monthlyBudget: financialData?.monthly_budget || 0,
        budgetUsed: financialData?.budget_used || 0,
        monthlyIncome: financialData?.monthly_income || financialData?.total_income || 0,
        totalIncomeChange: 0,
        expenseChange: 0,
        lastUpdate: new Date().toLocaleDateString(),
        recentTransactions: transactions?.map(t => ({
          id: t.id,
          description: t.description,
          amount: t.amount,
          type: t.type,
          date: t.date
        })) || [],
        expenseBreakdown
      };
    } catch (err) {
      const payload: { error: true; message: string; details?: any } = { error: true, message: 'Unexpected error in getDashboardData', details: err };
      console.error('Unexpected error in getDashboardData:', payload);
      return payload;
    }
  },

  updateMonthlyBudget: async (budget: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('financial_data')
      .update({ monthly_budget: budget })
      .eq('user_id', user.id);

    if (error) throw error;
  },

  updateSavingsGoal: async (newGoal: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('financial_data')
      .update({ savings_goal: newGoal })
      .eq('user_id', user.id);

    if (error) throw error;
  }
} as const;

export default dashboardAPI;
