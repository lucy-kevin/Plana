'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';
import { PLAN_TYPES } from '@/frontend/types/planTypes';
import type { PlanType } from '@/frontend/types/types';

export default function PlanSetup() {
  const [selected, setSelected] = useState<string | null>(null);
  const { setDraft } = usePlanStore();
  const router = useRouter();
  const setPlan = usePlanStore((state) => state.setPlan);

  const handleNext = () => {
    if (selected) {
      const planType = PLAN_TYPES.find(p => p.id === selected);
      if (planType) {
        setPlan({ 
          id: Math.random().toString(),
          type: planType as unknown as PlanType, 
          items: [],
          totalBudget: 0,
          destination: '',
          createdAt: new Date()
        });
      }
      router.push('/budget');
    }
  };

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
    <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <p className="badge-micropill mb-4">New plan</p>
        <h1 className="text-4xl font-serif text-foreground mb-10">What are you planning?</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {PLAN_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelected(type.id)}
              className={`p-6 rounded-3xl border-2 transition-all text-left ${
                selected === type.id
                  ? 'border-foreground bg-button-bg text-button-text'
                  : 'border-border bg-surface text-foreground hover:border-foreground'
              }`}
            >
              <p className="font-bold text-base">{icons[type.id] ?? type.label}</p>
            </button>
          ))}
        </div>

        <button
          disabled={!selected}
          onClick={proceed}
          className="btn-primary"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
