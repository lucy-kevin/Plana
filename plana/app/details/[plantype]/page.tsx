'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { usePlanStore } from '@/frontend/store/planaStore';

// Keywords that indicate a question duplicates location / guests / date — skip those
const SKIP_KEYWORDS = [
  // location
  'take place', 'location', 'where will', 'where are', 'where do you', 'city', 'venue', 'destination', 'planning to travel', 'held',
  // guests / attendance
  'how many guest', 'number of guest', 'guest count', 'many people', 'how many people', 'how many attendee', 'many attendee', 'how many are', 'people attending',
  // date / timing
  'specific date', 'date in mind', 'when is', 'event date', 'planned date', 'what date', 'target date', 'time frame', 'timeframe', 'what month', 'when do you', 'when are you', 'planned for', 'scheduled', 'travel month', 'preferred month', 'available date', 'before the',
  // budget (duplicates /budget page)
  'have a budget', 'set a budget', 'budget in mind', 'savings goal', 'how much do you', 'how much are you',
];

function isDuplicate(q: string) {
  const lower = q.toLowerCase();
  return SKIP_KEYWORDS.some(k => lower.includes(k));
}

const loadingPhrases: Record<string, string[]> = {
  wedding: [
    'Planning your big day…',
    'Thinking about venues and catering…',
    'Preparing your wedding questions…',
    'Almost ready…',
  ],
  trip: [
    'Packing your itinerary…',
    'Checking routes and hotels…',
    'Preparing your travel questions…',
    'Almost ready…',
  ],
  birthday: [
    'Blowing up the balloons…',
    'Planning the celebration…',
    'Preparing your party questions…',
    'Almost ready…',
  ],
  corporate: [
    'Setting up the boardroom…',
    'Organising your event…',
    'Preparing your questions…',
    'Almost ready…',
  ],
  default: [
    'Getting things ready…',
    'Organising your plan…',
    'Preparing your questions…',
    'Almost ready…',
  ],
};

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
  const [phraseIdx, setPhraseIdx] = useState(0);
  const fetchedRef = useRef(false);

  const phrases = loadingPhrases[plantype?.toLowerCase()] ?? loadingPhrases.default;

  // Cycle through loading phrases while fetching
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setPhraseIdx(i => (i + 1) % phrases.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [loading, phrases.length]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    fetch('/api/ai-savings-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planType: plantype }),
    })
      .then(r => r.json())
      .then(d => {
        const raw: string[] = d.questions ?? [];
        // Remove questions that duplicate the core fields we already collect
        setQuestions(raw.filter(q => !isDuplicate(q)));
        setLoading(false);
      })
      .catch(() => {
        setQuestions([
          'Are you saving alone or with others?',
          'What is the most important part of this event for you?',
          'Do you have any existing savings toward this goal?',
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

  return (
    <main className="min-h-screen bg-[#FDFBF7] py-16 px-6 font-sans">
      <div className="max-w-md mx-auto">

        <div className="mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#A8A29E] mb-4 capitalize">
            {decodeURIComponent(plantype).replace(/-/g, ' ')}
          </p>
          <h1 className="text-4xl font-serif text-[#2D2926] leading-tight mb-3">
            Tell us about your {decodeURIComponent(plantype).replace(/-/g, ' ')}.
          </h1>
          <p className="text-[#7D766D] text-base leading-relaxed">
            A few details help Plana AI build a savings plan that actually fits your situation.
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

          {/* AI questions — animated loading, no repetition */}
          {loading ? (
            <div className="py-4 text-center">
              <p className="text-sm font-semibold text-[#7D766D] transition-all duration-500">
                {phrases[phraseIdx]}
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-[#2D2926] opacity-30"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <style>{`
                @keyframes pulse {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 1; transform: scale(1.3); }
                }
              `}</style>
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
