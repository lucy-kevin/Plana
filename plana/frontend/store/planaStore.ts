import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Plan } from '../types/types';

interface Draft {
  type: string;
  location: string;
  budget: number;
  guestCount: number;
  eventDate: string;
}

interface SavedPlan {
  id: string;
  type: string;
  location: string;
  budget: number;
  currency: string;
  guest_count: number | null;
  event_date: string | null;
  total_saved: number;
  created_at: string;
}

interface PlanStore {
  // Auth
  phone: string;
  setPhone: (phone: string) => void;

  // Draft — filled step by step before plan is created
  draft: Draft;
  setDraft: (fields: Partial<Draft>) => void;

  // Active plan for breakdown page (Zustand in-memory)
  plan: Plan | null;
  isCalculating: boolean;
  setPlan: (plan: Plan) => void;
  setIsCalculating: (val: boolean) => void;
  updateItemAmount: (itemId: string, newAmount: number) => void;
  getTotalAllocated: () => number;

  // Created plan ID — set after saving to DB
  savedPlanId: string | null;
  setSavedPlanId: (id: string) => void;

  // All plans from DB (for dashboard)
  savedPlans: SavedPlan[];
  setSavedPlans: (plans: SavedPlan[]) => void;
  updateSavedPlanSavings: (id: string, totalSaved: number) => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      phone: '',
      setPhone: (phone) => set({ phone }),

      draft: { type: '', location: '', budget: 0, guestCount: 0, eventDate: '' },
      setDraft: (fields) => set((s) => ({ draft: { ...s.draft, ...fields } })),

      plan: null,
      isCalculating: false,
      setPlan: (plan) => set({ plan }),
      setIsCalculating: (val) => set({ isCalculating: val }),
      updateItemAmount: (itemId, newAmount) => set((state) => {
        if (!state.plan) return state;
        return {
          plan: {
            ...state.plan,
            items: state.plan.items.map(item =>
              item.id === itemId ? { ...item, estimatedCost: newAmount } : item
            ),
          },
        };
      }),
      getTotalAllocated: () => {
        const { plan } = get();
        return plan ? plan.items.reduce((sum, item) => sum + item.estimatedCost, 0) : 0;
      },

      savedPlanId: null,
      setSavedPlanId: (id) => set({ savedPlanId: id }),

      savedPlans: [],
      setSavedPlans: (plans) => set({ savedPlans: plans }),
      updateSavedPlanSavings: (id, totalSaved) => set((s) => ({
        savedPlans: s.savedPlans.map(p => p.id === id ? { ...p, total_saved: totalSaved } : p),
      })),
    }),
    { name: 'plana-store', partialize: (s) => ({ phone: s.phone, draft: s.draft }) }
  )
);
