import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request with token:', token.substring(0, 20) + '...');
    } else {
      console.log('No JWT token found in localStorage');
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('jwt');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
    return api.post('/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  register: (data: RegisterRequest) => api.post('/register', data),
};

export const expenseAPI = {
  getExpenses: (userId: string, month?: string) => 
    api.get(`/expenses/${userId}${month ? `?month=${month}` : ''}`),
  addExpense: (data: ExpenseRequest) => api.post('/expenses', data),
  predictExpense: (data: PredictionRequest) => api.post('/predict-expense', data),
  predictSavings: (data: PredictionRequest) => api.post('/predict/savings', data),
};

export const transactionAPI = {
  getTransactions: (userId: number, limit?: number) => 
    api.get(`/transactions/${userId}${limit ? `?limit=${limit}` : ''}`),
  addTransaction: (data: TransactionRequest) => api.post('/transactions', data),
};

export const dashboardAPI = {
  getDashboardData: (userId: number) => api.get(`/dashboard/${userId}`),
  updateSavingsGoal: (userId: number, newGoal: number) =>
    api.put(`/users/${userId}/savings-goal`, { new_goal: newGoal }),
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

export default api; 