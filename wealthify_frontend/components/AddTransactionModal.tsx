'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

const expenseCategories = [
  { value: 'food', label: 'Food', icon: '🍔' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'housing', label: 'Housing', icon: '🏠' },
  { value: 'utilities', label: 'Utilities', icon: '⚡' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'personal', label: 'Personal', icon: '👤' },
  { value: 'other', label: 'Other', icon: '📝' },
];
const incomeCategories = [
  { value: 'salary', label: 'Salary', icon: '💰' },
  { value: 'freelance', label: 'Freelance', icon: '🧑‍💻' },
  { value: 'investment', label: 'Investment', icon: '📈' },
  { value: 'gift', label: 'Gift', icon: '🎁' },
  { value: 'other', label: 'Other', icon: '📝' },
];

export default function AddTransactionModal() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle transaction submission
    setOpen(false);
  };

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-900 to-purple-500 text-white font-semibold shadow-md hover:from-purple-800 hover:to-purple-400">
          + Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-2">Add New Transaction</DialogTitle>
          <div className="text-center text-gray-500 mb-4">Enter the details of your transaction below.</div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div className="flex items-center gap-6 justify-center mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="income"
                checked={type === 'income'}
                onChange={() => setType('income')}
                className="accent-green-600 w-4 h-4"
              />
              <span className="text-green-600 font-medium">Income</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
                className="accent-red-600 w-4 h-4"
              />
              <span className="text-red-600 font-medium">Expense</span>
            </label>
          </div>
          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g., Grocery shopping"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
          </div>
          {/* Category */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="mr-2">{cat.icon}</span>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Date */}
          <div>
            <Label htmlFor="date">Date</Label>
            <div className="flex items-center gap-2">
              <Input
                id="date"
                type="date"
                value={date.toISOString().slice(0, 10)}
                onChange={e => setDate(new Date(e.target.value))}
                className="w-full"
                required
              />
              <CalendarIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          {/* Actions */}
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-purple-900 to-purple-500 text-white font-semibold shadow-md hover:from-purple-800 hover:to-purple-400">
              Add Transaction
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 