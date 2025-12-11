'use client';

import { useEffect } from 'react';
import { clearAuthTokens } from '@/lib/auth-helpers';

export default function AuthTokenCleaner() {
  useEffect(() => {
    // Check for and clear invalid tokens on app initialization
    const checkAndClearTokens = async () => {
      try {
        // Check if there are any stored auth tokens
        if (typeof window !== 'undefined') {
          const hasAuthTokens = Object.keys(localStorage).some(key => 
            key.includes('supabase') || key.includes('wealthify-auth')
          );
          
          if (hasAuthTokens) {
            console.log('Found stored auth tokens, validating...');
            
            // Try to get current session to validate tokens
            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
              console.log('Invalid tokens detected, clearing...', error.message);
              await clearAuthTokens();
              
              // Force a page refresh to start clean
              if (error.message.includes('refresh') || error.message.includes('Invalid Refresh Token')) {
                console.log('Clearing invalid refresh token...');
                window.location.reload();
              }
            } else if (session) {
              console.log('Valid session found, user is logged in');
            } else {
              console.log('No active session found');
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth tokens:', error);
        // If there's any error, clear tokens to be safe
        await clearAuthTokens();
      }
    };

    // Run the check
    checkAndClearTokens();
  }, []);

  // This component doesn't render anything
  return null;
}