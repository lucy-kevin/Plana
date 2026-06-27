// app/setup/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PLAN_TYPES } from '@/frontend/types/planTypes'; // Importing the dynamic data

export default function PlanSetup() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">What are you planning?</h1>
        
        <div className="grid grid-cols-2 gap-4">
          {PLAN_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                selected === type.id 
                  ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                  : 'border-gray-200 bg-white hover:border-indigo-200'
              }`}
            >
              <span className="text-4xl">{type.icon}</span>
              <span className="font-bold text-gray-800">{type.label}</span>
            </button>
          ))}
        </div>

        <button 
          disabled={!selected}
          onClick={() => router.push('/budget')} 
          className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800 disabled:opacity-50 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}