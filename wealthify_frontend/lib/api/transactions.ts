import { supabase } from '../supabaseClient';
import type { Transaction } from '../types';


export const transactionAPI = {
  addTransaction: async (data: {
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date?: string;
  }): Promise<Transaction> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        description: data.description,
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date || new Date().toISOString(),
        recurring: false
      }])
      .select()
      .single();

    if (error) throw error;

    // Update financial data safely: read current values, compute new totals, then update or insert
    try {
      const { data: finData, error: finError } = await supabase
        .from('financial_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (finError && finError.code !== 'PGRST116') { // PGRST116: no rows found (PostgREST)
        // If an unexpected error happened, log and continue
        console.error('Error reading financial_data:', finError);
      }

      const current = finData || { total_income: 0, total_expenses: 0, budget_used: 0 };

      const newTotals = {
        total_income: current.total_income + (data.type === 'income' ? data.amount : 0),
        total_expenses: current.total_expenses + (data.type === 'expense' ? data.amount : 0),
        budget_used: current.budget_used + (data.type === 'expense' ? data.amount : 0),
      };

      if (finData) {
        const { error: updateError } = await supabase
          .from('financial_data')
          .update(newTotals)
          .eq('user_id', user.id);

        if (updateError) console.error('Error updating financial_data:', updateError);
      } else {
        const { error: insertError } = await supabase
          .from('financial_data')
          .insert([{ user_id: user.id, ...newTotals }]);

        if (insertError) console.error('Error inserting financial_data:', insertError);
      }
    } catch (e) {
      console.error('Unexpected error updating financial_data after addTransaction:', e);
    }

    return transaction;
  },

  getTransactions: async (params: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const {
      page = 1,
      limit = 10,
      type,
      startDate,
      endDate,
    } = params;

    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error, count } = await query
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    return {
      transactions: data,
      total: count || 0,
      page,
      limit,
    };
  },

  updateRecurring: async (transactionId: number, recurring: boolean): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { error } = await supabase
      .from('transactions')
      .update({ recurring })
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  deleteTransaction: async (transactionId: number): Promise<void> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // First get the transaction to know its amount and type
    const { data: transaction, error: getError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .single();

    if (getError) throw getError;

    // Delete the transaction
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;

    // Update financial data
    if (transaction) {
      try {
        const { data: finData, error: finError } = await supabase
          .from('financial_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (finError && finError.code !== 'PGRST116') {
          console.error('Error reading financial_data:', finError);
        }

        const current = finData || { total_income: 0, total_expenses: 0, budget_used: 0 };

        const newTotals = {
          total_income: transaction.type === 'income' ? Math.max(0, current.total_income - transaction.amount) : current.total_income,
          total_expenses: transaction.type === 'expense' ? Math.max(0, current.total_expenses - transaction.amount) : current.total_expenses,
          budget_used: transaction.type === 'expense' ? Math.max(0, current.budget_used - transaction.amount) : current.budget_used,
        };

        if (finData) {
          const { error: updateError } = await supabase
            .from('financial_data')
            .update(newTotals)
            .eq('user_id', user.id);

          if (updateError) console.error('Error updating financial_data:', updateError);
        } else {
          // If no financial_data row exists, insert with the computed totals (won't usually happen on delete)
          const { error: insertError } = await supabase
            .from('financial_data')
            .insert([{ user_id: user.id, ...newTotals }]);

          if (insertError) console.error('Error inserting financial_data:', insertError);
        }
      } catch (e) {
        console.error('Unexpected error updating financial_data after deleteTransaction:', e);
      }
    }
  },

  getStats: async (params: {
    startDate?: string;
    endDate?: string;
  } = {}): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netIncome: number;
    categorySummary: Record<string, number>;
  }> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { startDate, endDate } = params;
    let query = supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lte('date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats = (data || []).reduce((acc: any, transaction: Transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpenses += transaction.amount;
      }

      if (!acc.categorySummary[transaction.category]) {
        acc.categorySummary[transaction.category] = 0;
      }
      acc.categorySummary[transaction.category] += transaction.amount;

      return acc;
    }, {
      totalIncome: 0,
      totalExpenses: 0,
      categorySummary: {}
    });

    return {
      ...stats,
      netIncome: stats.totalIncome - stats.totalExpenses
    };
  }
} as const;

export default transactionAPI;
