"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { savingsAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface EditSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSavings: number;
  savingsGoal: number;
  onUpdateSavings: (savings: number) => void;
  onUpdateGoal: (goal: number) => void;
}

export default function EditSavingsModal({
  isOpen,
  onClose,
  currentSavings,
  savingsGoal,
  onUpdateSavings,
  onUpdateGoal,
}: EditSavingsModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [savings, setSavings] = useState(currentSavings.toString());
  const [goal, setGoal] = useState(savingsGoal.toString());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const savingsAmount = Number.parseFloat(savings);
    const goalAmount = Number.parseFloat(goal);
    if (isNaN(savingsAmount) || isNaN(goalAmount)) {
      toast({
        title: "Invalid value",
        description: "Please enter valid numbers",
        variant: "destructive",
      });
      return;
    }
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to update savings",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      // Update current savings
      await savingsAPI.updateCurrentSavings(parseInt(user.id), savingsAmount);
      onUpdateSavings(savingsAmount);
      // Update savings goal
      await savingsAPI.updateSavingsGoal(parseInt(user.id), goalAmount);
      onUpdateGoal(goalAmount);
      toast({
        title: "Savings updated",
        description: `Your savings and goal have been updated!`,
      });
      onClose();
      if (typeof window !== 'undefined') window.location.reload();
    } catch (error: any) {
      toast({
        title: "Failed to update savings",
        description: error.response?.data?.detail || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Savings</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="savings">Current Savings</Label>
            <Input
              id="savings"
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              placeholder="Enter current savings"
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="goal">Savings Goal</Label>
            <Input
              id="goal"
              type="number"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Enter savings goal"
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
