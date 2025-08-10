import axios from 'axios';

// Use environment variables with fallbacks
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance for auth operations
const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Response interceptor for better error handling
authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorDetails = {
      message: error.message || 'Unknown error',
      status: error.response?.status || 'No status',
      data: error.response?.data || 'No data',
      url: error.config?.url || 'No URL',
      fullError: error.toString()
    };
    console.error('Auth API Error:', errorDetails);
    return Promise.reject(error);
  }
);

// Types for authentication
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    name?: string;
  };
}

export interface TokenValidationRequest {
  token: string;
}

export interface TokenValidationResponse {
  valid: boolean;
  user_id?: number;
  email?: string;
  token_type?: string;
  error?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  name?: string;
}

// Authentication API functions
export const authAPI = {
  // Traditional login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await authClient.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  // Traditional registration
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await authClient.post('/auth/register', userData);
    return response.data;
  },

  // Validate any type of token
  validateToken: async (token: string): Promise<TokenValidationResponse> => {
    const response = await authClient.post('/auth/validate', { token });
    return response.data;
  },

  // Get current user info
  getCurrentUser: async (): Promise<UserInfo> => {
    const response = await authClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async (): Promise<{ message: string }> => {
    const response = await authClient.post('/auth/logout');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access_token: string; token_type: string }> => {
    const response = await authClient.post('/auth/refresh', null, {
      headers: {
        'X-Refresh-Token': refreshToken,
      },
    });
    return response.data;
  },

  // OAuth endpoints
  initiateGoogleOAuth: () => `${API_BASE_URL}/auth/oauth/google`,
  initiateGithubOAuth: () => `${API_BASE_URL}/auth/oauth/github`,
  
  // OAuth callback
  handleOAuthCallback: async (code: string, state?: string): Promise<AuthResponse> => {
    const response = await authClient.post('/auth/oauth/callback', { code, state });
    return response.data;
  },

  // Password reset
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('email', email);
    
    const response = await authClient.post('/forgot-password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('new_password', newPassword);
    
    const response = await authClient.post('/reset-password', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
};

// Helper function to get token from cookies
export const getTokenFromCookies = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  return token || null;
};

// Helper function to set token in cookies
export const setTokenInCookies = (token: string, expiresInMinutes: number = 1440): void => {
  if (typeof window === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + (expiresInMinutes * 60 * 1000));
  
  document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

// Helper function to remove token from cookies
export const removeTokenFromCookies = (): void => {
  if (typeof window === 'undefined') return;
  
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const token = getTokenFromCookies();
    if (!token) return false;
    
    const validation = await authAPI.validateToken(token);
    return validation.valid;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

export default authAPI;
