'use client';
import { useState } from 'react';
import Link from 'next/link';

const categories = [
  'Catering', 'Venue', 'Photography', 'Videography', 'Decor & Flowers',
  'Transport', 'Music & Entertainment', 'Cake & Pastries', 'MC & Host',
  'Hair & Makeup', 'Tent & Furniture Hire', 'Security', 'Other',
];

const benefits = [
  {
    label: 'Quote requests by SMS',
    detail: 'Clients browsing Plana can send a quote request straight to your phone number — no app required on either side.',
  },
  {
    label: 'Clients with real budgets',
    detail: 'Every person who finds you has already run an AI budget breakdown. They know what things cost and are ready to book.',
  },
  {
    label: 'Free to join',
    detail: 'Registration is free. Our team reviews your details and sends an SMS when your profile goes live.',
  },
];

export default function JoinAsProviderPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    location: '',
    priceMin: '',
    priceMax: '',
    description: '',
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCategories.length === 0) {
      setError('Select at least one category before submitting.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setError('');

    try {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: form.phone,
          name: form.name,
          category: selectedCategories.join(', '),
          location: form.location,
          priceMin: form.priceMin ? Number(form.priceMin) : undefined,
          priceMax: form.priceMax ? Number(form.priceMax) : undefined,
          currency: 'UGX',
          description: form.description,
          website: form.website,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Something went wrong');
      setStatus('success');
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-6">Registration received</p>
          <h2 className="text-4xl font-serif text-[#2D2926] mb-4">You are on the list.</h2>
          <p className="text-[#7D766D] leading-relaxed mb-10 max-w-sm mx-auto">
            Our team will review your details within 24 hours. You will receive an SMS at the number you provided once your profile is live on Plana.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold hover:bg-[#1A1614] transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] font-sans">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-50">
        <Link href="/" className="text-2xl font-serif tracking-tight">Plana</Link>
        <Link href="/login" className="text-sm font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
          Sign in
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-20">

        {/* Header */}
        <div className="mb-20 max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-6">For service providers</p>
          <h1 className="text-5xl md:text-6xl font-serif leading-[1.05] tracking-tight mb-6">
            Reach clients who already know their budget.
          </h1>
          <p className="text-lg text-[#7D766D] leading-relaxed">
            Plana shows verified providers to clients who are actively planning an event and have run a real budget breakdown. Registration takes two minutes and is free.
          </p>
        </div>

        {/* Benefits — editorial list */}
        <div className="divide-y divide-[#EBE7E0] mb-20">
          {benefits.map((b) => (
            <div key={b.label} className="py-7 grid md:grid-cols-3 gap-3 md:gap-16 items-start">
              <h3 className="text-base font-bold text-[#2D2926]">{b.label}</h3>
              <p className="text-[#7D766D] leading-relaxed text-sm md:col-span-2">{b.detail}</p>
            </div>
          ))}
        </div>

        {/* Form layout */}
        <div className="grid md:grid-cols-5 gap-16">

          {/* Left label */}
          <div className="md:col-span-2 pt-1">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">Your details</p>
            <p className="text-sm text-[#7D766D] leading-relaxed">
              Fields marked with an asterisk are required. We use your phone number to send SMS quote requests from clients.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-3 space-y-5">

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Business name *</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="e.g. Grace Catering Services"
                className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Phone number *</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="+256 700 000 000"
                className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-3">
                Categories *{' '}
                <span className="normal-case font-semibold text-[#C4BAB0]">select all that apply</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
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
                <p className="mt-3 text-xs text-[#A8A29E] font-medium">
                  Selected: {selectedCategories.join(' · ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Location *</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                placeholder="e.g. Kampala, Wakiso, Entebbe"
                className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Min price (UGX)</label>
                <input
                  name="priceMin"
                  value={form.priceMin}
                  onChange={handleChange}
                  type="number"
                  placeholder="500,000"
                  className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Max price (UGX)</label>
                <input
                  name="priceMax"
                  value={form.priceMax}
                  onChange={handleChange}
                  type="number"
                  placeholder="2,000,000"
                  className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">About your business</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe what you offer and what sets you apart from other providers in your area."
                className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E] mb-2">Website or social media</label>
              <input
                name="website"
                value={form.website}
                onChange={handleChange}
                placeholder="instagram.com/yourpage or yoursite.com"
                className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] transition-all text-[#2D2926] font-medium text-sm"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl">
                {error}
              </p>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#2D2926] text-[#FDFBF7] py-5 rounded-2xl font-bold text-base hover:bg-[#1A1614] transition-colors disabled:opacity-50"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit registration'}
              </button>
              <p className="mt-4 text-xs text-center text-[#A8A29E] leading-relaxed">
                Registration is free. Our team reviews your details and sends an SMS once you are approved.
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#EBE7E0] px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4 mt-20">
        <Link href="/" className="text-xl font-serif">Plana</Link>
        <p className="text-xs text-[#A8A29E]">Built for Uganda. 2026.</p>
        <Link href="/login" className="text-xs font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
          Sign in
        </Link>
      </footer>

    </div>
  );
}
