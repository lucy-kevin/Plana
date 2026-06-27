'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { usePlanStore } from '@/frontend/store/planaStore';

export default function DynamicDetails() {
  const { plantype } = useParams() as { plantype: string };
  const router = useRouter();
  const { setDraft, draft } = usePlanStore();

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [location, setLocation] = useState(draft.location ?? '');
  const [guestCount, setGuestCount] = useState(draft.guestCount ? String(draft.guestCount) : '');
  const [eventDate, setEventDate] = useState(draft.eventDate ?? '');
  const [loading, setLoading] = useState(true);
  // const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/ai-savings-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: plantype }),
    })
      .then(r => r.json())
      .then(d => {
        setQuestions(d.questions ?? []);
        setLoading(false);
      })
      .catch(() => {
        setQuestions([
          'Where will this event take place?',
          'How many guests are you expecting?',
          'Do you have a preferred date or timeframe?',
        ]);
        setLoading(false);
      });
  }, [plantype]);

  function proceed() {
    setDraft({
      type: plantype,
      location,
      guestCount: Number(guestCount) || 0,
      eventDate,
    });
    router.push('/budget');
  }

  const canProceed = location.trim().length > 0;

  // Helper to handle input changes
  const handleAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-16 px-6 font-sans">
      <div className="max-w-md mx-auto">
        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4">
            {plantype.replace('-', ' ')}
          </p>
          <h1 className="text-4xl font-serif text-[#2D2926] leading-tight mb-3">
            Tell us about your plan.
          </h1>
          <p className="text-[#7D766D] text-base leading-relaxed">
            A few details help Plana AI build a budget that actually fits your situation.
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-[#EBE7E0] shadow-sm space-y-6">

          {/* Core fields */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Location *</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Kampala, Entebbe, Wakiso"
              className="w-full p-4 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none transition-all text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Guests</label>
              <input
                type="number"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                placeholder="e.g. 150"
                className="w-full p-4 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-2">Event date</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full p-4 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* AI questions */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-[#F9F7F4] rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-[#7D766D] mb-2 leading-relaxed">{q}</label>
                <input
                  value={answers[`q${i}`] ?? ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                  placeholder="Your answer..."
                  className="w-full p-4 bg-[#F9F7F4] rounded-2xl font-medium text-[#2D2926] border-2 border-transparent focus:border-[#2D2926] outline-none transition-all text-sm"
                />
              </div>
            ))
          )}

          <button
            onClick={proceed}
            disabled={!canProceed}
            className="w-full bg-[#2D2926] text-[#FDFBF7] py-5 rounded-2xl font-bold text-base hover:bg-[#1A1614] disabled:opacity-40 transition-all"
          >
            Set my budget
          </button>
        </div>

        <p className="text-center text-[#B5AEA7] text-xs mt-8 font-medium">Powered by Plana AI</p>
      </div>
    </main>
  );
}
