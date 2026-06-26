// app/breakdown/page.tsx
'use client';
import { usePlanStore } from '@/frontend/store/planaStore';
import { BudgetBar } from '../../frontend/components/breakdown/BudgetBar';

export default function BreakdownPage() {
  const { plan } = usePlanStore();

  if (!plan) return <div>No plan found. Please go back to setup.</div>;

  return (
    <div className="p-4">
      <h1>{plan.type} Planning</h1>
      <BudgetBar />
      {/* Table and Add Item logic will go here */}
    </div>
  );
}