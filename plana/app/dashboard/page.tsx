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

function weeksUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24 * 7)));
}

function weeklyTarget(plan: Plan) {
  if (!plan.budget || !plan.event_date) return null;
  const remaining = plan.budget - (plan.total_saved ?? 0);
  const weeks = weeksUntil(plan.event_date);
  if (weeks <= 0 || remaining <= 0) return null;
  return Math.ceil(remaining / weeks);
}

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
  const overallPct = totalBudget > 0 ? Math.min((totalSaved / totalBudget) * 100, 100) : 0;

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

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-serif text-[#2D2926] tracking-tight">My Plans</h1>
            <p className="text-[#7D766D] mt-3 text-lg">Track what you have saved toward each goal.</p>
          </div>
          <button
            onClick={() => router.push('/setup')}
            className="bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold hover:bg-[#1A1614] transition-all shadow-xl shadow-[#2D2926]/10 active:scale-[0.98]"
          >
            + New Plan
          </button>
        </header>

        {/* Overall savings hero — only when plans exist */}
        {!loading && savedPlans.length > 0 && (
          <div className="bg-[#2D2926] rounded-[2rem] p-8 md:p-10 mb-10 text-[#FDFBF7]">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-6">Overall savings progress</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
              <div>
                <p className="text-5xl font-serif">UGX {fmt(totalSaved)}</p>
                <p className="text-white/50 mt-1 text-sm font-medium">saved of UGX {fmt(totalBudget)} total goal</p>
              </div>
              <p className="text-5xl font-serif text-white/30">{overallPct.toFixed(0)}%</p>
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            {totalBudget > totalSaved && (
              <p className="text-xs text-white/40 mt-3 font-medium">
                UGX {fmt(totalBudget - totalSaved)} still to go across all plans
              </p>
            )}
          </div>
        )}

        <section className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1">Your saving goals</h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-white rounded-[2rem] border border-[#EBE7E0] animate-pulse" />)}
              </div>
            ) : savedPlans.length === 0 ? (
              <div className="bg-white p-10 rounded-[2rem] border border-[#EBE7E0] text-center">
                <p className="text-2xl font-serif text-[#2D2926] mb-3">No plans yet.</p>
                <p className="text-sm text-[#7D766D] mb-6 leading-relaxed">
                  Create your first plan and Plana AI will tell you exactly how much to save each week to reach your goal.
                </p>
                <button
                  onClick={() => router.push('/setup')}
                  className="bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold hover:bg-[#1A1614] transition-all"
                >
                  Start saving
                </button>
              </div>
            ) : (
              savedPlans.map(plan => {
                const pct = plan.budget ? Math.min((plan.total_saved / plan.budget) * 100, 100) : 0;
                const remaining = plan.budget ? Math.max(plan.budget - plan.total_saved, 0) : 0;
                const target = weeklyTarget(plan);
                const weeks = plan.event_date ? weeksUntil(plan.event_date) : null;
                const isExpanded = expandedPlan === plan.id;
                const isComplete = pct >= 100;

                return (
                  <div key={plan.id} className="bg-white rounded-[2rem] border border-[#EBE7E0] shadow-sm overflow-hidden">

                    {/* Progress bar as top strip */}
                    <div className="h-2 w-full bg-[#F4F0E8]">
                      <div
                        className={`h-full transition-all duration-700 ${isComplete ? 'bg-green-500' : pct >= 70 ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="p-8">
                      {/* Plan title + badge */}
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-serif text-[#2D2926] capitalize">
                            {plan.type}{plan.location ? ` in ${plan.location}` : ''}
                          </h3>
                          <p className="text-[#7D766D] mt-1 text-sm">
                            {plan.guest_count ? `${plan.guest_count} guests` : ''}
                            {plan.guest_count && plan.event_date ? ' · ' : ''}
                            {plan.event_date ? date(plan.event_date) : ''}
                          </p>
                        </div>
                        {isComplete ? (
                          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                            Goal reached
                          </span>
                        ) : pct >= 70 ? (
                          <span className="bg-[#FFF8F0] text-[#B45309] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FDE68A]">
                            Almost there
                          </span>
                        ) : (
                          <span className="bg-[#F4F0E8] text-[#7D766D] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#EBE7E0]">
                            Saving
                          </span>
                        )}
                      </div>

                      {/* Savings numbers — the main event */}
                      <div className="grid grid-cols-3 gap-4 mb-6 p-5 bg-[#F9F7F4] rounded-2xl">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Saved</p>
                          <p className="text-lg font-bold text-[#2D2926]">UGX {fmt(plan.total_saved)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Remaining</p>
                          <p className="text-lg font-bold text-[#2D2926]">UGX {fmt(remaining)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Progress</p>
                          <p className="text-lg font-bold text-[#2D2926]">{pct.toFixed(0)}%</p>
                        </div>
                      </div>

                      {/* Weekly target — only when we can calculate */}
                      {target && weeks !== null && weeks > 0 && !isComplete && (
                        <div className="flex items-center justify-between p-5 bg-[#2D2926] rounded-2xl mb-6">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Save per week</p>
                            <p className="text-2xl font-serif text-white">UGX {fmt(target)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Weeks left</p>
                            <p className="text-2xl font-serif text-white">{weeks}</p>
                          </div>
                        </div>
                      )}

                      {/* Log deposit */}
                      {!isComplete && (
                        <>
                          <button
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            className="w-full text-xs font-black text-[#4F46E5] uppercase tracking-widest py-2 hover:text-[#2D2926] transition-colors text-left"
                          >
                            {isExpanded ? 'Close ↑' : '+ Log a deposit'}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 flex gap-3">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#A8A29E]">UGX</span>
                                <input
                                  type="number"
                                  value={depositAmount[plan.id] ?? ''}
                                  onChange={e => setDepositAmount(prev => ({ ...prev, [plan.id]: e.target.value }))}
                                  placeholder="How much did you save?"
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
                        </>
                      )}

                      {isComplete && (
                        <div className="mt-2 pt-5 border-t border-[#EBE7E0]">
                          <Link
                            href="/breakdown/marketplace"
                            className="text-xs font-black text-[#4F46E5] uppercase tracking-widest hover:text-[#2D2926] transition-colors"
                          >
                            Find service providers →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Sidebar */}
          <aside className="md:col-span-4 space-y-4">
            <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1 mb-6">Quick actions</h2>

            <div className="bg-white p-6 rounded-[2rem] border border-[#EBE7E0]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-3">Saving tip</p>
              <p className="text-sm text-[#2D2926] leading-relaxed font-medium">
                Saving consistently every week — even a small amount — beats saving in big bursts. Set a weekly reminder to log your deposit.
              </p>
            </div>

            <Link
              href="/breakdown/marketplace"
              className="block bg-white p-6 rounded-[2rem] border border-[#EBE7E0] hover:border-[#2D2926]/30 transition-all"
            >
              <p className="font-bold text-[#2D2926] mb-1">Find providers</p>
              <p className="text-xs text-[#7D766D] leading-relaxed">Browse verified caterers, venues, photographers and more near you.</p>
              <p className="text-xs font-black text-[#4F46E5] mt-3 uppercase tracking-widest">Browse marketplace →</p>
            </Link>

            <div className="bg-white p-6 rounded-[2rem] border border-[#EBE7E0]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">No data? No problem.</p>
              <p className="text-2xl font-serif font-bold text-[#2D2926]">*384*200253#</p>
              <p className="text-xs text-[#7D766D] mt-1">Access Plana from any phone via USSD.</p>
            </div>
          </aside>
        </section>

      </div>
    </div>
  );
}
