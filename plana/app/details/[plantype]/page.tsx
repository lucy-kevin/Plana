'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import QuestionCard from '@/frontend/components/ui/QuestionCard';

export default function DynamicDetails() {
  const { planType } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  // Simulate API fetch for questions
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const typeKey = Array.isArray(planType) ? planType[0] : (planType || 'custom');

  // Helper to handle input changes
  const handleAnswer = (id: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

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

        {/* Input Section */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-white rounded-[2rem] border border-[#EBE7E0]" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <QuestionCard 
              label="What is your estimated guest count?"
              placeholder="e.g. 150"
              type="number"
              value={answers.guests || ''}
              onChange={(val) => handleAnswer('guests', val)}
            />
            <QuestionCard 
              label="Where is the event located?"
              placeholder="e.g. Kampala, Uganda"
              value={answers.location || ''}
              onChange={(val) => handleAnswer('location', val)}
            />
            <QuestionCard 
              label="Any special preferences?"
              placeholder="e.g. Outdoor garden setting"
              value={answers.notes || ''}
              onChange={(val) => handleAnswer('notes', val)}
            />
            
            <button 
              onClick={() => router.push('/budget')}
              className="w-full bg-[#2D2926] text-white py-6 rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-[0.98] shadow-lg mt-4"
            >
              Continue to Budget
            </button>
          </div>
        )}

        <p className="text-center text-[#B5AEA7] text-sm mt-10 font-medium">
          Powered by Plana AI
        </p>
      </div>
    </main>
  );
}