'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';
import { apiClient } from '@/frontend/lib/api';

export default function BudgetInput() {
  const [amount, setAmount] = useState<string>('');
  const { plan, setPlan, setIsCalculating, isCalculating } = usePlanStore();
  const router = useRouter();

  const handleCalculate = async () => {
    if (!plan) return; // Safety check
    setIsCalculating(true);
    try {
      const breakdown = await apiClient('/api/ai-breakdown', { 
         method: 'POST', 
         body: JSON.stringify({ type: plan.type, budget: Number(amount) }) 
      });
      
      // Merge AI result into existing plan state
      setPlan({ ...plan, totalBudget: Number(amount), items: breakdown.items });
      router.push('/breakdown');
    } catch (e) {
      console.error("AI Generation failed:", e);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-serif text-[#2D2926] mb-4">Set your budget</h1>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full pl-6 py-6 text-4xl font-black text-[#2D2926] bg-white rounded-3xl border mb-8"
        />
        <button 
          onClick={handleCalculate}
          disabled={isCalculating}
          className="w-full bg-[#2D2926] text-white py-5 rounded-2xl font-bold"
        >
          {isCalculating ? 'Calculating...' : 'Calculate Breakdown'}
        </button>
      </div>
    </div>
  );
}