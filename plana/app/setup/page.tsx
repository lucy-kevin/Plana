'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';
import { PLAN_TYPES } from '@/frontend/types/planTypes';

export default function PlanSetup() {
  const [selected, setSelected] = useState<string | null>(null);
  const { setDraft } = usePlanStore();
  const router = useRouter();

  const icons: Record<string, string> = {
    wedding: 'Wedding', trip: 'Trip', corporate: 'Corporate Event',
    birthday: 'Birthday', other: 'Other',
  };

  function proceed() {
    if (!selected) return;
    setDraft({ type: selected });
    router.push(`/details/${selected}`);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">New plan</p>
        <h1 className="text-4xl font-serif text-[#2D2926] mb-10">What are you planning?</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {PLAN_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`p-6 rounded-3xl border-2 transition-all text-left ${
                selected === type.id
                  ? 'border-[#2D2926] bg-[#2D2926] text-[#FDFBF7]'
                  : 'border-[#EBE7E0] bg-white text-[#2D2926] hover:border-[#2D2926]'
              }`}
            >
              <p className="font-bold text-base">{icons[type.id] ?? type.label}</p>
            </button>
          ))}
        </div>

        <button
          disabled={!selected}
          onClick={proceed}
          className="w-full bg-[#2D2926] text-[#FDFBF7] py-5 rounded-2xl font-bold text-base hover:bg-[#1A1614] disabled:opacity-40 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
