'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Provider {
  id: string;
  name: string;
  phone: string;
  category: string;
  location: string;
  price_min: number | null;
  price_max: number | null;
  description: string | null;
  website: string | null;
  verified: boolean;
  created_at: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const [approving, setApproving] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetch('/api/admin/providers')
      .then((r) => r.json())
      .then((d) => {
        setProviders(d.providers ?? []);
        setLoading(false);
      });
  }, []);

  async function approve(provider: Provider) {
    setApproving(provider.id);
    const res = await fetch(`/api/admin/providers/${provider.id}/approve`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setProviders((prev) => prev.map((p) => p.id === provider.id ? { ...p, verified: true } : p));
      setToast(data.message);
      setTimeout(() => setToast(''), 4000);
    } else {
      setToast(data.error ?? 'Approval failed');
      setTimeout(() => setToast(''), 4000);
    }
    setApproving(null);
  }

  const filtered = providers.filter((p) => {
    if (filter === 'pending') return !p.verified;
    if (filter === 'approved') return p.verified;
    return true;
  });

  const pendingCount = providers.filter((p) => !p.verified).length;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}

      {/* Nav */}
      <nav className="nav-bar">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-serif tracking-tight">Plana</Link>
          <span className="badge-micropill border border-border px-3 py-1 rounded-full">Admin</span>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold bg-button-bg text-button-text px-3 py-1.5 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </nav>

      <div className="px-6 md:px-16 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="badge-micropill mb-3">Provider management</p>
          <h1 className="text-4xl font-serif">Service Providers</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-10">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn-filter ${filter === f ? 'btn-filter-active' : ''}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'pending' && pendingCount > 0 && (
                <span className="ml-2 bg-white/20 px-1.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-muted text-sm font-medium">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted text-sm font-medium">
            {filter === 'pending' ? 'No pending registrations.' : 'No providers found.'}
          </p>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((provider) => (
              <div key={provider.id} className="py-6 grid md:grid-cols-4 gap-4 items-start">

                {/* Identity */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-foreground">{provider.name}</p>
                    {provider.verified ? (
                      <span className="badge-status text-green-700 bg-green-50 border-green-200">
                        Live
                      </span>
                    ) : (
                      <span className="badge-status text-amber-700 bg-amber-50 border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-body mb-0.5">{provider.phone}</p>
                  <p className="text-xs text-muted">{provider.category} · {provider.location}</p>
                  {provider.description && (
                    <p className="text-xs text-body mt-2 leading-relaxed max-w-sm">{provider.description}</p>
                  )}
                  {provider.website && (
                    <p className="text-xs text-muted mt-1">{provider.website}</p>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  {provider.price_min || provider.price_max ? (
                    <>
                      <p className="badge-micropill mb-1">Price range</p>
                      <p className="text-sm font-semibold text-foreground">
                        {provider.price_min ? `UGX ${Number(provider.price_min).toLocaleString()}` : '—'}
                        {' — '}
                        {provider.price_max ? `UGX ${Number(provider.price_max).toLocaleString()}` : '—'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-muted">No price set</p>
                  )}
                  <p className="text-[10px] text-muted-lighter mt-3">
                    {new Date(provider.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-start justify-end">
                  {!provider.verified ? (
                    <button
                      onClick={() => approve(provider)}
                      disabled={approving === provider.id}
                      className="bg-button-bg text-button-text px-6 py-3 rounded-xl text-xs font-bold hover:bg-button-hover transition-colors disabled:opacity-50"
                    >
                      {approving === provider.id ? 'Approving...' : 'Approve & notify'}
                    </button>
                  ) : (
                    <span className="text-xs text-muted font-medium">Approved</span>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
