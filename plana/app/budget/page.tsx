'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BudgetInput() {
  const [amount, setAmount] = useState<string>('');
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-4xl font-serif text-[#2D2926] mb-4">Set your budget</h1>
        <p className="text-[#7D766D] mb-10">What is the total envelope for this plan?</p>

        <div className="relative mb-8">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-[#A8A29E]">UGX</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full pl-16 py-6 text-4xl font-black text-[#2D2926] bg-white rounded-3xl border border-[#EBE7E0] shadow-sm outline-none focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-200"
          />
        </div>

        <button 
          onClick={() => router.push('/breakdown')}
          className="w-full bg-[#2D2926] text-white py-5 rounded-2xl font-bold hover:bg-black transition-all active:scale-[0.98]"
        >
          Calculate Breakdown
        </button>
      </div>
    </div>
  );
}