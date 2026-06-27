'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';

interface BreakdownItem { category: string; amount: number; percentage: number; tip?: string; }

export default function AIPlanningBreakdown() {
  const router = useRouter();
  const { draft, phone, setSavedPlanId, setDraft } = usePlanStore();

  const [items, setItems] = useState<BreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingsAdvice, setSavingsAdvice] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  const budget = draft.budget || 0;
  const totalAllocated = items.reduce((s, i) => s + i.amount, 0);
  const isOver = totalAllocated > budget;

  useEffect(() => {
    if (!budget) { router.push('/budget'); return; }
    if (fetchedRef.current) return;
    fetchedRef.current = true;

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
        breakdown: items.length > 0 ? items : undefined,
      }),
    });

    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Could not save plan.'); setSaving(false); return; }

    setSavedPlanId(data.plan.id);
    setDraft({}); // clear the form for the next plan
    router.push('/dashboard');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="badge-micropill mb-4">Plana AI</p>
          <p className="text-2xl font-serif text-foreground">Building your breakdown...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-2xl mx-auto">

        <header className="mb-10">
          <p className="badge-micropill mb-3">
            {draft.type} · {draft.location} · UGX {budget.toLocaleString()}
          </p>
          <h1 className="text-4xl font-serif text-foreground">Your AI Budget</h1>
          <p className="text-body mt-2 text-base">Adjust your allocations as needed.</p>
        </header>

        {/* Budget usage bar */}
        <div className="card p-8 mb-8">
          <div className="flex justify-between items-end mb-4">
            <span className="badge-micropill">Budget usage</span>
            <span className={`text-2xl font-bold ${isOver ? 'text-warning' : 'text-foreground'}`}>
              {budget > 0 ? ((totalAllocated / budget) * 100).toFixed(0) : 0}%
            </span>
          </div>
          <div className="h-3 bg-input-bg rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-700 rounded-full ${isOver ? 'bg-warning' : 'bg-button-bg'}`}
              style={{ width: `${Math.min((totalAllocated / budget) * 100, 100)}%` }}
            />
          </div>
          {isOver && (
            <p className="text-xs text-warning font-semibold mt-3">
              Over budget by UGX {(totalAllocated - budget).toLocaleString()}. Adjust the amounts below.
            </p>
          )}
        </div>

        {/* Savings advice */}
        {(savingsAdvice || weeklyTarget) && (
          <div className="savings-section mb-8">
            <p className="badge-micropill text-white/40 mb-4">How to reach this goal</p>
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
            <div key={idx} className="flex items-center justify-between p-6 bg-surface rounded-3xl border border-border hover:border-foreground/20 transition-all">
              <div>
                <span className="font-bold text-foreground">{item.category}</span>
                {item.tip && <p className="text-xs text-muted mt-0.5 max-w-xs">{item.tip}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted font-medium text-sm">UGX</span>
                <input
                  type="number"
                  value={item.amount}
                  className="w-32 text-right font-bold text-foreground bg-input-bg p-3 rounded-xl border-2 border-transparent focus:border-foreground/20 outline-none text-sm"
                  onChange={e => {
                    const updated = [...items];
                    updated[idx] = { ...updated[idx], amount: Number(e.target.value) };
                    setItems(updated);
                  }}
                />
                <button
                  onClick={() => setItems(items.filter((_, i) => i !== idx))}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 font-bold text-lg leading-none ml-1"
                  title="Remove"
                >×</button>
              </div>
            </div>
          ))}
        </div>

        {/* Add a custom line item */}
        <button
          onClick={() => setItems([...items, { category: 'New item', amount: 0, percentage: 0 }])}
          className="w-full mb-8 py-4 rounded-3xl border-2 border-dashed border-border text-muted hover:border-foreground hover:text-foreground font-bold text-sm transition-all"
        >
          + Add item
        </button>

        {error && (
          <p className="error-banner mb-6">{error}</p>
        )}

        <button
          onClick={confirmAndSave}
          disabled={saving || isOver}
          className="w-full bg-button-bg text-button-text py-6 rounded-2xl font-bold text-lg hover:bg-button-hover disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
        >
          {saving ? 'Saving plan...' : 'Confirm and save plan'}
        </button>

        <button
          onClick={() => router.push('/breakdown/marketplace')}
          className="btn-secondary mt-4"
        >
          Find service providers
        </button>

      </div>
    </main>
  );
}
