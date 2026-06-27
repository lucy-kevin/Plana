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

  const handleAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <main className="min-h-screen bg-background py-16 px-6">
      <div className="max-w-md mx-auto">
        <div className="mb-10">
          <p className="badge-micropill mb-4">
            {plantype.replace('-', ' ')}
          </p>
          <h1 className="text-4xl font-serif text-foreground leading-tight mb-3">
            Tell us about your plan.
          </h1>
          <p className="text-body text-base leading-relaxed">
            A few details help Plana AI build a budget that actually fits your situation.
          </p>
        </div>

        <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm space-y-6">

          {/* Core fields */}
          <div>
            <label className="block badge-micropill mb-2">Location *</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Kampala, Entebbe, Wakiso"
              className="input-ghost"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block badge-micropill mb-2">Guests</label>
              <input
                type="number"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                placeholder="e.g. 150"
                className="input-ghost"
              />
            </div>
            <div>
              <label className="block badge-micropill mb-2">Event date</label>
              <input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="input-ghost"
              />
            </div>
          </div>

          {/* AI questions */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 skeleton" />
              ))}
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={i}>
                <label className="block text-xs font-bold text-body mb-2 leading-relaxed">{q}</label>
                <input
                  value={answers[`q${i}`] ?? ''}
                  onChange={e => setAnswers(prev => ({ ...prev, [`q${i}`]: e.target.value }))}
                  placeholder="Your answer..."
                  className="input-ghost"
                />
              </div>
            ))
          )}

          <button
            onClick={proceed}
            disabled={!canProceed}
            className="btn-primary"
          >
            Set my budget
          </button>
        </div>

        <p className="text-center text-muted-lighter text-xs mt-8 font-medium">Powered by Plana AI</p>
      </div>
    </main>
  );
}
