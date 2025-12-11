"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { transactionAPI } from "@/lib/api"

export type TransactionType = "income" | "expense"


// Only used for UI, not for backend
export interface Transaction {
  id: number
  type: TransactionType
  description: string
  amount: number
  date: string
  category: string
  icon: string
  recurring?: boolean
}

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void // Notify parent to refresh data
}

const categoryIcons: Record<string, string> = {
  Salary: "💰",
  Freelance: "💻",
  Investment: "📈",
  Gift: "🎁",
  Food: "🍔",
  Transport: "🚗",
  Housing: "🏠",
  Utilities: "⚡",
  Entertainment: "🎬",
  Shopping: "🛒",
  Healthcare: "🏥",
  Education: "📚",
  Personal: "👤",
  Other: "📋",
}

export default function AddTransactionModal({ isOpen, onClose, onSuccess }: AddTransactionModalProps) {
  const { toast } = useToast()
  const [type, setType] = useState<TransactionType>("expense")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [recurring, setRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const incomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other"]
  const expenseCategories = [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Entertainment",
    "Shopping",
    "Healthcare",
    "Education",
    "Personal",
    "Other",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || !category) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      await transactionAPI.addTransaction({
        type,
        description,
        amount: Number.parseFloat(amount), // Convert to Decimal-compatible format
        date: new Date(date).toISOString(), // Convert to datetime-compatible format
        category,
      })
      resetForm()
      onClose()
      if (onSuccess) onSuccess()
      toast({
        title: "Transaction added",
        description: `${type === "income" ? "Income" : "Expense"} of ₹${amount} has been added.`,
      })
    } catch (err: any) {
      // Extract error details from axios response
      const errorDetail = err?.response?.data?.detail || 
                         err?.response?.data?.message ||
                         err?.message || 
                         "Failed to add transaction. Please check your network connection.";
      
      // Log the full error for debugging
      console.error('Transaction submission error:', err);
      console.error('Transaction submission error details:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
        code: err?.code,
        fullError: JSON.stringify(err, Object.getOwnPropertyNames(err)),
      });

      toast({
        title: "Error adding transaction",
        description: errorDetail,
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setType("expense")
    setDescription("")
    setAmount("")
    setCategory("")
    setDate(new Date().toISOString().split("T")[0])
    setRecurring(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Add New Transaction
          </DialogTitle>
          <DialogDescription>Enter the details of your transaction below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <RadioGroup
            value={type}
            onValueChange={(value) => {
              setType(value as TransactionType)
              setCategory("")
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="income" id="income" />
              <Label htmlFor="income" className="font-medium text-green-600">
                Income
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="expense" id="expense" />
              <Label htmlFor="expense" className="font-medium text-red-600">
                Expense
              </Label>
            </div>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {(type === "income" ? incomeCategories : expenseCategories).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {categoryIcons[cat]} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <Label htmlFor="recurring" className="text-sm font-medium">
              Recurring Transaction
            </Label>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm()
                onClose()
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600" disabled={submitting}>
              {submitting ? "Adding..." : "Add Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
