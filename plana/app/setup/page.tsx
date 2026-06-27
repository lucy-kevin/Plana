'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';
import { PLAN_TYPES } from '@/frontend/types/planTypes';

export default function PlanSetup() {
  const [selected, setSelected] = useState<string | null>(null);
  const [customType, setCustomType] = useState('');
  const { setDraft } = usePlanStore();
  const router = useRouter();

  const labels: Record<string, string> = {
    wedding: 'Wedding', trip: 'Trip', corporate: 'Corporate Event',
    birthday: 'Birthday', other: 'Something else',
  };

  const isOther = selected === 'other';
  const canProceed = selected && (!isOther || customType.trim().length > 0);

  function proceed() {
    if (!selected) return;
    const planType = isOther ? customType.trim() : selected;
    setDraft({ type: planType });
    router.push(`/details/${encodeURIComponent(planType)}`);
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">New plan</p>
        <h1 className="text-4xl font-serif text-[#2D2926] mb-10">What are you planning?</h1>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {PLAN_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => { setSelected(type.id); setCustomType(''); }}
              className={`p-6 rounded-3xl border-2 transition-all text-left ${
                selected === type.id
                  ? 'border-[#2D2926] bg-[#2D2926] text-[#FDFBF7]'
                  : 'border-[#EBE7E0] bg-white text-[#2D2926] hover:border-[#2D2926]'
              }`}
            >
              <p className="font-bold text-base">{labels[type.id] ?? type.label}</p>
            </button>
          ))}
        </div>

        {/* Custom description — only shown when Other is selected */}
        {isOther && (
          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-3">
              Describe what you are planning
            </label>
            <input
              autoFocus
              value={customType}
              onChange={e => setCustomType(e.target.value)}
              placeholder="e.g. Kwanjula, Baby shower, Church fundraiser..."
              className="w-full p-4 bg-white rounded-2xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all text-[#2D2926] font-medium text-sm"
            />
          </div>
        )}

        <button
          disabled={!canProceed}
          onClick={proceed}
          className="w-full bg-[#2D2926] text-[#FDFBF7] py-5 rounded-2xl font-bold text-base hover:bg-[#1A1614] disabled:opacity-40 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
