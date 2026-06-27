export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12">
      <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-serif text-[#2D2926] tracking-tight">My Plans</h1>
          <p className="text-[#7D766D] mt-3 text-lg">Curated events for your life goals.</p>
        </div>
        <button className="bg-[#2D2926] text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]">
          + New Plan
        </button>
      </header>

      <section className="grid md:grid-cols-12 gap-8">
        <div className="md:col-span-8 space-y-6">
          <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1">Active Now</h2>
          <div className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm hover:shadow-md transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-serif text-[#2D2926]">Wedding in Nairobi</h3>
                <p className="text-[#7D766D] mt-1 font-medium">350,000 / 500,000 Spent</p>
              </div>
              <span className="bg-[#FFF8F0] text-[#B45309] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#FDE68A]">Warning</span>
            </div>
            <div className="w-full h-3 bg-[#F9F7F4] rounded-full overflow-hidden">
              <div className="h-full bg-[#B45309] w-[70%] rounded-full transition-all duration-1000"></div>
            </div>
          </div>
        </div>

        <aside className="md:col-span-4">
          <h2 className="text-sm font-black text-[#A8A29E] uppercase tracking-widest pl-1 mb-6">Updates</h2>
          <div className="bg-white p-6 rounded-[2rem] border border-[#EBE7E0]">
            <p className="text-[#2D2926] text-sm leading-relaxed mb-4">
              <span className="font-black block mb-1">New Quote: Elegant Decor</span>
              A quote for your Wedding plan has been received.
            </p>
            <button className="text-sm font-bold text-[#4F46E5] hover:underline underline-offset-4">View Quote →</button>
          </div>
        </aside>
      </section>
    </div>
  );
}