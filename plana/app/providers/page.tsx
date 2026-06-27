'use client';
import { useState } from 'react';

export default function MarketplacePage() {
  const [providers] = useState([
    { name: 'Elegant Decor', category: 'Decor', price: 'UGX 500k' },
    { name: 'Kampala Catering', category: 'Food', price: 'UGX 1.2M' },
  ]);

  return (
    <main className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-serif mb-10">Local Providers</h1>
      <div className="grid gap-6">
        {providers.map((p, i) => (
          <div key={i} className="flex justify-between items-center p-8 bg-white border border-[#EBE7E0] rounded-3xl">
            <div>
              <h3 className="font-bold text-lg">{p.name}</h3>
              <p className="text-[#7D766D] text-sm">{p.category}</p>
            </div>
            <button className="bg-[#FDFBF7] border border-[#2D2926] px-6 py-3 rounded-xl font-bold">
              Request Quote
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}