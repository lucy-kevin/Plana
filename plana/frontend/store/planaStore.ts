import { create } from 'zustand';
import { Plan } from '../types/types';

interface PlanStore {
  plan: Plan | null;
  isCalculating: boolean;
  setPlan: (plan: Plan) => void;
  setIsCalculating: (val: boolean) => void;
  updateItemAmount: (itemId: string, newAmount: number) => void;
  getTotalAllocated: () => number;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plan: null,
  isCalculating: false,

  setPlan: (plan) => set({ plan }),
  
  setIsCalculating: (val) => set({ isCalculating: val }),

  updateItemAmount: (itemId, newAmount) => set((state) => {
    if (!state.plan) return state;
    return {
      plan: {
        ...state.plan,
        items: state.plan.items.map((item) => 
          item.id === itemId ? { ...item, estimatedCost: newAmount } : item
        ),
      },
    };
  }),

  getTotalAllocated: () => {
    const { plan } = get();
    return plan ? plan.items.reduce((sum, item) => sum + item.estimatedCost, 0) : 0;
  },
}));