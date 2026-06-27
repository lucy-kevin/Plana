'use client';
import { useState } from 'react';
import Link from 'next/link';

const categories = [
  'Catering', 'Venue', 'Photography', 'Videography', 'Decor & Flowers',
  'Transport', 'Music & Entertainment', 'Cake & Pastries', 'MC & Host',
  'Hair & Makeup', 'Tent & Furniture Hire', 'Security', 'Other',
];

type DashTab = 'quotes' | 'profile';

interface Provider {
  id: string; name: string; phone: string; category: string; location: string;
  price_min: number | null; price_max: number | null; description: string | null;
  website: string | null; verified: boolean; created_at: string;
}

interface Quote {
  id: string; ref: string; client_phone: string | null; plan_type: string;
  location: string; budget: number | null; currency: string; category: string;
  status: 'pending' | 'responded' | 'closed'; created_at: string;
}

function fmt(n: number) { return n.toLocaleString(); }
function date(s: string) {
  return new Date(s).toLocaleDateString('en-UG', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusStyles: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  responded: 'text-blue-700 bg-blue-50 border-blue-200',
  closed: 'text-[#A8A29E] bg-[#F4F0E8] border-[#EBE7E0]',
};

export default function ProviderDashboardPage() {
  // Auth state
  const [authStep, setAuthStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Session state
  const [provider, setProvider] = useState<Provider | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoaded, setQuotesLoaded] = useState(false);

  // UI state
  const [tab, setTab] = useState<DashTab>('quotes');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Provider>>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [updatingQuote, setUpdatingQuote] = useState<string | null>(null);

  // Step 1 — send OTP
  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();

    if (!res.ok) {
      setAuthError(data.error ?? 'Could not send code. Check your number.');
      setAuthLoading(false);
      return;
    }
    setAuthStep('otp');
    setAuthLoading(false);
  }

  // Step 2 — verify OTP then look up provider profile
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const verifyRes = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      setAuthError(verifyData.error ?? 'Incorrect code. Try again.');
      setAuthLoading(false);
      return;
    }

    // Check if this phone is a registered provider
    const providerRes = await fetch(`/api/providers/me?phone=${encodeURIComponent(phone)}`);
    const providerData = await providerRes.json();

    if (!providerRes.ok) {
      setAuthError('No provider account found for this number. Register first.');
      setAuthLoading(false);
      return;
    }

    const p: Provider = providerData.provider;
    setProvider(p);
    setForm(p);
    setSelectedCategories(p.category ? p.category.split(',').map((c: string) => c.trim()) : []);

    // Load quotes
    const quotesRes = await fetch(`/api/providers/${p.id}/quotes`);
    const quotesData = await quotesRes.json();
    setQuotes(quotesData.quotes ?? []);
    setQuotesLoaded(true);
    setAuthLoading(false);
  }

  function toggleCategory(cat: string) {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  }

  async function save() {
    if (!provider) return;
    setSaveStatus('loading');
    setSaveError('');

    const res = await fetch(`/api/providers/${provider.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        category: selectedCategories.join(', '),
        location: form.location,
        price_min: form.price_min ? Number(form.price_min) : null,
        price_max: form.price_max ? Number(form.price_max) : null,
        description: form.description,
        website: form.website,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setSaveError(data.error ?? 'Could not save.'); setSaveStatus('error'); return; }

    setProvider(data.provider);
    setForm(data.provider);
    setSelectedCategories(data.provider.category ? data.provider.category.split(',').map((c: string) => c.trim()) : []);
    setSaveStatus('saved');
    setEditing(false);
    setTimeout(() => setSaveStatus('idle'), 3000);
  }

  async function updateQuoteStatus(quoteId: string, status: string) {
    if (!provider) return;
    setUpdatingQuote(quoteId);
    const res = await fetch(`/api/providers/${provider.id}/quotes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteId, status }),
    });
    const data = await res.json();
    if (res.ok) {
      setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: data.quote.status } : q));
    }
    setUpdatingQuote(null);
  }

  // ── Auth screens ──────────────────────────────────────────────────

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Link href="/" className="text-2xl font-serif tracking-tight text-[#2D2926] block mb-16">Plana</Link>

          {authStep === 'phone' ? (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">Provider login</p>
              <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Access your dashboard.</h1>
              <p className="text-[#7D766D] mb-10 text-sm leading-relaxed">
                Enter the phone number you registered with. We will send a one-time code to verify it is you.
              </p>
              <form onSubmit={sendOtp} className="space-y-4">
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  placeholder="+256 700 000 000"
                  className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-medium text-sm"
                />
                {authError && (
                  <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#2D2926] text-[#FDFBF7] py-4 rounded-2xl font-bold text-sm hover:bg-[#1A1614] transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Sending code...' : 'Send verification code'}
                </button>
              </form>
              <p className="mt-6 text-xs text-center text-[#A8A29E]">
                Not registered?{' '}
                <Link href="/providers/join" className="font-bold text-[#7D766D] hover:text-[#2D2926] transition-colors">
                  Join as a provider
                </Link>
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">Verify your number</p>
              <h1 className="text-4xl font-serif text-[#2D2926] mb-3">Check your messages.</h1>
              <p className="text-[#7D766D] mb-10 text-sm leading-relaxed">
                We sent a 6-digit code to {phone}.
              </p>
              <form onSubmit={verifyOtp} className="space-y-4">
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-bold text-center text-2xl tracking-[0.3em]"
                />
                {authError && (
                  <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl">{authError}</p>
                )}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-[#2D2926] text-[#FDFBF7] py-4 rounded-2xl font-bold text-sm hover:bg-[#1A1614] transition-colors disabled:opacity-50"
                >
                  {authLoading ? 'Verifying...' : 'Verify and open dashboard'}
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthStep('phone'); setAuthError(''); setOtp(''); }}
                  className="w-full text-xs font-bold text-[#A8A29E] hover:text-[#2D2926] transition-colors py-2"
                >
                  Back to phone number
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────

  const pendingQuotes = quotes.filter(q => q.status === 'pending');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] font-sans">

      {saveStatus === 'saved' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2926] text-[#FDFBF7] px-6 py-3 rounded-2xl text-sm font-semibold shadow-xl">
          Profile updated.
        </div>
      )}

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-40">
        <Link href="/" className="text-2xl font-serif tracking-tight">Plana</Link>
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold text-[#7D766D]">{provider.name}</span>
          <button
            onClick={() => { setProvider(null); setPhone(''); setOtp(''); setAuthStep('phone'); setQuotes([]); setQuotesLoaded(false); }}
            className="text-xs font-bold text-[#A8A29E] hover:text-[#2D2926] transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* Status banner */}
        {!provider.verified && (
          <div className="mb-10 bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <p className="text-sm font-bold text-amber-800 mb-1">Your profile is under review</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              Our team is reviewing your registration. You will receive an SMS at {provider.phone} once you are approved and live on Plana. Quote requests will start coming in after approval.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-5xl font-serif tracking-tight">{provider.name}</h1>
            {provider.verified && (
              <span className="text-[10px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                Live
              </span>
            )}
          </div>
          <p className="text-[#7D766D] mt-2 text-lg">Manage your engagements and profile.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Pending requests</p>
            <p className="text-4xl font-bold text-[#2D2926]">{String(pendingQuotes.length).padStart(2, '0')}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Responded</p>
            <p className="text-4xl font-bold text-[#065F46]">{String(quotes.filter(q => q.status === 'responded').length).padStart(2, '0')}</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Total received</p>
            <p className="text-4xl font-bold text-[#4F46E5]">{String(quotes.length).padStart(2, '0')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-10">
          {([
            { key: 'quotes', label: 'Quote requests', badge: pendingQuotes.length },
            { key: 'profile', label: 'My profile' },
          ] as { key: DashTab; label: string; badge?: number }[]).map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setEditing(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                tab === t.key
                  ? 'bg-[#2D2926] text-[#FDFBF7] border-[#2D2926]'
                  : 'bg-white text-[#7D766D] border-[#EBE7E0] hover:border-[#2D2926] hover:text-[#2D2926]'
              }`}
            >
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`px-1.5 rounded-full text-[10px] font-black ${tab === t.key ? 'bg-white/20' : 'bg-[#EBE7E0]'}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quote requests tab */}
        {tab === 'quotes' && (
          <div>
            {!quotesLoaded ? (
              <p className="text-sm text-[#A8A29E] font-medium">Loading...</p>
            ) : quotes.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl font-serif text-[#2D2926] mb-3">No quote requests yet.</p>
                <p className="text-sm text-[#7D766D]">
                  {provider.verified
                    ? 'When clients request a quote from you, they will appear here and arrive by SMS.'
                    : 'Quote requests will appear here once your profile is approved and live.'}
                </p>
              </div>
            ) : (
              <>
                <section className="bg-white p-10 rounded-[2.5rem] border border-[#EBE7E0] shadow-sm">
                  <h2 className="text-2xl font-serif text-[#2D2926] mb-8">Active Engagements</h2>
                  <div className="space-y-4">
                    {quotes.map(q => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between p-6 bg-[#F9F7F4] rounded-3xl border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-[#2D2926] capitalize">{q.plan_type} in {q.location}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusStyles[q.status]}`}>
                              {q.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#7D766D]">
                            {q.category}
                            {q.budget ? ` · UGX ${fmt(q.budget)}` : ''}
                            {q.client_phone ? ` · ${q.client_phone}` : ''}
                          </p>
                          <p className="text-[10px] text-[#C4BAB0] mt-1">Ref: {q.ref} · {date(q.created_at)}</p>
                        </div>
                        <div className="flex flex-col gap-2 items-end shrink-0 ml-4">
                          {q.status === 'pending' && (
                            <button
                              onClick={() => updateQuoteStatus(q.id, 'responded')}
                              disabled={updatingQuote === q.id}
                              className="text-xs font-black uppercase tracking-widest text-[#4F46E5] hover:translate-x-1 transition-transform disabled:opacity-50"
                            >
                              {updatingQuote === q.id ? 'Updating...' : 'Mark responded →'}
                            </button>
                          )}
                          {q.status === 'responded' && (
                            <button
                              onClick={() => updateQuoteStatus(q.id, 'closed')}
                              disabled={updatingQuote === q.id}
                              className="text-xs font-black uppercase tracking-widest text-[#A8A29E] hover:text-[#2D2926] transition-colors disabled:opacity-50"
                            >
                              {updatingQuote === q.id ? 'Updating...' : 'Close →'}
                            </button>
                          )}
                          {q.status === 'closed' && (
                            <span className="text-xs font-semibold text-[#C4BAB0]">Closed</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div>
            {!editing ? (
              <>
                <div className="flex justify-end mb-6">
                  <button
                    onClick={() => setEditing(true)}
                    className="border-2 border-[#EBE7E0] text-[#2D2926] px-5 py-2.5 rounded-xl text-xs font-bold hover:border-[#2D2926] transition-colors"
                  >
                    Edit profile
                  </button>
                </div>
                <div className="divide-y divide-[#EBE7E0]">
                  {[
                    { label: 'Business name', value: provider.name },
                    { label: 'Phone', value: provider.phone },
                    { label: 'Categories', value: provider.category },
                    { label: 'Location', value: provider.location },
                    {
                      label: 'Price range',
                      value: provider.price_min || provider.price_max
                        ? `UGX ${provider.price_min ? fmt(provider.price_min) : '—'} – UGX ${provider.price_max ? fmt(provider.price_max) : '—'}`
                        : null,
                    },
                    { label: 'About', value: provider.description },
                    { label: 'Website / Social', value: provider.website },
                  ].map(row => row.value ? (
                    <div key={row.label} className="py-5 grid grid-cols-3 gap-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] pt-0.5">{row.label}</p>
                      <p className="text-sm text-[#2D2926] col-span-2 leading-relaxed">{row.value}</p>
                    </div>
                  ) : null)}
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Business name</label>
                  <input
                    value={form.name ?? ''}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-3">
                    Categories <span className="normal-case font-semibold text-[#C4BAB0]">select all that apply</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const selected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all duration-150 ${
                            selected
                              ? 'bg-[#2D2926] text-[#FDFBF7] border-[#2D2926]'
                              : 'bg-white text-[#7D766D] border-[#EBE7E0] hover:border-[#2D2926] hover:text-[#2D2926]'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  {selectedCategories.length > 0 && (
                    <p className="mt-3 text-xs text-[#A8A29E]">Selected: {selectedCategories.join(' · ')}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Location</label>
                  <input
                    value={form.location ?? ''}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Min price (UGX)</label>
                    <input
                      type="number"
                      value={form.price_min ?? ''}
                      onChange={e => setForm({ ...form, price_min: e.target.value ? Number(e.target.value) : null })}
                      className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Max price (UGX)</label>
                    <input
                      type="number"
                      value={form.price_max ?? ''}
                      onChange={e => setForm({ ...form, price_max: e.target.value ? Number(e.target.value) : null })}
                      className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">About your business</label>
                  <textarea
                    rows={3}
                    value={form.description ?? ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Website or social media</label>
                  <input
                    value={form.website ?? ''}
                    onChange={e => setForm({ ...form, website: e.target.value })}
                    className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                  />
                </div>
                {saveStatus === 'error' && (
                  <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl">{saveError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={save}
                    disabled={saveStatus === 'loading'}
                    className="flex-1 bg-[#2D2926] text-[#FDFBF7] py-4 rounded-2xl font-bold text-sm hover:bg-[#1A1614] transition-colors disabled:opacity-50"
                  >
                    {saveStatus === 'loading' ? 'Saving...' : 'Save changes'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setForm(provider); setSelectedCategories(provider.category ? provider.category.split(',').map(c => c.trim()) : []); }}
                    className="px-6 py-4 border-2 border-[#EBE7E0] text-[#7D766D] rounded-2xl font-bold text-sm hover:border-[#2D2926] hover:text-[#2D2926] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
