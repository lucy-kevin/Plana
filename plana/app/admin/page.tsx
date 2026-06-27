'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Tab = 'overview' | 'users' | 'plans' | 'providers';

interface Stats { users: number; plans: number; providers: number; pending: number; }
interface User { id: string; phone: string; name: string | null; created_at: string; }
interface Plan {
  id: string; phone: string; type: string | null; location: string | null;
  budget: number | null; currency: string; guest_count: number | null;
  event_date: string | null; total_saved: number; created_at: string;
}
interface Provider {
  id: string; name: string; phone: string; category: string; location: string;
  price_min: number | null; price_max: number | null; verified: boolean; created_at: string;
}

function fmt(n: number) { return n.toLocaleString(); }
function date(s: string) {
  return new Date(s).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(d => setStats(d));
  }, []);

  useEffect(() => {
    if (tab === 'users' && users.length === 0) {
      setLoading(true);
      fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d.users ?? []); setLoading(false); });
    }
    if (tab === 'plans' && plans.length === 0) {
      setLoading(true);
      fetch('/api/admin/plans').then(r => r.json()).then(d => { setPlans(d.plans ?? []); setLoading(false); });
    }
    if (tab === 'providers' && providers.length === 0) {
      setLoading(true);
      fetch('/api/admin/providers').then(r => r.json()).then(d => { setProviders(d.providers ?? []); setLoading(false); });
    }
  }, [tab]);

  async function approve(provider: Provider) {
    setApproving(provider.id);
    const res = await fetch(`/api/admin/providers/${provider.id}/approve`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setProviders(prev => prev.map(p => p.id === provider.id ? { ...p, verified: true } : p));
      setStats(prev => prev ? { ...prev, providers: prev.providers + 1, pending: prev.pending - 1 } : prev);
      showToast(data.message);
    } else {
      showToast(data.error ?? 'Approval failed');
    }
    setApproving(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'users', label: 'Users', badge: stats?.users },
    { key: 'plans', label: 'Plans', badge: stats?.plans },
    { key: 'providers', label: 'Providers', badge: stats?.pending ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">

      {toast && (
        <div className="toast">{toast}</div>
      )}

      {/* Nav */}
      <nav className="nav-bar">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-serif tracking-tight">Plana</Link>
          <span className="badge-micropill border border-border px-3 py-1 rounded-full">Admin</span>
        </div>
        {(stats?.pending ?? 0) > 0 && (
          <button onClick={() => setTab('providers')} className="text-xs font-bold bg-button-bg text-button-text px-4 py-2 rounded-full">
            {stats!.pending} pending approval
          </button>
        )}
      </nav>

      <div className="px-6 md:px-16 py-12">

        {/* Header */}
        <div className="mb-10">
          <p className="badge-micropill mb-2">Plana admin</p>
          <h1 className="text-4xl font-serif">Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10 flex-wrap">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`btn-filter ${tab === t.key ? 'btn-filter-active' : ''}`}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`ml-2 px-1.5 rounded-full text-[10px] font-black ${tab === t.key ? 'bg-white/20' : 'bg-accent-bg'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
              {[
                { label: 'Total users', value: stats?.users },
                { label: 'Plans created', value: stats?.plans },
                { label: 'Live providers', value: stats?.providers },
                { label: 'Pending approval', value: stats?.pending, alert: (stats?.pending ?? 0) > 0 },
              ].map(s => (
                <div key={s.label} className={`rounded-[1.5rem] border-2 p-6 ${s.alert ? 'border-amber-200 bg-amber-50' : 'border-border bg-surface'}`}>
                  <p className="badge-micropill mb-3">{s.label}</p>
                  <p className="text-4xl font-serif text-foreground">{s.value ?? '—'}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { label: 'Manage users', desc: 'See every account registered on Plana.', tab: 'users' as Tab },
                { label: 'View all plans', desc: 'Browse every event plan and its budget.', tab: 'plans' as Tab },
                { label: 'Approve providers', desc: 'Review pending registrations and go live.', tab: 'providers' as Tab },
              ].map(card => (
                <button
                  key={card.label}
                  onClick={() => setTab(card.tab)}
                  className="text-left bg-surface rounded-[1.5rem] border border-border p-6 hover:border-foreground transition-all group"
                >
                  <p className="font-bold text-foreground mb-1 group-hover:underline underline-offset-4">{card.label}</p>
                  <p className="text-xs text-body leading-relaxed">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div>
            {loading ? (
              <p className="text-sm text-muted font-medium">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted font-medium">No users yet.</p>
            ) : (
              <>
                <p className="text-xs text-muted font-semibold mb-6">{users.length} registered</p>
                <div className="divide-y divide-border">
                  {users.map(u => (
                    <div key={u.id} className="py-5 grid grid-cols-3 gap-4 items-center">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{u.name ?? 'No name'}</p>
                        <p className="text-xs text-body mt-0.5">{u.phone}</p>
                      </div>
                      <p className="text-xs text-muted">{date(u.created_at)}</p>
                      <p className="badge-micropill text-muted-lighter text-right">{u.id.slice(0, 8)}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Plans */}
        {tab === 'plans' && (
          <div>
            {loading ? (
              <p className="text-sm text-muted font-medium">Loading...</p>
            ) : plans.length === 0 ? (
              <p className="text-sm text-muted font-medium">No plans yet.</p>
            ) : (
              <>
                <p className="text-xs text-muted font-semibold mb-6">{plans.length} plans created</p>
                <div className="divide-y divide-border">
                  {plans.map(p => (
                    <div key={p.id} className="py-5 grid md:grid-cols-4 gap-4 items-start">
                      <div>
                        <p className="font-semibold text-sm text-foreground capitalize">{p.type ?? 'Custom'}</p>
                        <p className="text-xs text-body mt-0.5">{p.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium mb-0.5">Budget</p>
                        <p className="text-sm font-bold text-foreground">
                          {p.budget ? `${p.currency} ${fmt(p.budget)}` : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted font-medium mb-0.5">{p.location ?? '—'}</p>
                        <p className="text-xs text-body">{p.guest_count ? `${p.guest_count} guests` : ''}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted">{date(p.created_at)}</p>
                        {p.event_date && (
                          <p className="text-xs text-body mt-0.5">Event: {date(p.event_date)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Providers */}
        {tab === 'providers' && (
          <div>
            {loading ? (
              <p className="text-sm text-muted font-medium">Loading...</p>
            ) : providers.length === 0 ? (
              <p className="text-sm text-muted font-medium">No providers yet.</p>
            ) : (
              <>
                <div className="flex gap-4 mb-6 text-xs font-semibold text-muted">
                  <span>{providers.filter(p => !p.verified).length} pending</span>
                  <span>·</span>
                  <span>{providers.filter(p => p.verified).length} live</span>
                </div>
                <div className="divide-y divide-border">
                  {providers.map(p => (
                    <div key={p.id} className="py-6 grid md:grid-cols-4 gap-4 items-center">
                      <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-1">
                          <p className="font-bold text-sm text-foreground">{p.name}</p>
                          <span className={`badge-status ${
                            p.verified
                              ? 'text-green-700 bg-green-50 border-green-200'
                              : 'text-amber-700 bg-amber-50 border-amber-200'
                          }`}>
                            {p.verified ? 'Live' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-body">{p.phone}</p>
                        <p className="text-xs text-muted mt-0.5">{p.category} · {p.location}</p>
                      </div>
                      <div>
                        {(p.price_min || p.price_max) ? (
                          <p className="text-xs text-body">
                            UGX {p.price_min ? fmt(p.price_min) : '—'} – {p.price_max ? fmt(p.price_max) : '—'}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-lighter">No price</p>
                        )}
                        <p className="text-[10px] text-muted-lighter mt-1">{date(p.created_at)}</p>
                      </div>
                      <div className="flex justify-end">
                        {!p.verified ? (
                          <button
                            onClick={() => approve(p)}
                            disabled={approving === p.id}
                            className="bg-button-bg text-button-text px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-button-hover transition-colors disabled:opacity-50"
                          >
                            {approving === p.id ? 'Approving...' : 'Approve & notify'}
                          </button>
                        ) : (
                          <span className="text-xs text-muted font-medium">Approved</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
