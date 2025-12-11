import { Transaction } from "@/lib/types";

export const calculateTotalBalance = (transactions: Transaction[]): number => {
  return transactions.reduce((acc, t) => {
    const amount = Number(t.amount);
    return t.type === 'income' ? acc + amount : acc - amount;
  }, 0);
};

export const calculateMonthlyIncome = (transactions: Transaction[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'income';
    })
    .reduce((acc, t) => acc + Number(t.amount), 0);
};

export const calculateMonthlyExpenses = (transactions: Transaction[]): number => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === 'expense';
    })
    .reduce((acc, t) => acc + Number(t.amount), 0);
};

export const calculateCategoryTotals = (transactions: Transaction[]) => {
  const categories: Record<string, number> = {};
  let totalExpenses = 0;

  transactions.filter(t => t.type === 'expense').forEach(t => {
    const amount = Number(t.amount);
    categories[t.category] = (categories[t.category] || 0) + amount;
    totalExpenses += amount;
  });

  return Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    color: getCategoryColor(category)
  })).sort((a, b) => b.amount - a.amount);
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Housing: "bg-purple-500",
    Food: "bg-blue-500",
    Transportation: "bg-green-500",
    Utilities: "bg-yellow-500",
    Entertainment: "bg-pink-500",
    Shopping: "bg-orange-500",
    Healthcare: "bg-red-500",
    Education: "bg-indigo-500",
    Personal: "bg-teal-500",
    Salary: "bg-green-600",
    Freelance: "bg-blue-600",
    Investment: "bg-purple-600",
  };
  return colors[category] || "bg-gray-500";
};
