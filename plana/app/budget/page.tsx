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
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm text-center">
        <p className="badge-micropill mb-4">
          {draft.type || 'Your plan'} · {draft.location || 'Uganda'}
        </p>
        <h1 className="text-4xl font-serif text-foreground mb-3">Set your budget</h1>
        <p className="text-body mb-10 text-base">What is the total amount you want to spend?</p>

        <div className="relative mb-8">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-muted text-sm">UGX</span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            className="w-full pl-16 py-6 text-4xl font-black text-foreground bg-surface rounded-3xl border-2 border-border shadow-sm outline-none focus:border-foreground focus:ring-4 focus:ring-foreground/5 transition-all"
          />
        </div>

        {amount && Number(amount) > 0 && (
          <p className="text-xs text-muted font-medium mb-8">
            UGX {Number(amount).toLocaleString()}
          </p>
        )}

        <button
          onClick={proceed}
          disabled={!amount || Number(amount) <= 0}
          className="btn-primary"
        >
          Generate AI breakdown
        </button>
      </div>
    </div>
  );
}
