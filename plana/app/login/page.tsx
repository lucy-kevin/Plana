'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlanStore } from '@/frontend/store/planaStore';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setPhone: storePhone } = usePlanStore();
  const router = useRouter();

  async function sendOtp() {
    if (!phone) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Could not send code.'); setLoading(false); return; }
    setStep('otp');
    setLoading(false);
  }

  async function verifyOtp() {
    if (!otp) return;
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code: otp }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? 'Incorrect code.'); setLoading(false); return; }
    storePhone(phone);
    // New users go straight to creating their first plan
    router.push(data.isNewUser ? '/setup' : '/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FDFBF7] relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[700px] h-[700px] bg-indigo-100/40 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[0%] -right-[10%] w-[600px] h-[600px] bg-amber-100/50 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-2xl p-10 rounded-[3rem] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.1)] border border-white/50">

        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 mb-4 rounded-full bg-[#2D2926]/5 text-[#2D2926] text-[10px] font-black uppercase tracking-[0.2em]">
            Your Personal Planning Assistant
          </div>
          <h1 className="text-5xl font-serif text-[#2D2926] tracking-tight">Plana</h1>
          <p className="text-[#7D766D] mt-4 font-medium max-w-[260px] mx-auto leading-relaxed">
            {step === 'phone'
              ? 'New or returning — just enter your number. We will send you a code.'
              : 'Check your messages for the 6-digit code.'}
          </p>
        </div>

        <div className="space-y-5">
          {step === 'phone' ? (
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+256 700 000 000"
              className="w-full p-6 text-center text-2xl font-bold bg-white rounded-3xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all shadow-inner"
            />
          ) : (
            <input
              value={otp}
              onChange={e => setOtp(e.target.value)}
              placeholder="000 000"
              maxLength={6}
              className="w-full p-6 text-center text-2xl font-bold bg-white rounded-3xl border-2 border-[#EBE7E0] outline-none focus:border-[#2D2926] focus:ring-4 focus:ring-[#2D2926]/5 transition-all shadow-inner tracking-[0.3em]"
            />
          )}

          {error && (
            <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-100 p-4 rounded-2xl text-center">
              {error}
            </p>
          )}

          <button
            onClick={step === 'phone' ? sendOtp : verifyOtp}
            disabled={loading}
            className="w-full bg-[#2D2926] text-white py-6 rounded-3xl font-bold text-lg hover:scale-[1.01] transition-all duration-300 shadow-xl shadow-[#2D2926]/20 disabled:opacity-50"
          >
            {loading
              ? (step === 'phone' ? 'Sending code...' : 'Verifying...')
              : (step === 'phone' ? 'Continue to Plana' : 'Verify & Enter')}
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setStep(step === 'phone' ? 'otp' : 'phone'); setError(''); }}
            className="text-xs font-bold text-[#A8A29E] hover:text-[#2D2926] uppercase tracking-widest transition-colors"
          >
            {step === 'phone' ? 'Need help?' : 'Back to phone number'}
          </button>
        </div>
      </div>
    </div>
  );
}
