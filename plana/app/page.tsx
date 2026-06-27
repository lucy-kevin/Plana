import Link from 'next/link';

const eventTypes = [
  'Wedding', 'Safari to Bwindi', 'Birthday Party', 'Graduation',
  'Corporate Retreat', 'Baby Shower', 'Introduction Ceremony',
  'Anniversary', 'Team Building', 'Kwanjula', 'Honeymoon',
  'Church Conference', 'Burial Arrangements', 'Product Launch',
];

const features = [
  {
    title: 'AI Cost Breakdown',
    body: 'Enter your event type, location, and budget. Plana returns a realistic breakdown with current Uganda prices, local vendor names, and tips specific to your area — not generic estimates from the internet.',
  },
  {
    title: 'Savings Tracker',
    body: 'Set a target date, log every deposit you make, and receive a precise weekly savings target. Plana recalculates automatically when your timeline or budget changes.',
  },
  {
    title: 'Works on Any Phone',
    body: 'No smartphone or mobile data required. Dial *384*200253# from any phone in Uganda. Type your question and the answer arrives by SMS within seconds.',
  },
  {
    title: 'Verified Local Providers',
    body: 'Browse caterers, venues, photographers, and transport companies who operate near you. Send a quote request directly to their phone without leaving the app.',
  },
];

const steps = [
  { label: 'Choose your event', detail: 'Wedding, safari, graduation — or type anything custom.' },
  { label: 'Set your budget', detail: 'AI generates a realistic breakdown for your city and guest count.' },
  { label: 'Save toward the goal', detail: 'Log deposits, track progress, and get weekly targets.' },
  { label: 'Book local providers', detail: 'Request SMS quotes from verified vendors directly.' },
];

const breakdown = [
  { label: 'Venue', pct: 38, amount: '7.6M' },
  { label: 'Catering', pct: 32, amount: '6.4M' },
  { label: 'Photography', pct: 10, amount: '2.0M' },
  { label: 'Decor & Flowers', pct: 8, amount: '1.6M' },
  { label: 'Transport', pct: 7, amount: '1.4M' },
  { label: 'Contingency', pct: 5, amount: '1.0M' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2D2926] font-sans">

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-track { animation: marquee 30s linear infinite; }
        .marquee-track:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none; }
        }
      `}</style>

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-5 border-b border-[#EBE7E0] bg-[#FDFBF7]/90 backdrop-blur-sm sticky top-0 z-50">
        <span className="text-2xl font-serif tracking-tight">Plana</span>
        <div className="flex items-center gap-6">
          <Link href="/providers/join" className="hidden sm:block text-sm font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
            For Providers
          </Link>
          <Link href="/login" className="text-sm font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
            Sign in
          </Link>
          <Link
            href="/login"
            className="bg-[#2D2926] text-[#FDFBF7] px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1A1614] transition-colors"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 md:px-16 pt-16 pb-0 grid md:grid-cols-2 gap-12 items-center min-h-[calc(100vh-73px)]">
        {/* Left: Headline */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-8">
            AI-Powered Planning for Uganda
          </p>
          <h1 className="text-[clamp(3rem,6.5vw,6rem)] font-serif leading-[1.05] tracking-tight mb-8">
            Plan anything.<br />Know the<br />real cost.
          </h1>
          <p className="text-lg text-[#7D766D] leading-relaxed max-w-md mb-10">
            Plana uses AI to generate realistic budgets for weddings, trips, parties, and more — with actual Uganda prices, local vendors, and savings advice built in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-[#2D2926] text-[#FDFBF7] px-8 py-4 rounded-2xl font-bold text-base hover:bg-[#1A1614] transition-colors"
            >
              Start planning free
            </Link>
            <Link
              href="/providers/join"
              className="inline-flex items-center justify-center border-2 border-[#EBE7E0] text-[#2D2926] px-8 py-4 rounded-2xl font-bold text-base hover:border-[#2D2926] transition-colors"
            >
              Join as provider
            </Link>
          </div>
          <p className="mt-5 text-xs text-[#A8A29E] font-medium">
            No credit card. Also works via USSD — dial *384*200253#
          </p>
        </div>

        {/* Right: Budget breakdown preview */}
        <div className="hidden md:block">
          <div className="bg-white border border-[#EBE7E0] rounded-[2rem] p-8 shadow-[0_20px_60px_-10px_rgba(45,41,38,0.08)]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A8A29E]">Sample breakdown</p>
              <span className="text-[10px] font-bold bg-[#F4F0E8] text-[#7D766D] px-3 py-1 rounded-full">Wedding · Kampala</span>
            </div>
            <p className="text-2xl font-serif mb-6 mt-1">UGX 20,000,000</p>

            <div className="space-y-4">
              {breakdown.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-[#2D2926]">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#A8A29E] font-medium">{item.pct}%</span>
                      <span className="text-sm font-bold text-[#2D2926] w-14 text-right">{item.amount}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#F4F0E8] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2D2926] rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#EBE7E0] flex items-center justify-between">
              <p className="text-xs text-[#A8A29E] font-medium">Generated by Plana AI in 3 seconds</p>
              <Link
                href="/login"
                className="text-xs font-bold text-[#2D2926] hover:underline underline-offset-4"
              >
                Create yours
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee — signature element */}
      <div className="mt-16 border-y border-[#EBE7E0] overflow-hidden py-4 bg-[#F4F0E8]">
        <div className="marquee-track flex gap-0 whitespace-nowrap">
          {[...eventTypes, ...eventTypes].map((type, i) => (
            <span key={i} className="text-sm font-bold text-[#7D766D] px-8 shrink-0">
              {type}
              <span className="ml-8 text-[#C4BAB0]">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features — editorial list */}
      <section className="px-6 md:px-16 py-24">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-10">What Plana does</p>
        <div className="divide-y divide-[#EBE7E0]">
          {features.map((f) => (
            <div key={f.title} className="py-8 grid md:grid-cols-3 gap-4 md:gap-16 items-start group">
              <h3 className="text-xl font-serif text-[#2D2926] md:col-span-1">{f.title}</h3>
              <p className="text-[#7D766D] leading-relaxed text-base md:col-span-2">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works — dark */}
      <section className="bg-[#2D2926] px-6 md:px-16 py-24">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30 mb-16">How it works</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-12">
          {steps.map((s, i) => (
            <div key={s.label}>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-4">Step {i + 1}</p>
              <h3 className="text-xl font-serif text-white mb-3">{s.label}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* USSD callout */}
      <section className="px-6 md:px-16 py-24 border-b border-[#EBE7E0]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-6">Works without internet</p>
            <h2 className="text-4xl md:text-5xl font-serif leading-tight mb-6">
              Any phone.<br />Any network.<br />Any question.
            </h2>
            <p className="text-[#7D766D] leading-relaxed max-w-md">
              Plana is accessible via USSD on every phone in Uganda — no data, no app download, no account required. Ask a planning question and receive the AI answer by SMS within seconds.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-center gap-8">
            <div className="w-full max-w-sm bg-[#2D2926] text-[#FDFBF7] rounded-[2rem] p-8">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">Dial from any phone</p>
              <p className="text-4xl font-serif font-bold tracking-tight">*384*200253#</p>
              <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-sm text-white/60">
                <p>1. Get cost estimate</p>
                <p>2. Ask Plana AI</p>
                <p>3. Find providers</p>
                <p>4. About Plana</p>
              </div>
            </div>
            <p className="text-xs text-[#A8A29E] font-medium max-w-sm">
              AI answers are delivered by SMS so session timeouts never cut off your response.
            </p>
          </div>
        </div>
      </section>

      {/* Provider CTA strip */}
      <section className="px-6 md:px-16 py-16 border-b border-[#EBE7E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-2">Service Providers</p>
          <h3 className="text-2xl font-serif">Reach clients who are actively budgeting.</h3>
        </div>
        <Link
          href="/providers/join"
          className="shrink-0 border-2 border-[#2D2926] text-[#2D2926] px-8 py-4 rounded-2xl font-bold text-sm hover:bg-[#2D2926] hover:text-[#FDFBF7] transition-all"
        >
          Join as a provider — it is free
        </Link>
      </section>

      {/* Final CTA */}
      <section className="px-6 md:px-16 py-32 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-8">Get started today</p>
        <h2 className="text-5xl md:text-6xl font-serif leading-tight mb-10 max-w-2xl mx-auto">
          Your next event, planned properly.
        </h2>
        <Link
          href="/login"
          className="inline-flex items-center justify-center bg-[#2D2926] text-[#FDFBF7] px-10 py-5 rounded-2xl font-bold text-lg hover:bg-[#1A1614] transition-colors"
        >
          Start planning free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EBE7E0] px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xl font-serif">Plana</span>
        <p className="text-xs text-[#A8A29E]">Built for Uganda. 2026.</p>
        <div className="flex items-center gap-6">
          <Link href="/providers/join" className="text-xs font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
            For providers
          </Link>
          <Link href="/login" className="text-xs font-semibold text-[#7D766D] hover:text-[#2D2926] transition-colors">
            Sign in
          </Link>
        </div>
      </footer>

    </div>
  );
}
