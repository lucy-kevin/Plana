// lib/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  phone: string | null;
  setAuth: (token: string, phone: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      phone: null,
      setToken: (token) => set({ token }),
      setAuth: (token, phone) => set({ token, phone }),
      logout: () => set({ token: null, phone: null }),
    }),
    {
      name: 'plana-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);