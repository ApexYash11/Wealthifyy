"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import ThemeToggle from "@/components/ThemeToggle";
import Link from 'next/link';

const resetSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reset, setReset] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setMessage("Invalid or missing token.");
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/reset-password`, {
        token,
        new_password: data.password,
      });
      setMessage("Password reset successful! You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error: any) {
      setMessage("Failed to reset password. The link may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setReset(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-700 px-4">
      <ThemeToggle />
      <div className="flex flex-col items-center mb-8 mt-4">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-2 shadow-lg">
          <span className="text-white font-extrabold text-3xl">W</span>
        </div>
        <span className="text-3xl font-bold text-white tracking-tight mb-1 drop-shadow">Wealthify</span>
        <span className="text-sm text-purple-100">Set a new password</span>
      </div>
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-bold text-purple-700 dark:text-purple-200">Reset Password</CardTitle>
        </CardHeader>
        <CardContent>
          {reset ? (
            <div className="text-center text-green-600 dark:text-green-400">
              Password has been reset! You can now <Link href="/login" className="underline">login</Link>.
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-5">
              <div>
                <Label htmlFor="password" className="text-purple-700 dark:text-purple-200">New Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-purple-700 dark:text-purple-200">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-1" required />
                {password && confirmPassword && password !== confirmPassword && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all duration-200" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
              <div className="flex justify-between text-xs mt-2">
                <Link href="/login" className="text-purple-700 dark:text-purple-200 hover:underline">Login</Link>
                <Link href="/register" className="text-purple-700 dark:text-purple-200 hover:underline">Register</Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
      <div className="mt-8 text-xs text-purple-200 text-center">
        © {new Date().getFullYear()} Wealthify. All rights reserved.
      </div>
    </main>
  );
} 