// app/vendor/dashboard/page.tsx
export default function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[#F0F4F8] p-6 md:p-10">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900">Vendor Portal</h1>
        <p className="text-gray-500 mt-2">Manage your current engagements and upcoming payments.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-bold uppercase">Pending Jobs</p>
          <p className="text-4xl font-extrabold mt-2 text-gray-900">04</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-bold uppercase">Total Earnings</p>
          <p className="text-4xl font-extrabold mt-2 text-emerald-600">KES 1.2M</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-400 font-bold uppercase">Upcoming Payouts</p>
          <p className="text-4xl font-extrabold mt-2 text-indigo-600">KES 450k</p>
        </div>
      </div>

      <section className="mt-8 bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Current Engagements</h2>
        <div className="space-y-4">
          {['Wedding in Nairobi', 'Corporate Gala', 'Birthday Dinner'].map((event) => (
            <div key={event} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-indigo-50/50 transition-colors">
              <span className="font-semibold text-gray-800">{event}</span>
              <span className="text-sm font-bold text-indigo-600">Action Required →</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}