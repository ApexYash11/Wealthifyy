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
import { useToast } from "@/components/ui/use-toast"

interface EditSavingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentSavings: number
  savingsGoal: number
  onUpdateSavings: (amount: number) => void
  onUpdateGoal: (amount: number) => void
}

export default function EditSavingsModal({
  isOpen,
  onClose,
  currentSavings,
  savingsGoal,
  onUpdateSavings,
  onUpdateGoal,
}: EditSavingsModalProps) {
  const { toast } = useToast()
  const [savings, setSavings] = useState(currentSavings.toString())
  const [goal, setGoal] = useState(savingsGoal.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const savingsAmount = Number.parseFloat(savings)
    const goalAmount = Number.parseFloat(goal)

    if (isNaN(savingsAmount) || isNaN(goalAmount)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers",
        variant: "destructive",
      })
      return
    }

    onUpdateSavings(savingsAmount)
    onUpdateGoal(goalAmount)
    onClose()

    toast({
      title: "Savings updated",
      description: `Your savings information has been updated.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Update Savings
          </DialogTitle>
          <DialogDescription>Update your current savings and savings goal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="current-savings">Current Savings (₹)</Label>
            <Input
              id="current-savings"
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-goal">Savings Goal (₹)</Label>
            <Input
              id="savings-goal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-primary to-purple-600">
              Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
