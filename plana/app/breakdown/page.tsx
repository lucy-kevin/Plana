'use client';
import { useState } from 'react';

export default function AIPlanningBreakdown() {
  const [budget] = useState(500000);
  const [categories, setCategories] = useState([
    { name: 'Venue', amount: 125000 },
    { name: 'Catering', amount: 125000 },
    { name: 'Decor', amount: 100000 },
  ]);

  const totalAllocated = categories.reduce((acc, cat) => acc + cat.amount, 0);
  const isOver = totalAllocated > budget;

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-16 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif text-[#2D2926]">Your AI Budget</h1>
          <p className="text-[#7D766D] mt-2 text-lg">Adjust your allocations as needed.</p>
        </header>

        {/* Premium Guard Rail */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EBE7E0] mb-10">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E]">Budget Usage</span>
            <span className={`text-2xl font-bold ${isOver ? 'text-[#B45309]' : 'text-[#2D2926]'}`}>
              {((totalAllocated / budget) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-[#F9F7F4] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${isOver ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`} 
              style={{ width: `${Math.min((totalAllocated / budget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all">
              <span className="font-bold text-[#2D2926]">{cat.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#A8A29E] font-medium text-sm">UGX</span>
                <input 
                  type="number" 
                  value={cat.amount} 
                  className="w-28 text-right font-bold text-[#2D2926] bg-[#F9F7F4] p-3 rounded-xl border border-transparent focus:border-[#2D2926]/20 outline-none"
                  onChange={(e) => {
                    const newCats = [...categories];
                    newCats[idx].amount = Number(e.target.value);
                    setCategories(newCats);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-10 bg-[#2D2926] text-white py-6 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98]">
          Confirm Allocation
        </button>
      </div>
    </main>
  );
}