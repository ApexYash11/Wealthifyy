import { Transaction } from "@/lib/types";

export interface Trend {
  label: string;
  type: 'recurring' | 'spike' | 'saving';
  description: string;
  amount?: number;
}

export interface InsightSuggestion {
  title: string;
  description: string;
  type: 'warning' | 'tip' | 'success';
}

export const calculateHealthScore = (
  income: number,
  expenses: number,
  savingsGoal: number,
  currentSavings: number
): number => {
  if (income === 0) return 0;

  let score = 0;
  
  // 0. Tracking Bonus (10 points) - Reward for just tracking
  if (expenses > 0) score += 10;

  // 1. Savings Rate (Max 30 points)
  // Ideal: Save 20% of income
  const savingsRate = (income - expenses) / income;
  if (savingsRate >= 0.20) score += 30;
  else if (savingsRate > 0) score += (savingsRate / 0.20) * 30;

  // 2. Expense Ratio (Max 30 points)
  // Ideal: Expenses < 80% of income
  const expenseRatio = expenses / income;
  if (expenseRatio <= 0.50) score += 30; // Excellent
  else if (expenseRatio <= 0.80) score += 15; // Okay
  else score += 0; // Warning

  // 3. Goal Progress (Max 30 points)
  if (savingsGoal > 0) {
    const progress = Math.min(currentSavings / savingsGoal, 1);
    score += progress * 30;
  }

  return Math.round(score);
};

export const analyzeTrends = (transactions: Transaction[]): Trend[] => {
  const trends: Trend[] = [];
  const merchantHistory: Record<string, number[]> = {};

  // Group amounts by description (merchant)
  transactions.forEach(tx => {
    const key = tx.description.trim();
    if (!merchantHistory[key]) merchantHistory[key] = [];
    merchantHistory[key].push(Number(tx.amount));
  });

  Object.entries(merchantHistory).forEach(([merchant, amounts]) => {
    // 1. Detect Recurring (Simple: appears 2+ times with same amount)
    // Lowered threshold to 2 for better initial feedback
    if (amounts.length >= 2) {
      // Check variance to see if it's a fixed subscription
      const uniqueAmounts = new Set(amounts);
      if (uniqueAmounts.size === 1) {
        trends.push({
          label: merchant,
          type: 'recurring',
          description: `Recurring payment of ₹${amounts[0]} detected`,
          amount: amounts[0]
        });
      }
    }

    // 2. Detect Spikes (One-off large expense > 2x average of that merchant)
    if (amounts.length > 1) {
      const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const spike = amounts.find(a => a > avg * 2);
      if (spike) {
        trends.push({
          label: merchant,
          type: 'spike',
          description: `Unusual spending detected: ₹${spike} (Avg: ₹${avg.toFixed(0)})`,
          amount: spike
        });
      }
    }
  });

  return trends.slice(0, 5); // Return top 5 trends
};

export const generateSuggestions = (
  categories: { category: string; amount: number; percentage: number }[],
  income: number,
  expenses: number
): InsightSuggestion[] => {
  const suggestions: InsightSuggestion[] = [];

  // 1. High Level Checks
  if (expenses > income && income > 0) {
    suggestions.push({
      title: "Overspending Alert",
      description: "You are spending more than you earn this month. Review your non-essential expenses.",
      type: "warning"
    });
  }

  // 2. Category Specific
  const food = categories.find(c => c.category.toLowerCase().includes('food') || c.category.toLowerCase().includes('groceries'));
  if (food && food.percentage > 25) {
    suggestions.push({
      title: "High Food Costs",
      description: `Food accounts for ${food.percentage.toFixed(1)}% of your spending. Try cooking at home more often.`,
      type: "tip"
    });
  }

  const rent = categories.find(c => c.category.toLowerCase().includes('rent') || c.category.toLowerCase().includes('housing'));
  if (rent && rent.percentage > 40) {
    suggestions.push({
      title: "High Housing Costs",
      description: "Housing is consuming a large portion of your income (>40%).",
      type: "warning"
    });
  }

  const subscriptions = categories.find(c => c.category.toLowerCase().includes('entertainment'));
  if (subscriptions && subscriptions.percentage > 10) {
    suggestions.push({
      title: "Subscription Review",
      description: "Entertainment costs are adding up. Check for unused subscriptions.",
      type: "tip"
    });
  }

  // 3. Positive Reinforcement
  if (expenses < income * 0.8 && income > 0) {
    suggestions.push({
      title: "Great Savings Rate",
      description: "You're saving more than 20% of your income. Keep it up!",
      type: "success"
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      title: "Track More Data",
      description: "Add more transactions to get personalized financial insights.",
      type: "tip"
    });
  }

  return suggestions;
};
