'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const provider = searchParams.get('provider');
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (!provider || !token || !userStr) {
          setError('Missing authentication data');
          return;
        }

        const user = JSON.parse(userStr);
        
        // Store the token and user data
        localStorage.setItem('jwt', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update auth context
        login(token, user);
        
        toast({
          title: 'Success',
          description: `Successfully logged in with ${provider}!`,
        });
        
        // Redirect to dashboard
        router.push('/dashboard');
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Authentication failed. Please try again.');
        toast({
          title: 'Error',
          description: 'Authentication failed. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [router, searchParams, login, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-700 px-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-purple-700 dark:text-purple-200">
              Completing Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we complete your authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-700 px-4">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
          <CardHeader>
            <CardTitle className="text-2xl text-center font-bold text-red-600 dark:text-red-400">
              Authentication Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error}
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
} 