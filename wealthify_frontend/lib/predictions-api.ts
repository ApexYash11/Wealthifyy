import { supabase } from './supabaseClient';

export interface PredictionResponse {
  value: number;
  error?: string;
  confidence?: number;
}

export interface ForecastData {
  month: string;
  expenses: number;
  savings: number;
  net_income: number;
}

export interface ForecastResponse {
  forecast?: ForecastData[];
  can_show_forecast: boolean;
  error?: string;
}

export const predictionsAPI = {
  predictExpense: async (month: string): Promise<PredictionResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .single();

      if (error) throw error;

      return {
        value: data.predicted_expense,
        confidence: data.confidence_score
      };
    } catch (error) {
      console.error('Error predicting expense:', error);
      return {
        value: 0,
        error: 'Failed to predict expense'
      };
    }
  },

  predictSavings: async (month: string, income: number): Promise<PredictionResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', month)
        .single();

      if (error) throw error;

      return {
        value: data.predicted_savings,
        confidence: data.confidence_score
      };
    } catch (error) {
      console.error('Error predicting savings:', error);
      return {
        value: 0,
        error: 'Failed to predict savings'
      };
    }
  },

  getSixMonthForecast: async (income: number): Promise<ForecastResponse> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .eq('user_id', user.id)
        .order('month', { ascending: true })
        .limit(6);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          can_show_forecast: false,
          error: 'No forecast data available'
        };
      }

      const forecast = data.map(item => ({
        month: item.month,
        expenses: item.predicted_expense,
        savings: item.predicted_savings,
        net_income: income - item.predicted_expense
      }));

      return {
        forecast,
        can_show_forecast: true
      };
    } catch (error) {
      console.error('Error getting forecast:', error);
      return {
        can_show_forecast: false,
        error: 'Failed to get forecast'
      };
    }
  }
} as const;
