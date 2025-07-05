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
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data);
      toast({
        title: 'Success',
        description: 'Logged in successfully!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Login failed',
        variant: 'destructive',
      });
    } finally {
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
        <span className="text-sm text-purple-100">Personal Finance Dashboard</span>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-purple-700 dark:text-purple-200">Login to Wealthify</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="flex justify-between text-xs mt-2">
              <Link href="/register" className="text-purple-700 dark:text-purple-200 hover:underline">Register</Link>
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