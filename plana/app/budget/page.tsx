'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';

export default function BudgetInput() {
  const { draft, setDraft } = usePlanStore();
  const [amount, setAmount] = useState<string>(draft.budget ? String(draft.budget) : '');
  const router = useRouter();

  function proceed() {
    if (!amount || Number(amount) <= 0) return;
    setDraft({ budget: Number(amount) });
    router.push('/breakdown');
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-sm text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">
          {draft.type || 'Your plan'} · {draft.location || 'Uganda'}
        </p>
        <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Set your budget</h1>
        <p className="text-[#7D766D] mb-10 text-base">What is the total amount you want to spend?</p>

        <div className="relative mb-8">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-[#A8A29E] text-sm">UGX</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-16 py-6 text-4xl font-black text-[#2D2926] bg-white rounded-3xl border-2 border-[#EBE7E0] shadow-sm outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all"
          />
        </div>

        {amount && Number(amount) > 0 && (
          <p className="text-xs text-[#A8A29E] font-medium mb-8">
            UGX {Number(amount).toLocaleString()}
          </p>
        )}

        <button
          onClick={proceed}
          disabled={!amount || Number(amount) <= 0}
          className="w-full bg-[#2D2926] text-[#FDFBF7] py-5 rounded-2xl font-bold text-base hover:bg-[#1A1614] disabled:opacity-40 transition-all"
        >
          Generate AI breakdown
        </button>
      </div>
    </div>
  );
}
