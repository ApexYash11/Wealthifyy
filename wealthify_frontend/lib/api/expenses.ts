import { supabase } from '../supabaseClient';
import type { Expense } from '../types';


export const expenseAPI = {
  addExpense: async (expenseData: {
    rent?: number;
    loan_repayment?: number;
    insurance?: number;
    groceries?: number;
    transport?: number;
    eating_out?: number;
    entertainment?: number;
    utilities?: number;
    healthcare?: number;
    education?: number;
    miscellaneous?: number;
  }): Promise<Expense> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const month = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    const total_expense = Object.values(expenseData).reduce((a, b) => (a || 0) + (b || 0), 0);

    const { data: expense, error } = await supabase
      .from('expenses')
      .insert([{
        user_id: user.id,
        month,
        ...expenseData,
        total_expense
      }])
      .select()
      .single();

    if (error) throw error;

    // Update financial data
    await supabase
      .from('financial_data')
      .update({
        total_expenses: supabase.rpc('increment', { amount: total_expense }),
        budget_used: supabase.rpc('increment', { amount: total_expense })
      })
      .eq('user_id', user.id);

    return expense;
  },

  getMonthlyExpenses: async (month?: string): Promise<Expense> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const targetMonth = month || new Date().toISOString().slice(0, 7);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .eq('month', targetMonth)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return data || {
      rent: 0,
      loan_repayment: 0,
      insurance: 0,
      groceries: 0,
      transport: 0,
      eating_out: 0,
      entertainment: 0,
      utilities: 0,
      healthcare: 0,
      education: 0,
      miscellaneous: 0,
      total_expense: 0,
      month: targetMonth,
      user_id: user.id
    };
  },

  getExpenseHistory: async (months: number = 6): Promise<Expense[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: false })
      .limit(months);

    if (error) throw error;

    return data || [];
  },

  updateExpense: async (
    month: string,
    updates: Partial<Omit<Expense, 'id' | 'user_id' | 'month' | 'total_expense'>>
  ): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Calculate the new total expense
    const total_expense = Object.values(updates).reduce((a, b) => (a || 0) + (b || 0), 0);

    const { error } = await supabase
      .from('expenses')
      .update({ ...updates, total_expense })
      .eq('user_id', user.id)
      .eq('month', month);

    if (error) throw error;
  },

  deleteExpense: async (month: string): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('user_id', user.id)
      .eq('month', month);

    if (error) throw error;
  }
} as const;

export default expenseAPI;
