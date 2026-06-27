// lib/api.ts
import { useAuthStore } from './authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const { token } = useAuthStore.getState();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'API Request failed' }));
    throw new Error(error.message);
  }
  return response.json();
};

// Domain-specific service calls
export const authService = {
  sendOtp: (phone: string) => apiClient('/api/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, code: string) => apiClient('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code }) }),
};

export const planService = {
  getPlans: (phone: string) => apiClient(`/api/plans?phone=${phone}`),
  createPlan: (data: any) => apiClient('/api/plans', { method: 'POST', body: JSON.stringify(data) }),
};