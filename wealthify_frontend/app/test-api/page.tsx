'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function TestApiPage() {
  const router = useRouter();
  const [apiResults, setApiResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApiCommunication = async () => {
      try {
        const results = {
          health: null,
          user: null,
          token: null,
          error: null
        };

        // Test 1: Health check (no auth required)
        try {
          const healthResponse = await apiClient.get('/health');
          results.health = healthResponse;
        } catch (error) {
          results.health = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        // Test 2: Get auth token
        try {
          const token = await apiClient.getAuthToken();
          results.token = token ? '***' + token.slice(-10) : null;
        } catch (error) {
          results.token = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        // Test 3: Try to get user data (requires auth)
        try {
          const userResponse = await apiClient.get('/auth/supabase/verify');
          results.user = userResponse;
        } catch (error) {
          results.user = { error: error instanceof Error ? error.message : 'Unknown error' };
        }

        setApiResults(results);

      } catch (error) {
        setApiResults({ error: error instanceof Error ? error.message : 'Unknown error' });
      } finally {
        setLoading(false);
      }
    };

    testApiCommunication();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Communication Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Health Check (No Auth)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(apiResults?.health, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Token</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(apiResults?.token, null, 2)}
          </pre>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Verification (Auth Required)</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(apiResults?.user, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go to Login
          </button>
          <button
            onClick={() => router.push('/debug-session')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Debug Session
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  );
} 