"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Welcome to Wealthify</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <p className="mb-6 text-center text-gray-700 dark:text-gray-200">Take control of your finances with beautiful insights and smart tools.</p>
          <Button size="lg" className="w-full">Get Started</Button>
        </CardContent>
      </Card>
    </main>
  );
}
