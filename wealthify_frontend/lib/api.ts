import axios from 'axios';

// Use environment variables with fallbacks
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' ? window.location.origin.replace(':3000', ':8000') : 'http://localhost:8000');

// Create axios instance with better error handling
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

export default apiClient;

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

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
  user_id: number;
  type: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export const authAPI = {
  login: (data: LoginRequest) => {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    return apiClient.post('/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  register: (data: RegisterRequest) => apiClient.post('/register', data),
};

export const expenseAPI = {
  getExpenses: (userId: string, month?: string) => 
    apiClient.get(`/expenses/${userId}${month ? `?month=${month}` : ''}`),
  addExpense: (data: ExpenseRequest) => apiClient.post('/expenses', data),
  predictExpense: (data: PredictionRequest) => apiClient.post('/predict-expense', data),
  predictSavings: (data: PredictionRequest) => apiClient.post('/predict/savings', data),
};

export const transactionAPI = {
  getTransactions: (userId: number, limit?: number) => 
    apiClient.get(`/transactions/${userId}${limit ? `?limit=${limit}` : ''}`),
  addTransaction: (data: TransactionRequest) => apiClient.post('/transactions', data),
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