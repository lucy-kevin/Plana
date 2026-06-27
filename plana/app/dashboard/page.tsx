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
  const [editBudgetPlan, setEditBudgetPlan] = useState<string | null>(null);
  const [newBudget, setNewBudget] = useState<Record<string, string>>({});
  const [savingBudget, setSavingBudget] = useState<string | null>(null);

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

  async function updateBudget(plan: Plan) {
    const amount = Number(newBudget[plan.id]);
    if (!amount || amount <= 0) return;
    setSavingBudget(plan.id);
    const res = await fetch(`/api/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget: amount }),
    });
    if (res.ok) {
      setSavedPlans(savedPlans.map(p => p.id === plan.id ? { ...p, budget: amount } : p));
      setNewBudget(prev => ({ ...prev, [plan.id]: '' }));
      setEditBudgetPlan(null);
    }
    setSavingBudget(null);
  }

  const totalSaved = savedPlans.reduce((s, p) => s + (p.total_saved ?? 0), 0);
  const totalBudget = savedPlans.reduce((s, p) => s + (p.budget ?? 0), 0);
  const overallPct = totalBudget > 0 ? Math.min((totalSaved / totalBudget) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">

      {/* Nav */}
      <nav className="nav-bar">
        <Link href="/" className="text-2xl font-serif tracking-tight text-foreground">Plana</Link>
        <button
          onClick={() => { setPhone(''); router.push('/login'); }}
          className="text-xs font-bold text-muted hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </nav>

      <div className="p-6 md:p-12">

        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <h1 className="text-5xl font-serif text-foreground tracking-tight">My Plans</h1>
            <p className="text-body mt-3 text-lg">Track what you have saved toward each goal.</p>
          </div>
          <button
            onClick={() => router.push('/setup')}
            className="bg-button-bg text-button-text px-8 py-4 rounded-2xl font-bold hover:bg-button-hover transition-all shadow-xl shadow-button-bg/10 active:scale-[0.98]"
          >
            + New Plan
          </button>
        </header>

        {/* Overall savings hero */}
        {!loading && savedPlans.length > 0 && (
          <div className="savings-section mb-10">
            <p className="badge-micropill text-white/40 mb-6">Overall savings progress</p>
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
            <h2 className="text-sm font-black text-muted uppercase tracking-widest pl-1">Your saving goals</h2>

            {loading ? (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-48 bg-surface rounded-[2rem] border border-border skeleton" />)}
              </div>
            ) : savedPlans.length === 0 ? (
              <div className="bg-surface p-10 rounded-[2rem] border border-border text-center">
                <p className="text-2xl font-serif text-foreground mb-3">No plans yet.</p>
                <p className="text-sm text-body mb-6 leading-relaxed">
                  Create your first plan and Plana AI will tell you exactly how much to save each week to reach your goal.
                </p>
                <button
                  onClick={() => router.push('/setup')}
                  className="bg-button-bg text-button-text px-8 py-4 rounded-2xl font-bold hover:bg-button-hover transition-all"
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
                  <div key={plan.id} className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden">

                    {/* Progress bar as top strip */}
                    <div className="h-2 w-full bg-accent-bg">
                      <div
                        className={`h-full transition-all duration-700 ${isComplete ? 'bg-green-500' : pct >= 70 ? 'bg-warning' : 'bg-button-bg'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h3 className="text-2xl font-serif text-foreground capitalize">
                            {plan.type}{plan.location ? ` in ${plan.location}` : ''}
                          </h3>
                          <p className="text-body mt-1 text-sm">
                            {plan.guest_count ? `${plan.guest_count} guests` : ''}
                            {plan.guest_count && plan.event_date ? ' · ' : ''}
                            {plan.event_date ? date(plan.event_date) : ''}
                          </p>
                        </div>
                        {isComplete ? (
                          <span className="badge-status bg-green-50 text-green-700 border-green-200">
                            Goal reached
                          </span>
                        ) : pct >= 70 ? (
                          <span className="badge-status bg-[#FFF8F0] text-warning border-[#FDE68A]">
                            Almost there
                          </span>
                        ) : (
                          <span className="badge-status bg-accent-bg text-body border-border">
                            Saving
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6 p-5 bg-input-bg rounded-2xl">
                        <div>
                          <p className="badge-micropill mb-1">Saved</p>
                          <p className="text-lg font-bold text-foreground">UGX {fmt(plan.total_saved)}</p>
                        </div>
                        <div>
                          <p className="badge-micropill mb-1">Remaining</p>
                          <p className="text-lg font-bold text-foreground">UGX {fmt(remaining)}</p>
                        </div>
                        <div>
                          <p className="badge-micropill mb-1">Progress</p>
                          <p className="text-lg font-bold text-foreground">{pct.toFixed(0)}%</p>
                        </div>
                      </div>

                      {target && weeks !== null && weeks > 0 && !isComplete && (
                        <div className="flex items-center justify-between p-5 bg-button-bg rounded-2xl mb-6">
                          <div>
                            <p className="badge-micropill text-white/40 mb-1">Save per week</p>
                            <p className="text-2xl font-serif text-white">UGX {fmt(target)}</p>
                          </div>
                          <div className="text-right">
                            <p className="badge-micropill text-white/40 mb-1">Weeks left</p>
                            <p className="text-2xl font-serif text-white">{weeks}</p>
                          </div>
                        </div>
                      )}

                      {!isComplete && (
                        <>
                          <button
                            onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                            className="w-full text-xs font-black text-primary uppercase tracking-widest py-2 hover:text-foreground transition-colors text-left"
                          >
                            {isExpanded ? 'Close ↑' : '+ Log a deposit'}
                          </button>

                          {isExpanded && (
                            <div className="mt-3 flex gap-3">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">UGX</span>
                                <input
                                  type="number"
                                  value={depositAmount[plan.id] ?? ''}
                                  onChange={e => setDepositAmount(prev => ({ ...prev, [plan.id]: e.target.value }))}
                                  placeholder="How much did you save?"
                                  className="w-full pl-14 py-4 bg-input-bg rounded-2xl border-2 border-transparent focus:border-foreground outline-none font-bold text-foreground text-sm transition-all"
                                />
                              </div>
                              <button
                                onClick={() => logDeposit(plan)}
                                disabled={depositing === plan.id || !depositAmount[plan.id]}
                                className="bg-button-bg text-button-text px-6 rounded-2xl font-bold text-sm hover:bg-button-hover disabled:opacity-50 transition-all"
                              >
                                {depositing === plan.id ? 'Saving...' : 'Add'}
                              </button>
                            </div>
                          )}
                        </>
                      )}

                      {/* Edit budget */}
                      <div className="mt-2 pt-4 border-t border-border">
                        <button
                          onClick={() => setEditBudgetPlan(editBudgetPlan === plan.id ? null : plan.id)}
                          className="text-xs font-black text-muted uppercase tracking-widest hover:text-foreground transition-colors"
                        >
                          {editBudgetPlan === plan.id ? 'Cancel ↑' : 'Edit budget'}
                        </button>

                        {editBudgetPlan === plan.id && (
                          <div className="mt-3 flex gap-3">
                            <div className="relative flex-1">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted">UGX</span>
                              <input
                                type="number"
                                value={newBudget[plan.id] ?? ''}
                                onChange={e => setNewBudget(prev => ({ ...prev, [plan.id]: e.target.value }))}
                                placeholder={`Current: ${fmt(plan.budget ?? 0)}`}
                                className="w-full pl-14 py-4 bg-input-bg rounded-2xl border-2 border-transparent focus:border-foreground outline-none font-bold text-foreground text-sm transition-all"
                              />
                            </div>
                            <button
                              onClick={() => updateBudget(plan)}
                              disabled={savingBudget === plan.id || !newBudget[plan.id]}
                              className="bg-button-bg text-button-text px-6 rounded-2xl font-bold text-sm hover:bg-button-hover disabled:opacity-50 transition-all"
                            >
                              {savingBudget === plan.id ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        )}
                      </div>

                      {isComplete && (
                        <div className="mt-2 pt-5 border-t border-border">
                          <Link
                            href="/breakdown/marketplace"
                            className="text-xs font-black text-primary uppercase tracking-widest hover:text-foreground transition-colors"
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
            <h2 className="text-sm font-black text-muted uppercase tracking-widest pl-1 mb-6">Quick actions</h2>

            <div className="bg-surface p-6 rounded-[2rem] border border-border">
              <p className="badge-micropill mb-3">Saving tip</p>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                Saving consistently every week — even a small amount — beats saving in big bursts. Set a weekly reminder to log your deposit.
              </p>
            </div>

            <Link
              href="/breakdown/marketplace"
              className="block bg-surface p-6 rounded-[2rem] border border-border hover:border-foreground/30 transition-all"
            >
              <p className="font-bold text-foreground mb-1">Find providers</p>
              <p className="text-xs text-body leading-relaxed">Browse verified caterers, venues, photographers and more near you.</p>
              <p className="text-xs font-black text-primary mt-3 uppercase tracking-widest">Browse marketplace →</p>
            </Link>

            <div className="bg-surface p-6 rounded-[2rem] border border-border">
              <p className="badge-micropill mb-2">No data? No problem.</p>
              <p className="text-2xl font-serif font-bold text-foreground">*384*200253#</p>
              <p className="text-xs text-body mt-1">Access Plana from any phone via USSD.</p>
            </div>
          </aside>
        </section>

      </div>
    </div>
  );
}
