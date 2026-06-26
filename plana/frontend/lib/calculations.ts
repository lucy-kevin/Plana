// lib/calculations.ts
import { BudgetItem } from '../types/types';

export const calculateTotalAllocated = (items: BudgetItem[]): number => {
  return items.reduce((sum, item) => sum + item.estimatedCost, 0);
};

export const getBudgetStatus = (allocated: number, total: number) => {
  const percentage = (allocated / total) * 100;
  if (percentage >= 100) return 'red'; // Over budget
  if (percentage >= 90) return 'amber'; // Near limit
  return 'green'; // Safe
};
export const getBudgetBarStatus = (allocated: number, total: number) => {
  if (total <= 0) return { color: 'bg-green-500', label: 'On Track' };

  const percentage = (allocated / total) * 100;
  
  if (percentage >= 100) return { color: 'bg-red-500', label: 'Over Budget' };
  if (percentage >= 90) return { color: 'bg-amber-500', label: 'Near Limit' };
  return { color: 'bg-green-500', label: 'On Track' };
};