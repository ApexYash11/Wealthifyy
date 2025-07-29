'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeToggle from '@/components/ThemeToggle';
import { Github, Chrome } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  username: z.string().min(3, 'Username is required'),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: data.username,
          email: data.email,
          password: data.password,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast({
          title: 'Error',
          description: err.detail || 'Registration failed',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }
      setLoading(false);
      toast({
        title: 'Success',
        description: 'Registration successful! Please log in.',
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Registration failed. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleOAuthRegister = async (provider: 'github' | 'google') => {
    setLoading(true);
    try {
      // Redirect to backend OAuth endpoint
      window.location.href = `http://localhost:8000/auth/${provider}/login`;
    } catch (error) {
      console.error('OAuth error:', error);
      toast({
        title: 'Error',
        description: 'OAuth registration failed. Please try again.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-700 px-4">
      <ThemeToggle />
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
          <span className="text-white font-extrabold text-3xl">W</span>
        </div>
        <span className="text-3xl font-bold text-white tracking-tight mb-1 drop-shadow">Wealthify</span>
        <span className="text-sm text-purple-100">Create your account</span>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-purple-700 dark:text-purple-200">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-purple-700 dark:text-purple-200">Username</Label>
              <Input id="username" type="text" {...register('username')} className="mt-1" />
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-purple-700 dark:text-purple-200">Email</Label>
              <Input id="email" type="email" {...register('email')} className="mt-1" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-purple-700 dark:text-purple-200">Password</Label>
              <Input id="password" type="password" {...register('password')} className="mt-1" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-purple-700 dark:text-purple-200">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="mt-1" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </Button>
            
            {/* OAuth Buttons */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthRegister('github')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOAuthRegister('google')}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Chrome className="w-4 h-4" />
                Google
              </Button>
            </div>
            
            <div className="flex justify-between text-xs mt-2">
              <Link href="/login" className="text-purple-700 dark:text-purple-200 hover:underline">Login</Link>
              <Link href="/forgot-password" className="text-purple-700 dark:text-purple-200 hover:underline">Forgot password?</Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8 text-xs text-purple-200 text-center">
        © {new Date().getFullYear()} Wealthify. All rights reserved.
      </div>
    </main>
  );
} 