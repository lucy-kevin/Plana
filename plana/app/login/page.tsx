'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      if (step === 'phone') setStep('otp');
      setLoading(false);
    }, 1000);
  };

  return (
    // Applied the "Warm Cream" background with subtle organic gradient glows
    <div className="min-h-screen flex items-center justify-center p-6 font-sans relative overflow-hidden bg-[#FAF9F6]">
      {/* Background Organic Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[40%] -right-[10%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Main Glassmorphic Card */}
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 border border-white/50">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Welcome to Plana
          </h1>
          <p className="text-gray-500 mt-3 text-base font-medium">
            {step === 'phone' 
              ? 'Enter your number to access your plans.' 
              : 'Enter the 6-digit code sent to your phone.'}
          </p>
        </div>

        <div className="space-y-6">
          <input 
            type={step === 'phone' ? 'tel' : 'text'} 
            placeholder={step === 'phone' ? "+256 700 000000" : "000 000"}
            className="w-full p-5 text-lg rounded-2xl border-none bg-white/60 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-gray-300 text-center shadow-inner"
          />
          
          <button 
            onClick={handleAction}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-2xl font-bold text-lg active:scale-[0.98] transition-all duration-300 shadow-xl shadow-indigo-500/20 flex items-center justify-center"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              step === 'phone' ? "Send Secure Code" : "Verify & Enter Plana"
            )}
          </button>

          {step === 'otp' && (
            <button 
              onClick={() => setStep('phone')}
              className="w-full text-sm font-semibold text-gray-400 hover:text-indigo-600 transition-colors"
            >
              Back to phone number
            </button>
          )}
        </div>
      </div>
    </div>
  );
}