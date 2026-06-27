'use client';
import { usePlanStore } from '@/frontend/store/planaStore';

export default function Marketplace() {
  const { plan } = usePlanStore();

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-serif text-[#2D2926] mb-8">Choose your pros</h1>
        <div className="space-y-4">
          {/* Mapping over backend-provided vendors */}
          {['Elegant Decor', 'Classic Portraits'].map((name) => (
            <div key={name} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-[#EBE7E0] shadow-sm">
              <div>
                <h3 className="font-bold text-[#2D2926]">{name}</h3>
                <p className="text-sm text-[#7D766D]">Vetted by Plana</p>
              </div>
              <button className="px-6 py-3 bg-[#2D2926] text-white rounded-xl font-bold hover:bg-black transition">
                Get Quote
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}