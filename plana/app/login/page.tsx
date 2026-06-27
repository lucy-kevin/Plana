'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/frontend/lib/api';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const router = useRouter();

  const handleSend = async () => {
    await authService.sendOtp(phone);
    router.push(`/login/verify?phone=${phone}`);
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[2rem] border border-[#EBE7E0]">
        <h1 className="text-3xl font-serif mb-6">Welcome to Plana</h1>
        <input 
          type="tel" 
          placeholder="Enter phone number (e.g. 2567...)"
          className="w-full p-4 bg-[#F9F7F4] rounded-xl mb-4"
          onChange={(e) => setPhone(e.target.value)}
        />
        <button onClick={handleSend} className="w-full bg-[#2D2926] text-white py-4 rounded-xl font-bold">
          Send Code
        </button>
      </div>
    </main>
  );
}