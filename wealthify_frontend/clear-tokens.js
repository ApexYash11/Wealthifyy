#!/usr/bin/env node

/**
 * Quick script to clear browser storage for development
 * Run this script and then refresh your browser
 */

console.log(`
🔧 WEALTHIFY AUTH TOKEN CLEARER

To fix the "Invalid Refresh Token" error, please:

1. Open your browser Developer Tools (F12)
2. Go to the "Application" or "Storage" tab
3. Find "Local Storage" and "Session Storage"
4. Delete all entries that contain:
   - "supabase"
   - "wealthify-auth"
   - Any authentication-related keys

OR run this in your browser console:

// Clear localStorage
Object.keys(localStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('wealthify-auth')) {
    localStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

// Clear sessionStorage  
Object.keys(sessionStorage).forEach(key => {
  if (key.includes('supabase') || key.includes('wealthify-auth')) {
    sessionStorage.removeItem(key);
    console.log('Removed:', key);
  }
});

console.log('✅ Cleared all auth tokens. Refresh the page!');

5. Refresh your page (Ctrl+R or Cmd+R)

The AuthTokenCleaner component should now handle this automatically,
but manual clearing ensures a clean start.
`);