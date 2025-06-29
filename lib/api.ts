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
    }
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
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

export const authAPI = {
  login: (data: LoginRequest) => api.post('/login', data),
  register: (data: RegisterRequest) => api.post('/register', data),
};

export const expenseAPI = {
  getExpenses: (userId: string, month?: string) => 
    api.get(`/expenses/${userId}${month ? `?month=${month}` : ''}`),
  addExpense: (data: ExpenseRequest) => api.post('/expenses', data),
  predictExpense: (data: PredictionRequest) => api.post('/predict-expense', data),
  predictSavings: (data: PredictionRequest) => api.post('/predict/savings', data),
};

export default api; 