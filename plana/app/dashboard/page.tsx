'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlanStore } from '@/frontend/store/planaStore';

interface Plan {
  id: string; type: string; location: string | null;
  budget: number | null; currency: string; guest_count: number | null;
  event_date: string | null; total_saved: number; created_at: string;
}

function fmt(n: number) { return n.toLocaleString(); }

function date(s: string) {
  return new Date(s).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function UserDashboard() {
  const router = useRouter();
  const { phone, setPhone, setSavedPlans, savedPlans, updateSavedPlanSavings } = usePlanStore();

  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState<Record<string, string>>({});
  const [depositing, setDepositing] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

  // If phone not in store, try localStorage fallback or redirect to login
  useEffect(() => {
    if (!phone) { router.push('/login'); return; }
    fetch(`/api/plans?phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(d => { setSavedPlans(d.plans ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [phone]);

  async function logDeposit(plan: Plan) {
    const amount = Number(depositAmount[plan.id]);
    if (!amount || amount <= 0) return;
    setDepositing(plan.id);

    const newTotal = (plan.total_saved ?? 0) + amount;
    const res = await fetch(`/api/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total_saved: newTotal }),
    });

    if (res.ok) {
      updateSavedPlanSavings(plan.id, newTotal);
      setDepositAmount(prev => ({ ...prev, [plan.id]: '' }));
    }
    setDepositing(null);
  }

  const totalSaved = savedPlans.reduce((s, p) => s + (p.total_saved ?? 0), 0);
  const totalBudget = savedPlans.reduce((s, p) => s + (p.budget ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="text-2xl font-serif tracking-tight text-[#2D2926]">Plana</Link>
        <button
          onClick={() => { setPhone(''); router.push('/login'); }}
          className="text-xs font-bold text-[#A8A29E] hover:text-[#2D2926] transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="p-6 md:p-12">

        <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-serif text-[#2D2926] tracking-tight">My Plans</h1>
            <p className="text-[#7D766D] mt-3 text-lg">Your events, budgets, and savings — all in one place.</p>
          </div>
          <button
            onClick={() => router.push('/setup')}
            className="bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold hover:bg-[#1A1614] transition-all shadow-xl shadow-[#2D2926]/10 active:scale-[0.98]"
          >
            + New Plan
          </button>
        </header>

        {/* Summary stat cards */}
        {savedPlans.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white p-6 rounded-[1.5rem] border border-[#EBE7E0]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Active plans</p>
              <p className="text-4xl font-serif text-[#2D2926]">{savedPlans.length}</p>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-[#EBE7E0]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Total saved</p>
              <p className="text-4xl font-serif text-[#065F46]">UGX {fmt(totalSaved)}</p>
            </div>
            <div className="bg-white p-6 rounded-[1.5rem] border border-[#EBE7E0] col-span-2 md:col-span-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Total budgeted</p>
              <p className="text-4xl font-serif text-[#2D2926]">UGX {fmt(totalBudget)}</p>
            </div>
          </div>
        )}

        {/* Plans */}
        <section className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1">Active Now</h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-36 bg-white rounded-[2rem] border border-[#EBE7E0] animate-pulse" />)}
              </div>
            ) : savedPlans.length === 0 ? (
              <div className="bg-white p-10 rounded-[2rem] border border-[#EBE7E0] text-center">
                <p className="text-2xl font-serif text-[#2D2926] mb-3">No plans yet.</p>
                <p className="text-sm text-[#7D766D] mb-6">Start by creating your first event plan.</p>
                <button
                  onClick={() => router.push('/setup')}
                  className="bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold hover:bg-[#1A1614] transition-all"
                >
                  Create a plan
                </button>
              </div>
            ) : (
              savedPlans.map(plan => {
                const pct = plan.budget ? Math.min((plan.total_saved / plan.budget) * 100, 100) : 0;
                const remaining = plan.budget ? plan.budget - plan.total_saved : 0;
                const isExpanded = expandedPlan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm hover:shadow-md transition-all"
                  >
                    {/* Plan header */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-serif text-[#2D2926] capitalize">{plan.type} {plan.location ? `in ${plan.location}` : ''}</h3>
                        <p className="text-[#7D766D] mt-1 text-sm font-medium">
                          Budget: UGX {plan.budget ? fmt(plan.budget) : '—'}
                          {plan.guest_count ? ` · ${plan.guest_count} guests` : ''}
                          {plan.event_date ? ` · ${date(plan.event_date)}` : ''}
                        </p>
                      </div>
                      {pct >= 100 ? (
                        <span className="bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                          Fully Saved
                        </span>
                      ) : pct >= 70 ? (
                        <span className="bg-[#FFF8F0] text-[#B45309] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FDE68A]">
                          Almost There
                        </span>
                      ) : (
                        <span className="bg-[#F4F0E8] text-[#7D766D] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#EBE7E0]">
                          In Progress
                        </span>
                      )}
                    </div>

                    {/* Savings progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs font-semibold text-[#A8A29E] mb-2">
                        <span>UGX {fmt(plan.total_saved)} saved</span>
                        <span>{pct.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-3 bg-[#F9F7F4] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? 'bg-green-500' : pct >= 70 ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {remaining > 0 && (
                        <p className="text-xs text-[#A8A29E] mt-2">UGX {fmt(remaining)} still needed</p>
                      )}
                    </div>

                    {/* Log deposit */}
                    <div
                      className="mt-4 pt-4 border-t border-[#EBE7E0] cursor-pointer"
                      onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                    >
                      <p className="text-xs font-black text-[#4F46E5] uppercase tracking-widest">
                        {isExpanded ? 'Close ↑' : 'Log a deposit →'}
                      </p>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 flex gap-3">
                        <div className="relative flex-1">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A8A29E]">UGX</span>
                          <input
                            type="number"
                            value={depositAmount[plan.id] ?? ''}
                            onChange={e => setDepositAmount(prev => ({ ...prev, [plan.id]: e.target.value }))}
                            placeholder="Amount saved"
                            className="w-full pl-14 py-4 bg-[#F9F7F4] rounded-2xl border-2 border-transparent focus:border-[#2D2926] outline-none font-bold text-[#2D2926] text-sm transition-all"
                          />
                        </div>
                        <button
                          onClick={() => logDeposit(plan)}
                          disabled={depositing === plan.id || !depositAmount[plan.id]}
                          className="bg-[#2D2926] text-[#FDFBF7] px-6 rounded-2xl font-bold text-sm hover:bg-[#1A1614] disabled:opacity-50 transition-all"
                        >
                          {depositing === plan.id ? 'Saving...' : 'Add'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4">
            <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1 mb-6">Quick actions</h2>
            <div className="space-y-4">
              <Link
                href="/breakdown/marketplace"
                className="block bg-white p-6 rounded-[2rem] border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all"
              >
                <p className="font-bold text-[#2D2926] mb-1">Find providers</p>
                <p className="text-xs text-[#7D766D] leading-relaxed">Browse verified caterers, venues, photographers and more near you.</p>
                <p className="text-xs font-black text-[#4F46E5] mt-3">Browse marketplace →</p>
              </Link>
              <div className="bg-white p-6 rounded-[2rem] border border-[#EBE7E0]">
                <p className="font-bold text-[#2D2926] mb-1">USSD access</p>
                <p className="text-xs text-[#7D766D] leading-relaxed">Access Plana from any phone without data.</p>
                <p className="text-2xl font-serif font-bold text-[#2D2926] mt-3">*384*200253#</p>
              </div>
            </div>
          </aside>
        </section>

      </div>
    </div>
  );
}
