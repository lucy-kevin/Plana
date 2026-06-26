// lib/services.ts
import { Plan } from '../types/types';

export const PlanService = {
  async getBreakdown(type: string, budget: number) {
    const res = await fetch('/api/ai-breakdown', {
      method: 'POST',
      body: JSON.stringify({ type, budget }),
    });
    return res.json();
  },



 
  async requestProviderQuote(providerId: string, details: any) {
    const res = await fetch('/api/request-quote', {
      method: 'POST',
      body: JSON.stringify({ providerId, ...details }),
    });
    return res.json();
  }
};