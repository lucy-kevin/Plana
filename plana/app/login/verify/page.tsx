'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '@/frontend/lib/api';
import { useAuthStore } from '@/frontend/lib/authStore';

export default function VerifyPage() {
  const [code, setCode] = useState('');
  const phone = useSearchParams().get('phone');
  const router = useRouter();
  const setToken = useAuthStore((state) => state.setToken);

  const handleVerify = async () => {
    const data = await authService.verifyOtp(phone!, code);
    setToken(data.token);
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2rem] border border-[#EBE7E0]">
        <h2 className="text-2xl font-serif mb-6">Verify your number</h2>
        <input 
          type="text" 
          placeholder="Enter 6-digit code"
          className="w-full p-4 bg-[#F9F7F4] rounded-xl mb-4 text-center tracking-widest text-2xl"
          onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={handleVerify} className="w-full bg-[#2D2926] text-white py-4 rounded-xl font-bold">
          Verify & Login
        </button>
      </div>
    </main>
  );
}