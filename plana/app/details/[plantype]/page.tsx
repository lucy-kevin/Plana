'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DynamicDetails() {
  const { planType } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Mocking the backend fetch
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const typeKey = Array.isArray(planType) ? planType[0] : (planType || 'custom');

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-16 px-6">
      <div className="max-w-md mx-auto">
        
        {/* Warm Header */}
        <div className="mb-10 text-left">
          <div className="w-12 h-1 bg-amber-400 rounded-full mb-6"></div>
          <h1 className="text-4xl font-serif text-[#2D2926] leading-tight">
            Tell us about your <span className="italic text-indigo-900">{typeKey.replace('-', ' ')}</span>
          </h1>
          <p className="text-[#7D766D] mt-4 text-lg">
            A few details help our AI create a realistic plan tailored to you.
          </p>
        </div>

        {/* Homey Input Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-[#EBE7E0]">
          <div className="space-y-8">
            {/* These inputs would be mapped from your API response */}
            {[1, 2, 3].map((i) => (
              <div key={i}>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#A8A29E] mb-3 ml-1">
                  Question {i}
                </label>
                <input 
                  className="w-full p-4 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border border-[#EBE7E0] focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all placeholder:text-[#D1CBC5]" 
                  placeholder="Type your answer here..."
                />
              </div>
            ))}
            
            <button 
              onClick={() => router.push('/breakdown')}
              className="w-full bg-[#2D2926] text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-[0.98] shadow-lg"
            >
              Generate My Plan
            </button>
          </div>
        </div>

        <p className="text-center text-[#B5AEA7] text-sm mt-10 font-medium">
          Powered by Plana AI
        </p>
      </div>
    </main>
  );
}