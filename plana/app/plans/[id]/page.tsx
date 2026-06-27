'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface LineItem {
  category: string;
  amount: number;
  tip?: string;
  checked?: boolean;
}

interface Plan {
  id: string; type: string; location: string | null;
  budget: number | null; currency: string; guest_count: number | null;
  event_date: string | null; total_saved: number;
  breakdown: LineItem[] | null;
}

function fmt(n: number) { return n.toLocaleString(); }

export default function PlanList() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [items, setItems] = useState<LineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  // New item form
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  useEffect(() => {
    fetch(`/api/plans/${id}`)
      .then(r => r.json())
      .then(d => {
        const p: Plan = d.plan;
        setPlan(p);
        setItems(p.breakdown ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function saveItems(updated: LineItem[]) {
    setSaving(true);
    await fetch(`/api/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ breakdown: updated }),
    });
    setSaving(false);
  }

  function addItem() {
    if (!newName.trim()) return;
    const updated = [...items, { category: newName.trim(), amount: Number(newAmount) || 0, checked: false }];
    setItems(updated);
    saveItems(updated);
    setNewName('');
    setNewAmount('');
  }

  function toggleChecked(idx: number) {
    const updated = items.map((item, i) => i === idx ? { ...item, checked: !item.checked } : item);
    setItems(updated);
    saveItems(updated);
  }

  function removeItem(idx: number) {
    const updated = items.filter((_, i) => i !== idx);
    setItems(updated);
    saveItems(updated);
  }

  function updateAmount(idx: number, val: string) {
    const updated = items.map((item, i) => i === idx ? { ...item, amount: Number(val) || 0 } : item);
    setItems(updated);
  }

  function shareOnWhatsApp() {
    if (!plan) return;
    const currency = plan.currency ?? 'UGX';
    const total = items.reduce((s, i) => s + (i.amount || 0), 0);
    const lines = items.map(i =>
      `${i.checked ? '✓' : '○'} ${i.category}${i.amount ? `: ${currency} ${fmt(i.amount)}` : ''}`
    ).join('\n');
    const text = `*Plana — ${plan.type}${plan.location ? ` in ${plan.location}` : ''}*\nBudget: ${currency} ${fmt(plan.budget ?? 0)}\n\n${lines}\n\nTotal allocated: ${currency} ${fmt(total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  }

  function copyList() {
    if (!plan) return;
    const currency = plan.currency ?? 'UGX';
    const total = items.reduce((s, i) => s + (i.amount || 0), 0);
    const lines = items.map(i =>
      `${i.checked ? '[x]' : '[ ]'} ${i.category}${i.amount ? ` — ${currency} ${fmt(i.amount)}` : ''}`
    ).join('\n');
    const text = `${plan.type}${plan.location ? ` in ${plan.location}` : ''} — Budget: ${currency} ${fmt(plan.budget ?? 0)}\n\n${lines}\n\nTotal: ${currency} ${fmt(total)}`;
    navigator.clipboard.writeText(text);
    setShared(true);
    setTimeout(() => setShared(false), 3000);
  }

  const totalAllocated = items.reduce((s, i) => s + (i.amount || 0), 0);
  const isOver = plan?.budget ? totalAllocated > plan.budget : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-[#A8A29E] font-medium">Loading list...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="text-[#A8A29E] font-medium">Plan not found.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="text-2xl font-serif tracking-tight text-[#2D2926]">Plana</Link>
        <button onClick={() => router.back()} className="text-xs font-bold text-[#A8A29E] hover:text-[#2D2926] transition-colors">
          ← Back
        </button>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-12">

        {/* Header */}
        <header className="mb-8">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-2 capitalize">
            {plan.type}{plan.location ? ` · ${plan.location}` : ''}
          </p>
          <h1 className="text-4xl font-serif text-[#2D2926] mb-1">Budget list</h1>
          <p className="text-[#7D766D] text-sm">
            Budget: {plan.currency} {fmt(plan.budget ?? 0)}
          </p>
        </header>

        {/* Budget bar */}
        <div className="bg-white p-6 rounded-[2rem] border border-[#EBE7E0] mb-6">
          <div className="flex justify-between items-end mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E]">Allocated</span>
            <span className={`text-xl font-bold ${isOver ? 'text-[#B45309]' : 'text-[#2D2926]'}`}>
              {plan.currency} {fmt(totalAllocated)}
            </span>
          </div>
          <div className="h-2 bg-[#F4F0E8] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`}
              style={{ width: `${Math.min((totalAllocated / (plan.budget || 1)) * 100, 100)}%` }}
            />
          </div>
          {isOver && (
            <p className="text-xs text-[#B45309] font-semibold mt-2">
              Over by {plan.currency} {fmt(totalAllocated - (plan.budget ?? 0))}
            </p>
          )}
          {!isOver && plan.budget && (
            <p className="text-xs text-[#A8A29E] font-medium mt-2">
              {plan.currency} {fmt((plan.budget ?? 0) - totalAllocated)} unallocated
            </p>
          )}
        </div>

        {/* Items list */}
        <div className="space-y-3 mb-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-5 bg-white rounded-3xl border transition-all ${item.checked ? 'border-green-200 bg-green-50/40' : 'border-[#EBE7E0]'}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleChecked(idx)}
                className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.checked ? 'border-green-500 bg-green-500 text-white' : 'border-[#EBE7E0] hover:border-[#2D2926]'
                }`}
              >
                {item.checked && <span className="text-xs font-black">✓</span>}
              </button>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <input
                  value={item.category}
                  onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, category: e.target.value } : it))}
                  onBlur={() => saveItems(items)}
                  className={`font-bold text-sm bg-transparent outline-none w-full border-b-2 border-transparent focus:border-[#2D2926]/20 transition-all ${item.checked ? 'line-through text-[#A8A29E]' : 'text-[#2D2926]'}`}
                />
                {item.tip && <p className="text-xs text-[#A8A29E] mt-0.5">{item.tip}</p>}
              </div>

              {/* Amount */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[10px] font-bold text-[#A8A29E]">{plan.currency}</span>
                <input
                  type="number"
                  value={item.amount || ''}
                  onChange={e => updateAmount(idx, e.target.value)}
                  onBlur={() => saveItems(items)}
                  placeholder="0"
                  className={`w-28 text-right font-bold text-sm bg-[#F9F7F4] p-2.5 rounded-xl border-2 border-transparent focus:border-[#2D2926]/20 outline-none transition-all ${item.checked ? 'text-[#A8A29E]' : 'text-[#2D2926]'}`}
                />
              </div>

              {/* Remove */}
              <button
                onClick={() => removeItem(idx)}
                className="shrink-0 text-[#C8C0B8] hover:text-red-500 transition-colors font-bold text-lg leading-none"
              >×</button>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 text-[#A8A29E] text-sm font-medium">
              No items yet. Add your first one below.
            </div>
          )}
        </div>

        {/* Add item */}
        <div className="bg-white p-5 rounded-3xl border-2 border-dashed border-[#EBE7E0] mb-8">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-3">Add item</p>
          <div className="flex gap-3">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="e.g. Crate of soda, MC fees, Cake..."
              className="flex-1 p-3.5 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none text-sm transition-all"
            />
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold text-[#A8A29E]">{plan.currency}</span>
              <input
                type="number"
                value={newAmount}
                onChange={e => setNewAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="0"
                className="w-28 text-right p-3.5 bg-[#F9F7F4] rounded-2xl font-bold text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none text-sm transition-all"
              />
            </div>
            <button
              onClick={addItem}
              disabled={!newName.trim()}
              className="bg-[#2D2926] text-[#FDFBF7] px-5 rounded-2xl font-bold text-sm hover:bg-[#1A1614] disabled:opacity-40 transition-all"
            >
              Add
            </button>
          </div>
        </div>

        {/* Share actions */}
        <div className="space-y-3">
          <button
            onClick={shareOnWhatsApp}
            className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-bold text-base hover:bg-[#1EB058] transition-all shadow-lg shadow-[#25D366]/20 active:scale-[0.98]"
          >
            {shared ? 'Opening WhatsApp...' : 'Share on WhatsApp'}
          </button>
          <button
            onClick={copyList}
            className="w-full border-2 border-[#EBE7E0] text-[#7D766D] py-4 rounded-2xl font-bold text-sm hover:border-[#2D2926] hover:text-[#2D2926] transition-all"
          >
            {shared ? 'Copied!' : 'Copy list to clipboard'}
          </button>
        </div>

        {saving && (
          <p className="text-center text-xs text-[#A8A29E] font-medium mt-6">Saving...</p>
        )}
      </div>
    </main>
  );
}
