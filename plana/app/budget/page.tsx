// app/budget/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BudgetInput() {
  const [amount, setAmount] = useState<string>('');
  const router = useRouter();

  const handleContinue = () => {
    // In a real app, you would save this to state or a global store
    console.log("Total Budget set to:", amount);
    router.push('/breakdown'); // Leads to the AI calculation
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Total Budget</h1>
        <p className="text-gray-500 mb-8">Set your financial envelope for this plan.</p>

        <div className="relative mb-8">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">UGX</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-20 pr-6 py-6 text-4xl font-extrabold text-gray-900 bg-white rounded-3xl border border-gray-200 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
        </div>

        <button 
          disabled={!amount || Number(amount) <= 0}
          onClick={handleContinue}
          className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Generate Breakdown
        </button>
      </div>
    </div>
  );
}