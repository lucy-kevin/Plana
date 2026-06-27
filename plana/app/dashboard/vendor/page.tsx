export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      {/* Refined Header */}
      <header className="mb-12">
        <h1 className="text-5xl font-serif text-[#2D2926] tracking-tight">Vendor Portal</h1>
        <p className="text-[#7D766D] mt-3 text-lg">Manage your ongoing engagements and financial flow.</p>
      </header>

      {/* Stats Grid - Premium Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pending Jobs', val: '04', color: 'text-[#2D2926]' },
          { label: 'Total Earnings', val: 'KES 1.2M', color: 'text-[#065F46]' },
          { label: 'Upcoming Payouts', val: 'KES 450k', color: 'text-[#4F46E5]' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">{stat.label}</p>
            <p className={`text-4xl font-bold ${stat.color}`}>{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Engagements Section */}
      <section className="mt-12 bg-white p-10 rounded-[2.5rem] border border-[#EBE7E0] shadow-sm">
        <h2 className="text-2xl font-serif text-[#2D2926] mb-8">Active Engagements</h2>
        <div className="space-y-4">
          {['Wedding in Nairobi', 'Corporate Gala', 'Birthday Dinner'].map((event) => (
            <div key={event} className="flex items-center justify-between p-6 bg-[#F9F7F4] rounded-3xl border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all cursor-pointer group">
              <span className="font-bold text-[#2D2926]">{event}</span>
              <span className="text-xs font-black uppercase tracking-widest text-[#4F46E5] group-hover:translate-x-1 transition-transform">
                Action Required →
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}