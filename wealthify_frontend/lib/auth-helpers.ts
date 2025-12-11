/**
 * Auth error handling utilities for Supabase authentication
 */

import { supabase } from './supabaseClient';

export async function clearAuthTokens() {
  try {
    // Clear all auth-related data from storage
    if (typeof window !== 'undefined') {
      // Clear localStorage items related to Supabase auth
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('wealthify-auth'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('wealthify-auth'))) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      console.log('Cleared auth tokens from storage');
    }
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
}

export async function handleAuthError(error: any) {
  console.error('Auth error:', error);
  
  // Check if it's a refresh token error or user not found error
  if (error?.message?.includes('refresh') || 
      error?.message?.includes('Invalid Refresh Token') ||
      error?.message?.includes('Refresh Token Not Found') ||
      error?.message?.includes('User from sub claim in JWT does not exist')) {
    
    console.log('Detected auth error, clearing tokens...');
    await clearAuthTokens();
    
    // Try to sign out cleanly
    try {
      await supabase.auth.signOut();
    } catch (signOutError) {
      console.error('Error during cleanup sign out:', signOutError);
    }
    
    return {
      shouldRedirect: true,
      redirectTo: '/login',
      message: 'Your session has expired. Please sign in again.'
    };
  }
  
  return {
    shouldRedirect: false,
    message: error?.message || 'An authentication error occurred'
  };
}

export async function safeGetSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      const result = await handleAuthError(error);
      return { session: null, error, shouldClearAuth: result.shouldRedirect };
    }
    return { session, error: null, shouldClearAuth: false };
  } catch (error) {
    const result = await handleAuthError(error);
    return { session: null, error, shouldClearAuth: result.shouldRedirect };
  }
}

export async function safeGetUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      const result = await handleAuthError(error);
      return { user: null, error, shouldClearAuth: result.shouldRedirect };
    }
    return { user, error: null, shouldClearAuth: false };
  } catch (error) {
    const result = await handleAuthError(error);
    return { user: null, error, shouldClearAuth: result.shouldRedirect };
  }
}