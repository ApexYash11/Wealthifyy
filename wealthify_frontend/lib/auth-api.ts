import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface AuthResponse {
  session: any;
  user: User | null;
  error: Error | null;
}

export interface UserInfo {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

// Authentication API functions
export const authAPI = {
  // Traditional login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      session: data.session,
      user: data.user,
      error: error,
    };
  },

  // Traditional registration
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          username: userData.username,
        },
      },
    });

    return {
      session: data.session,
      user: data.user,
      error: error,
    };
  },

  // Get current user info
  getCurrentUser: async (): Promise<UserInfo | null> => {
    try {
      const { safeGetUser } = await import('./auth-helpers');
      const { user, error, shouldClearAuth } = await safeGetUser();
      
      if (shouldClearAuth) {
        // Clear auth and redirect if tokens are invalid
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return null;
      }
      
      if (error || !user) return null;

      return {
        id: user.id,
        email: user.email!,
        user_metadata: user.user_metadata,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  // Logout
  logout: async (): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Password reset
  forgotPassword: async (email: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  resetPassword: async (newPassword: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },

  // Google OAuth
  signInWithGoogle: async (): Promise<void> => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  },
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

export default authAPI;
