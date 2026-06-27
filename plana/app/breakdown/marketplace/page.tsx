'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePlanStore } from '@/frontend/store/planaStore';

const UNSPLASH_KEY = process.env.NEXT_PUBLIC_UNSPLASH_KEY;

async function fetchCategoryPhoto(category: string, location: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${category} event ${location || 'uganda'}`);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape&client_id=${UNSPLASH_KEY}`
    );
    const data = await res.json();
    return data.results?.[0]?.urls?.regular ?? null;
  } catch {
    return null;
  }
}

interface Provider {
  id: string;
  name: string;
  phone: string;
  category: string;
  location: string;
  price_min: number | null;
  price_max: number | null;
  currency: string;
  description: string | null;
  verified: boolean;
}

function fmt(n: number) { return n.toLocaleString(); }

export default function Marketplace() {
  const { plan } = usePlanStore();

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryPhotos, setCategoryPhotos] = useState<Record<string, string>>({});
  const [categoryFilter, setCategoryFilter] = useState('');
  const [requesting, setRequesting] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, string>>({});
  const [clientPhone, setClientPhone] = useState('');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<Provider | null>(null);

  const location = plan?.destination ?? '';
  const budget = plan?.totalBudget ?? null;
  const planType = plan?.type ?? 'Event';

  useEffect(() => {
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    fetch(`/api/providers?${params.toString()}`)
      .then(r => r.json())
      .then(async d => {
        const list: Provider[] = d.providers ?? [];
        setProviders(list);
        setLoading(false);

        const uniqueCategories = Array.from(
          new Set(list.map(p => p.category.split(',')[0].trim()))
        );
        const entries = await Promise.all(
          uniqueCategories.map(async cat => {
            const url = await fetchCategoryPhoto(cat, location);
            return [cat, url] as [string, string | null];
          })
        );
        const photos: Record<string, string> = {};
        for (const [cat, url] of entries) {
          if (url) photos[cat] = url;
        }
        setCategoryPhotos(photos);
      });
  }, [location]);

  const availableCategories = Array.from(new Set(
    providers.flatMap(p => p.category.split(',').map(c => c.trim()))
  )).sort();

  const filtered = categoryFilter
    ? providers.filter(p => p.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    : providers;

  function openQuoteModal(provider: Provider) {
    setPendingProvider(provider);
    setShowPhoneModal(true);
  }

  async function sendQuote() {
    if (!pendingProvider) return;
    setRequesting(pendingProvider.id);
    setShowPhoneModal(false);

    const res = await fetch('/api/request-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        providerId: pendingProvider.id,
        providerPhone: pendingProvider.phone,
        providerName: pendingProvider.name,
        clientPhone: clientPhone || null,
        planType,
        location,
        budget,
        currency: pendingProvider.currency ?? 'UGX',
        category: pendingProvider.category,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setSent(prev => ({ ...prev, [pendingProvider.id]: data.ref }));
    }
    setRequesting(null);
    setPendingProvider(null);
    setClientPhone('');
  }

  return (
    <main className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-serif text-foreground mb-2">Choose your pros</h1>
          <p className="text-body text-lg">
            Verified providers{location ? ` in ${location}` : ''} — vetted by Plana.
          </p>
        </header>

        {/* Category filter */}
        {availableCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setCategoryFilter('')}
              className={`btn-filter ${!categoryFilter ? 'btn-filter-active' : ''}`}
            >
              All
            </button>
            {availableCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`btn-filter ${categoryFilter === cat ? 'btn-filter-active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Provider list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface rounded-3xl border border-border skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl font-serif text-foreground mb-3">No providers found.</p>
            <p className="text-sm text-body">
              {location
                ? `We do not have verified providers in ${location} yet. Try removing the location filter.`
                : 'No verified providers yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(provider => {
              const isRequesting = requesting === provider.id;
              const wasSent = sent[provider.id];
              const primaryCategory = provider.category.split(',')[0].trim();
              const photo = categoryPhotos[primaryCategory];

              return (
                <div
                  key={provider.id}
                  className="card-hover overflow-hidden"
                >
                  {/* Photo banner */}
                  {photo ? (
                    <div className="relative h-40 w-full">
                      <Image
                        src={photo}
                        alt={primaryCategory}
                        fill
                        className="object-cover"
                        sizes="(max-width: 672px) 100vw, 672px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-4 badge-micropill text-white/80">
                        {primaryCategory}
                      </span>
                    </div>
                  ) : (
                    <div className="h-10 w-full bg-accent-bg" />
                  )}

                  {/* Card body */}
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-foreground">{provider.name}</h3>
                        <span className="badge-status text-green-700 bg-green-50 border-green-200">
                          Vetted
                        </span>
                      </div>
                      <p className="text-sm text-body truncate">
                        {provider.category} · {provider.location}
                      </p>
                      {(provider.price_min || provider.price_max) && (
                        <p className="text-xs text-muted mt-1">
                          UGX {provider.price_min ? fmt(provider.price_min) : '—'} – {provider.price_max ? fmt(provider.price_max) : '—'}
                        </p>
                      )}
                      {provider.description && (
                        <p className="text-xs text-muted mt-1 line-clamp-1">{provider.description}</p>
                      )}
                      {wasSent && (
                        <p className="text-xs text-green-700 font-semibold mt-2">
                          Quote sent · Ref: {wasSent}
                        </p>
                      )}
                    </div>

                    <div className="ml-4 shrink-0">
                      {wasSent ? (
                        <span className="text-xs font-bold text-muted">Sent</span>
                      ) : (
                        <button
                          onClick={() => openQuoteModal(provider)}
                          disabled={isRequesting}
                          className="px-6 py-3 bg-button-bg text-button-text rounded-xl font-bold text-sm hover:bg-button-hover transition-colors disabled:opacity-50"
                        >
                          {isRequesting ? 'Sending...' : 'Get Quote'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Phone modal */}
      {showPhoneModal && pendingProvider && (
        <div className="modal-overlay">
          <div className="bg-surface rounded-[2rem] border border-border p-8 max-w-sm w-full shadow-2xl">
            <p className="badge-micropill mb-3">Quote request</p>
            <h3 className="text-2xl font-serif text-foreground mb-1">{pendingProvider.name}</h3>
            <p className="text-sm text-body mb-6">
              We will SMS this provider with your event details. Add your phone number so they can reach you back.
            </p>
            <input
              value={clientPhone}
              onChange={e => setClientPhone(e.target.value)}
              placeholder="+256 700 000 000 (optional)"
              className="input-base mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={sendQuote}
                className="flex-1 bg-button-bg text-button-text py-4 rounded-2xl font-bold text-sm hover:bg-button-hover transition-colors"
              >
                Send quote request
              </button>
              <button
                onClick={() => { setShowPhoneModal(false); setPendingProvider(null); setClientPhone(''); }}
                className="px-5 py-4 border-2 border-border text-body rounded-2xl font-bold text-sm hover:border-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
