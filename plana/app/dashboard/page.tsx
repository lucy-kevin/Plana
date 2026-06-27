// app/dashboard/page.tsx
export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-10">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Plans</h1>
          <p className="text-gray-500 mt-2">Manage your events and track your budget progress.</p>
        </div>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]">
          + New Plan
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <section className="md:col-span-8 space-y-4">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Active Events</h2>
            {/* Example of "At Risk" state for variety */}
            <div className="group bg-white p-6 rounded-2xl border border-gray-100 hover:border-indigo-100 transition-all cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Wedding in Nairobi</h3>
                  <p className="text-sm text-gray-500">KES 350,000 / 500,000 spent</p>
                </div>
                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Warning</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-3 bg-amber-500 rounded-full w-[70%]"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="md:col-span-4">
          <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/50 h-full">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Notifications</h2>
            <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-100">
              <p className="text-sm text-amber-900">
                <span className="font-bold block mb-1">New Quote Received</span>
                "Elegant Decor" has sent a quote for your Wedding plan.
              </p>
              <button className="mt-3 text-xs font-bold text-indigo-600 hover:underline">View Quote →</button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}