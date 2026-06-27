'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';

interface BreakdownItem { category: string; amount: number; percentage: number; tip?: string; }

export default function AIPlanningBreakdown() {
  const router = useRouter();
  const { draft, phone, setSavedPlanId } = usePlanStore();

  const [items, setItems] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingsAdvice, setSavingsAdvice] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState<number | null>(null);
  const [error, setError] = useState('');

  const budget = draft.budget || 0;
  const totalAllocated = items.reduce((s, i) => s + i.amount, 0);
  const isOver = totalAllocated > budget;

  useEffect(() => {
    if (!budget) { router.push('/budget'); return; }

    // Fetch AI breakdown
    fetch('/api/ai-breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planType: draft.type,
        location: draft.location,
        budget,
        guestCount: draft.guestCount || undefined,
        currency: 'UGX',
      }),
    })
      .then(r => r.json())
      .then(d => {
        setItems(d.breakdown ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch savings advice in parallel
    if (draft.eventDate) {
      fetch('/api/ai-savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: draft.type,
          totalBudget: budget,
          totalSaved: 0,
          eventDate: draft.eventDate,
          currency: 'UGX',
        }),
      })
        .then(r => r.json())
        .then(d => {
          setSavingsAdvice(d.advice ?? '');
          setWeeklyTarget(d.weeklyTarget ?? null);
        })
        .catch(() => {});
    }
  }, []);

  async function confirmAndSave() {
    if (!phone) { router.push('/login'); return; }
    setSaving(true);
    setError('');

    const res = await fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        type: draft.type,
        location: draft.location,
        budget,
        currency: 'UGX',
        guestCount: draft.guestCount || undefined,
        eventDate: draft.eventDate || undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Could not save plan.'); setSaving(false); return; }

    setSavedPlanId(data.plan.id);
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-4">Plana AI</p>
          <p className="text-2xl font-serif text-[#2D2926]">Building your breakdown...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-16 px-6 font-sans">
      <div className="max-w-2xl mx-auto">

        <header className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-3">
            {draft.type} · {draft.location} · UGX {budget.toLocaleString()}
          </p>
          <h1 className="text-4xl font-serif text-[#2D2926]">Your AI Budget</h1>
          <p className="text-[#7D766D] mt-2 text-base">Adjust your allocations as needed.</p>
        </header>

        {/* Budget usage bar */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EBE7E0] mb-8">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E]">Budget usage</span>
            <span className={`text-2xl font-bold ${isOver ? 'text-[#B45309]' : 'text-[#2D2926]'}`}>
              {budget > 0 ? ((totalAllocated / budget) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="h-3 bg-[#F9F7F4] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${isOver ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`}
              style={{ width: `${Math.min((totalAllocated / budget) * 100, 100)}%` }}
            />
          </div>
          {isOver && (
            <p className="text-xs text-[#B45309] font-semibold mt-3">
              Over budget by UGX {(totalAllocated - budget).toLocaleString()}. Adjust the amounts below.
            </p>
          )}
        </div>

        {/* Savings advice — shown first because saving is the goal */}
        {(savingsAdvice || weeklyTarget) && (
          <div className="bg-[#2D2926] rounded-[2rem] p-8 mb-8 text-[#FDFBF7]">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">How to reach this goal</p>
            {weeklyTarget && (
              <p className="text-3xl font-serif mb-3">
                UGX {weeklyTarget.toLocaleString()} <span className="text-lg font-sans text-white/60">/ week</span>
              </p>
            )}
            {savingsAdvice && (
              <p className="text-sm text-white/70 leading-relaxed">{savingsAdvice}</p>
            )}
          </div>
        )}

        {/* Category list */}
        <div className="space-y-3 mb-4">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all group">
              <div className="flex-1 min-w-0 mr-4">
                <input
                  value={item.category}
                  onChange={e => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], category: e.target.value };
                    setItems(updated);
                  }}
                  className="font-bold text-[#2D2926] bg-transparent outline-none w-full border-b-2 border-transparent focus:border-[#2D2926]/20 transition-all text-sm"
                />
                {item.tip && <p className="text-xs text-[#A8A29E] mt-0.5 leading-relaxed">{item.tip}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#A8A29E] font-medium text-sm">UGX</span>
                <input
                  type="number"
                  value={item.amount}
                  className="w-32 text-right font-bold text-[#2D2926] bg-[#F9F7F4] p-3 rounded-xl border-2 border-transparent focus:border-[#2D2926]/20 outline-none text-sm"
                  onChange={e => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], amount: Number(e.target.value) };
                    setItems(updated);
                  }}
                />
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#A8A29E] hover:text-red-500 font-bold text-lg leading-none ml-1"
                  title="Remove"
                >×</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add a custom line item */}
        <button
          onClick={() => setItems([...items, { category: 'New item', amount: 0, percentage: 0 }])}
          className="w-full mb-8 py-4 rounded-3xl border-2 border-dashed border-[#EBE7E0] text-[#A8A29E] hover:border-[#2D2926] hover:text-[#2D2926] font-bold text-sm transition-all"
        >
          + Add item
        </button>

        {error && (
          <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl mb-6">{error}</p>
        )}

        <button
          onClick={confirmAndSave}
          disabled={saving || isOver}
          className="w-full bg-[#2D2926] text-[#FDFBF7] py-6 rounded-2xl font-bold text-lg hover:bg-[#1A1614] disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
        >
          {saving ? 'Saving plan...' : 'Confirm and save plan'}
        </button>

        <button
          onClick={() => router.push('/breakdown/marketplace')}
          className="w-full mt-4 border-2 border-[#EBE7E0] text-[#7D766D] py-4 rounded-2xl font-bold text-base hover:border-[#2D2926] hover:text-[#2D2926] transition-all"
        >
          Find service providers
        </button>

      </div>
    </main>
  );
}
