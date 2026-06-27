'use client';
import { usePlanStore } from '@/frontend/store/planaStore';
import { useRouter } from 'next/navigation';

export default function AIPlanningBreakdown() {
  const { plan, updateItemAmount, getTotalAllocated } = usePlanStore();
  const router = useRouter();

  if (!plan) return <p className="text-center py-20">No plan data found. Please restart your setup.</p>;

  const totalAllocated = getTotalAllocated();
  const isOver = totalAllocated > plan.totalBudget;

  return (
    <main className="min-h-screen py-10 px-6">
      <div className="max-w-2xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-serif text-[#2D2926]">Your AI Budget</h1>
          <p className="text-[#7D766D] mt-2 text-lg">Adjust your allocations for {plan.type}.</p>
        </header>

        {/* Premium Guard Rail */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-[#EBE7E0] mb-10">
          <div className="flex justify-between items-end mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#A8A29E]">
              {isOver ? 'Over Budget' : 'Budget Usage'}
            </span>
            <span className={`text-2xl font-bold ${isOver ? 'text-[#B45309]' : 'text-[#2D2926]'}`}>
              {((totalAllocated / plan.totalBudget) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-[#F9F7F4] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-700 ${isOver ? 'bg-[#B45309]' : 'bg-[#2D2926]'}`} 
              style={{ width: `${Math.min((totalAllocated / plan.totalBudget) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Category List */}
        <div className="space-y-4">
          {plan.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all">
              <span className="font-bold text-[#2D2926]">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[#A8A29E] font-medium text-sm">UGX</span>
                <input 
                  type="number" 
                  value={item.estimatedCost} 
                  className="w-28 text-right font-bold text-[#2D2926] bg-[#F9F7F4] p-3 rounded-xl border border-transparent focus:border-[#2D2926]/20 outline-none"
                  onChange={(e) => updateItemAmount(item.id, Number(e.target.value))}
                />
              </div>
            </div>
          ))}
        </div>

        <button 
          onClick={() => router.push('/marketplace')}
          className="w-full mt-10 bg-[#2D2926] text-white py-6 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98]"
        >
          Confirm Allocation
        </button>
      </div>
    </main>
  );
}