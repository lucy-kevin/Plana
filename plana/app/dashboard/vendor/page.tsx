export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <header className="mb-12">
        <h1 className="text-5xl font-serif text-foreground tracking-tight">Vendor Portal</h1>
        <p className="text-body mt-3 text-lg">Manage your ongoing engagements and financial flow.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Jobs', val: '04', color: 'text-foreground' },
          { label: 'Total Earnings', val: 'KES 1.2M', color: 'text-[#065F46]' },
          { label: 'Upcoming Payouts', val: 'KES 450k', color: 'text-primary' },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <p className="badge-micropill mb-2">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <section className="mt-12 bg-surface p-10 rounded-[2.5rem] border border-border shadow-sm">
        <h2 className="text-2xl font-serif text-foreground mb-8">Active Engagements</h2>
        <div className="space-y-4">
          {['Wedding in Nairobi', 'Corporate Gala', 'Birthday Dinner'].map((event) => (
            <div key={event} className="flex items-center justify-between p-6 bg-input-bg rounded-3xl border border-border hover:border-foreground/20 transition-all cursor-pointer group">
              <span className="font-bold text-foreground">{event}</span>
              <span className="text-xs font-black uppercase tracking-widest text-primary group-hover:translate-x-1 transition-transform">
                Action Required →
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
