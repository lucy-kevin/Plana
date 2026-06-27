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
    const error = await response.json();
    throw new Error(error.message || 'API Request failed');
  }

  return response.json();
};