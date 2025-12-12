'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Loader2 } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }

        if (!session) {
          // If no session, check if we have a code to exchange (handled automatically by supabase-js usually, 
          // but good to be robust)
          const code = searchParams.get('code');
          if (code) {
             // The supabase client should handle this automatically if configured correctly,
             // but we'll wait a moment for the async process
             await new Promise(resolve => setTimeout(resolve, 500));
             const { data: { session: newSession }, error: newError } = await supabase.auth.getSession();
             if (newError || !newSession) {
                setStatus('error');
                setMessage('No session found after callback.');
                return;
             }
          } else {
            setStatus('error');
            setMessage('No session found');
            return;
          }
        }

        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
            <p className="text-white">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="h-8 w-8 mx-auto text-green-400">✓</div>
            <p className="text-white">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="h-8 w-8 mx-auto text-red-400">✗</div>
            <p className="text-white">{message}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-white" />
        <p className="text-white">Loading authentication...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}



