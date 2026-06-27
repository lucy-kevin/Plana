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
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] font-sans">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2926] text-[#FDFBF7] px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl">
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-serif tracking-tight">Plana</Link>
          <span className="text-xs font-black uppercase tracking-widest text-[#A8A29E] border border-[#EBE7E0] px-3 py-1 rounded-full">Admin</span>
        </div>
        {pendingCount > 0 && (
          <span className="text-xs font-bold bg-[#2D2926] text-[#FDFBF7] px-3 py-1.5 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </nav>

      <div className="px-6 md:px-16 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-3">Provider management</p>
          <h1 className="text-4xl font-serif">Service Providers</h1>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-10">
          {(['pending', 'approved', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                filter === f
                  ? 'bg-[#2D2926] text-[#FDFBF7] border-[#2D2926]'
                  : 'bg-white text-[#7D766D] border-[#EBE7E0] hover:border-[#2D2926] hover:text-[#2D2926]'
              }`}
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
          <p className="text-[#A8A29E] text-sm font-medium">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-[#A8A29E] text-sm font-medium">
            {filter === 'pending' ? 'No pending registrations.' : 'No providers found.'}
          </p>
        ) : (
          <div className="divide-y divide-[#EBE7E0]">
            {filtered.map((provider) => (
              <div key={provider.id} className="py-6 grid md:grid-cols-4 gap-4 items-start">

                {/* Identity */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold text-[#2D2926]">{provider.name}</p>
                    {provider.verified ? (
                      <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#7D766D] mb-0.5">{provider.phone}</p>
                  <p className="text-xs text-[#A8A29E]">{provider.category} · {provider.location}</p>
                  {provider.description && (
                    <p className="text-xs text-[#7D766D] mt-2 leading-relaxed max-w-sm">{provider.description}</p>
                  )}
                  {provider.website && (
                    <p className="text-xs text-[#A8A29E] mt-1">{provider.website}</p>
                  )}
                </div>

                {/* Pricing */}
                <div>
                  {provider.price_min || provider.price_max ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-1">Price range</p>
                      <p className="text-sm font-semibold text-[#2D2926]">
                        {provider.price_min ? `UGX ${Number(provider.price_min).toLocaleString()}` : '—'}
                        {' — '}
                        {provider.price_max ? `UGX ${Number(provider.price_max).toLocaleString()}` : '—'}
                      </p>
                    </>
                  ) : (
                    <p className="text-xs text-[#A8A29E]">No price set</p>
                  )}
                  <p className="text-[10px] text-[#C4BAB0] mt-3">
                    {new Date(provider.created_at).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Action */}
                <div className="flex items-start justify-end">
                  {!provider.verified ? (
                    <button
                      onClick={() => approve(provider)}
                      disabled={approving === provider.id}
                      className="bg-[#2D2926] text-[#FDFBF7] px-6 py-3 rounded-xl text-xs font-bold hover:bg-[#1A1614] transition-colors disabled:opacity-50"
                    >
                      {approving === provider.id ? 'Approving...' : 'Approve & notify'}
                    </button>
                  ) : (
                    <span className="text-xs text-[#A8A29E] font-medium">Approved</span>
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
