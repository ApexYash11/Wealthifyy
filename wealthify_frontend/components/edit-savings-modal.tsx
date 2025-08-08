"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { savingsAPI } from '@/lib/api';

interface EditSavingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSavings: number;
  savingsGoal: number;
  onUpdateSavings: (newSavings: number) => void;
  onUpdateGoal: (newGoal: number) => void;
}

export default function EditSavingsModal({
  isOpen,
  onClose,
  currentSavings,
  savingsGoal,
  onUpdateSavings,
  onUpdateGoal,
}: EditSavingsModalProps) {
  const [newSavings, setNewSavings] = useState(currentSavings.toString());
  const [newGoal, setNewGoal] = useState(savingsGoal.toString());
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newSavings || !newGoal || isNaN(Number(newSavings)) || isNaN(Number(newGoal))) {
      toast({
        title: 'Error',
        description: 'Please enter valid numbers',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // The backend will identify the user from the auth token
      await savingsAPI.updateCurrentSavings(1, Number(newSavings)); // Placeholder user ID
      await savingsAPI.updateSavingsGoal(1, Number(newGoal)); // Placeholder user ID

      onUpdateSavings(Number(newSavings));
      onUpdateGoal(Number(newGoal));

      toast({
        title: 'Success',
        description: 'Savings updated successfully',
      });

      onClose();
    } catch (error) {
      console.error('Error updating savings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update savings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Savings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="current-savings">Current Savings</Label>
            <Input
              id="current-savings"
              type="number"
              value={newSavings}
              onChange={(e) => setNewSavings(e.target.value)}
              placeholder="Enter current savings"
            />
          </div>
          <div>
            <Label htmlFor="savings-goal">Savings Goal</Label>
            <Input
              id="savings-goal"
              type="number"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Enter savings goal"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
