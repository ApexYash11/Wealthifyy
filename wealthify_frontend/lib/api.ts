import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import axios from 'axios';

// Use environment variables with fallbacks
const API_BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')}/api/v1`;

// Create axios instance with better error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  // Allow cookies (session cookie set by backend) to be sent with requests
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Attach Supabase access token to every request
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data } = await supabase.auth.getSession();
      const accessToken = data?.session?.access_token;
      if (accessToken) {
        (config.headers as any).Authorization = `Bearer ${accessToken}`;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('apiClient: failed to attach supabase token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    try {
      const errPayload: any = {
        message: error?.message || 'Unknown Axios error',
        status: error?.response?.status ?? null,
        responseData: error?.response?.data ?? null,
        request: {
          url: error?.config?.url ?? null,
          method: error?.config?.method ?? null,
          headers: error?.config?.headers ?? null,
          params: error?.config?.params ?? null,
          data: error?.config?.data ?? null,
        },
        stack: error?.stack ?? null,
        original: error,
      };

      // Log detailed structured info to console for easier debugging
      // eslint-disable-next-line no-console
      console.error('API Error:', errPayload);
    } catch (logErr) {
      // Best-effort minimal logging
      // eslint-disable-next-line no-console
      console.error('API Error (logging failure):', logErr, 'original error:', error);
    }

    // Propagate the original error so callers can read response/status when needed
    return Promise.reject(error);
  }
);

export default apiClient;


export interface ExpenseCategory {
  food: number;
  transportation: number;
  entertainment: number;
  shopping: number;
  healthcare: number;
  education: number;
  housing: number;
  utilities: number;
  insurance: number;
  savings: number;
  debt: number;
  other: number;
}

export interface ExpenseRequest {
  user_id: string;
  month: string;
  categories: ExpenseCategory;
}

export interface PredictionRequest {
  income: number;
  user_id: string;
  month: string;
}

export interface TransactionRequest {
  type: string;
  description: string;
  amount: number;
  category: string;
  date: string; // ISO string
  notes?: string;
}

export const expenseAPI = {
  getExpenses: (userId: string, month?: string) => 
    apiClient.get(`/expenses/${userId}${month ? `?month=${month}` : ''}`),
  addExpense: (data: ExpenseRequest) => apiClient.post('/expenses', data),
  predictExpense: (data: PredictionRequest) => apiClient.post('/predict-expense', data),
  predictSavings: (data: PredictionRequest) => apiClient.post('/predict/savings', data),
  predict6MonthForecast: (data: { user_id: number; income: number }) => 
    apiClient.post('/predict/6-month-forecast', data),
};

export const transactionAPI = {
  getTransactions: () => apiClient.get('/transactions/'),
  addTransaction: (data: TransactionRequest) => apiClient.post('/transactions/', data),
};

// Savings goal management
export const savingsAPI = {
  // Get user's current savings goal
  getSavingsGoal: (userId: number) => 
    apiClient.get(`/users/${userId}/savings-goal`),
  
  // Update user's savings goal
  updateSavingsGoal: (userId: number, savingsGoal: number) => 
    apiClient.put(`/users/${userId}/savings-goal`, { savings_goal: savingsGoal }),
  
  // Calculate smart savings goal based on income/expenses
  calculateSavingsGoal: (userId: number) => 
    apiClient.post(`/users/${userId}/calculate-savings-goal`),

  // Update user's current savings
  updateCurrentSavings: (userId: number, currentSavings: number) =>
    apiClient.put(`/users/${userId}/current-savings`, { current_savings: currentSavings }),
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: (userId: number) => apiClient.get(`/dashboard/${userId}`),
  updateSavingsGoal: (userId: number, newGoal: number) =>
    apiClient.put(`/users/${userId}/savings-goal`, { savings_goal: newGoal }),
};

export const getAssets = async (token: string) => {
  const res = await axios.get(`${API_BASE_URL}/assets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const addAsset = async (asset: any, token: string) => {
  const res = await axios.post(`${API_BASE_URL}/assets`, {
    ...asset,
    type: asset.type,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPortfolioOverview = async (token: string) => {
  const res = await axios.get(`${API_BASE_URL}/portfolio/overview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getPortfolioHistory = async (token: string) => {
  const res = await axios.get(`${API_BASE_URL}/portfolio/history`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const updateAsset = async (assetId: number, asset: any, token: string) => {
  const res = await axios.put(`${API_BASE_URL}/assets/${assetId}`, {
    ...asset,
    type: asset.type,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const deleteAsset = async (assetId: number, token: string) => {
  const res = await axios.delete(`${API_BASE_URL}/assets/${assetId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}; 