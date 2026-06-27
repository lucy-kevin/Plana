import { generateWithRetry } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

function getFallback(type: string | undefined, budget: number) {
  const t = (type ?? '').toLowerCase();

  let categories: { category: string; percentage: number; tip: string }[];

  if (t.includes('wedding')) {
    categories = [
      { category: 'Venue', percentage: 25, tip: 'Book the venue at least 6 months ahead to lock in better rates.' },
      { category: 'Catering & Drinks', percentage: 35, tip: 'Get at least 3 quotes from outside caterers and negotiate per-head pricing.' },
      { category: 'Photography & Video', percentage: 10, tip: 'Book your photographer early — good ones fill up fast.' },
      { category: 'Decor & Flowers', percentage: 10, tip: 'Hire a decorator who sources locally to reduce costs.' },
      { category: 'Attire & Beauty', percentage: 8, tip: 'Consider renting attire instead of buying to save significantly.' },
      { category: 'Music & Entertainment', percentage: 7, tip: 'A DJ is more affordable than a live band and covers more songs.' },
      { category: 'Transport & Logistics', percentage: 3, tip: 'Charter a bus for guests to reduce individual transport costs.' },
      { category: 'Contingency', percentage: 2, tip: 'Always keep a buffer for last-minute surprises.' },
    ];
  } else if (t.includes('trip') || t.includes('travel') || t.includes('tour') || t.includes('safari')) {
    categories = [
      { category: 'Accommodation', percentage: 35, tip: 'Book in advance and compare prices on Booking.com and local guesthouses.' },
      { category: 'Transport & Flights', percentage: 30, tip: 'Book flights at least 6 weeks early and use local buses for short legs.' },
      { category: 'Food & Meals', percentage: 15, tip: 'Eat at local restaurants and markets rather than hotel restaurants.' },
      { category: 'Activities & Entrance Fees', percentage: 12, tip: 'Buy park or attraction tickets online in advance to avoid peak-day queues.' },
      { category: 'Travel Insurance', percentage: 3, tip: 'Never skip travel insurance — compare plans on Insure My Trip.' },
      { category: 'Shopping & Souvenirs', percentage: 3, tip: 'Budget this upfront so it does not eat into essential categories.' },
      { category: 'Contingency', percentage: 2, tip: 'Keep a buffer for delays, price changes, or unplanned extras.' },
    ];
  } else if (t.includes('birthday') || t.includes('party')) {
    categories = [
      { category: 'Venue', percentage: 25, tip: 'Home or garden parties can cut venue costs by up to 100%.' },
      { category: 'Food & Catering', percentage: 40, tip: 'Order from a local caterer and supplement with a DIY snacks table.' },
      { category: 'Cake', percentage: 8, tip: 'Order from a local baker at least 2 weeks ahead for a better price.' },
      { category: 'Decor & Balloons', percentage: 10, tip: 'Buy decor in bulk from wholesale markets for big savings.' },
      { category: 'Entertainment', percentage: 10, tip: 'A playlist and games can replace an expensive DJ or performer.' },
      { category: 'Invitations & Printing', percentage: 4, tip: 'Use digital invites via WhatsApp to cut printing costs entirely.' },
      { category: 'Contingency', percentage: 3, tip: 'Set aside a small buffer for last-minute needs.' },
    ];
  } else if (t.includes('graduation')) {
    categories = [
      { category: 'Venue', percentage: 30, tip: 'Community halls and church grounds are often cheaper than hotel banquet rooms.' },
      { category: 'Catering & Drinks', percentage: 40, tip: 'Buffet-style service costs less per head than plated meals.' },
      { category: 'Photography', percentage: 10, tip: 'Book a photographer who offers packages with digital delivery only.' },
      { category: 'Decor & Theme', percentage: 10, tip: 'Use the graduation colors as a theme to simplify decor choices.' },
      { category: 'Printing & Invitations', percentage: 5, tip: 'Print at a local print shop rather than an online service for faster turnaround.' },
      { category: 'Contingency', percentage: 5, tip: 'Keep a buffer for unexpected guest numbers or vendor changes.' },
    ];
  } else if (t.includes('corporate') || t.includes('conference') || t.includes('meeting') || t.includes('seminar')) {
    categories = [
      { category: 'Venue & AV Equipment', percentage: 35, tip: 'Negotiate a package deal that includes projectors, mics, and Wi-Fi.' },
      { category: 'Catering & Tea Breaks', percentage: 30, tip: 'Serve tea breaks and lunch buffet style to reduce per-head cost.' },
      { category: 'Speaker & Facilitation Fees', percentage: 15, tip: 'Confirm speaker fees and travel costs in writing upfront.' },
      { category: 'Marketing & Printing', percentage: 10, tip: 'Design materials in Canva and print locally to cut design agency fees.' },
      { category: 'Transport & Accommodation', percentage: 7, tip: 'Block-book hotel rooms for out-of-town guests early for group discounts.' },
      { category: 'Contingency', percentage: 3, tip: 'Always keep a buffer for tech failures or last-minute additions.' },
    ];
  } else {
    // Generic fallback for anything custom
    categories = [
      { category: 'Venue & Space', percentage: 30, tip: 'Compare at least 3 venues and ask about off-peak discounts.' },
      { category: 'Food & Catering', percentage: 35, tip: 'Get multiple quotes and negotiate a per-head rate.' },
      { category: 'Equipment & Logistics', percentage: 15, tip: 'Hire locally to avoid transport surcharges on equipment.' },
      { category: 'Decor & Ambience', percentage: 10, tip: 'Source decor from local markets for the best value.' },
      { category: 'Contingency', percentage: 10, tip: 'Keep this aside for anything unexpected.' },
    ];
  }

  return categories.map((c, i) => ({
    id: `cat-${i + 1}`,
    category: c.category,
    percentage: c.percentage,
    amount: Math.round(budget * (c.percentage / 100)),
    typicalMin: Math.round(budget * (c.percentage / 100) * 0.75),
    typicalMax: Math.round(budget * (c.percentage / 100) * 1.3),
    tip: c.tip,
    source: 'Plana default estimate',
  }));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Accept both 'type' and 'planType' (breakdown page sends planType)
  const type: string = body.type ?? body.planType ?? 'event';
  const location: string = body.location ?? '';
  const currency: string = body.currency ?? 'UGX';
  const guestCount: number | undefined = body.guestCount;
  const budget = Number(body.budget);

  console.log('[ai-breakdown] received:', { type, location, budget, currency, guestCount });

  const prompt = `You are a budget planner for Uganda events. Return ONLY a valid JSON array, no explanation, no markdown.

Event: ${type} in ${location || 'Uganda'}. Budget: ${budget} UGX.${guestCount ? ` Guests: ${guestCount}.` : ''}

Return 5 categories. Each item: {"id":"cat-1","category":"name","percentage":number,"amount":number,"typicalMin":number,"typicalMax":number,"tip":"one short tip","source":"local estimate"}
Rules: percentages must total 100. amount=(percentage/100)*${budget}. typicalMin=amount*0.8. typicalMax=amount*1.25.
Output the JSON array only. Start with [`;

  try {
    const text = await generateWithRetry(prompt);
    const stripped = text.replace(/```json[\s\S]*?```|```/g, '').trim();
    const start = stripped.indexOf('[');
    const end = stripped.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error('No JSON array found');
    const breakdown = JSON.parse(stripped.slice(start, end + 1));
    return NextResponse.json({ breakdown });
  } catch {
    return NextResponse.json({ breakdown: getFallback(type, budget) });
  }
}
