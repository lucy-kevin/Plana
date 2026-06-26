// components/breakdown/BudgetBar.tsx
'use client';
import { usePlanStore } from '@/frontend/store/planaStore';
import { getBudgetBarStatus } from '@/frontend/lib/calculations';

export const BudgetBar = () => {
  const { plan } = usePlanStore();
  
  if (!plan) return null;

  const allocated = plan.items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const total = plan.totalBudget;
  const progress = Math.min((allocated / total) * 100, 100);
  const status = getBudgetBarStatus(allocated, total);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span>Budget: {allocated} / {total}</span>
        <span className={status.color.replace('bg-', 'text-')}>{status.label}</span>
      </div>
      
      {/* The Progress Bar */}
      <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${status.color}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {progress >= 100 && (
        <p className="text-xs text-red-600">
          You are over budget — edit an item or increase your budget[cite: 34].
        </p>
      )}
    </div>
  );
};