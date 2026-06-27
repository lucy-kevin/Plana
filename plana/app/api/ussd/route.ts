import { generateWithRetry } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';

function getAT() {
  return AfricasTalking({
    username: process.env.AT_USERNAME!,
    apiKey: process.env.AT_API_KEY!,
  });
}

async function sendSMS(to: string, message: string) {
  const at = getAT();
  await at.SMS.send({ to: [to], message, from: undefined });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const params = new URLSearchParams(body);

  const phoneNumber = params.get('phoneNumber') ?? '';
  const text = params.get('text') ?? '';

  const parts = text.split('*').map((p) => p.trim());
  const level = text === '' ? 0 : parts.length;
  const last = parts[parts.length - 1];

  let response = '';

  // ── MAIN MENU ──
  if (text === '') {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';

  // ── OPTION 1: Cost estimate submenu ──
  } else if (level === 1 && last === '1') {
    response =
      'CON Choose event type:\n' +
      '1. Wedding\n' +
      '2. Trip to Kampala\n' +
      '3. Birthday party\n' +
      '4. Graduation\n' +
      '0. Back';

  // ── OPTION 1 > Back ──
  } else if (level === 2 && parts[0] === '1' && last === '0') {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';

  // ── OPTION 1 > Event type selected ──
  } else if (level === 2 && parts[0] === '1') {
    const estimates: Record<string, string> = {
      '1': 'Wedding: UGX 5M–20M. Venue 40%, Catering 35%, Decor 15%, Other 10%. Full plan at plana.vercel.app',
      '2': 'Trip to Kampala: UGX 500K–2M for 3 days. Transport 30%, Hotel 35%, Food 20%, Activities 15%.',
      '3': 'Birthday party: UGX 500K–3M. Venue 30%, Food 40%, Entertainment 20%, Decor 10%.',
      '4': 'Graduation: UGX 500K–2M. Venue 35%, Catering 40%, Decor 15%, Photos 10%.',
    };
    const estimate = estimates[last];
    if (estimate) {
      response =
        `CON ${estimate}\n\n` +
        '1. Get another estimate\n' +
        '0. Main menu';
    } else {
      response =
        'CON Invalid choice.\n' +
        '1. Wedding\n' +
        '2. Trip to Nairobi\n' +
        '3. Birthday party\n' +
        '4. Graduation\n' +
        '0. Back';
    }

  // ── OPTION 1 > Estimate > Get another / Main menu ──
  } else if (level === 3 && parts[0] === '1') {
    if (last === '1') {
      response =
        'CON Choose event type:\n' +
        '1. Wedding\n' +
        '2. Trip to Kampala\n' +
        '3. Birthday party\n' +
        '4. Graduation\n' +
        '0. Back';
    } else {
      response =
        'CON Welcome to Plana\n' +
        '1. Get cost estimate\n' +
        '2. Ask Plana AI\n' +
        '3. Find providers\n' +
        '4. About Plana';
    }

  // ── OPTION 2: Ask Plana AI ──
  } else if (level === 1 && last === '2') {
    response =
      'CON Type your question and send.\n' +
      'We will SMS you the answer.\n\n' +
      '0. Back to menu';

  // ── OPTION 2 > Back ──
  } else if (level === 2 && parts[0] === '2' && last === '0') {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';

  // ── OPTION 2 > Question submitted ──
  } else if (level === 2 && parts[0] === '2') {
    const question = last;
    response = 'END Got it! Plana AI is thinking. You will receive the answer via SMS shortly.';

    setImmediate(async () => {
      try {
        console.log('[ussd] AI question:', question, 'for', phoneNumber);
        const prompt = `You are Plana AI answering a planning question sent via USSD in Africa. Answer in 2 short sentences with specific numbers. No markdown, no bullet points.\nQuestion: ${question}`;
        const answer = (await generateWithRetry(prompt)).trim().slice(0, 300);
        console.log('[ussd] AI answer:', answer);
        await sendSMS(phoneNumber, `Plana AI: ${answer}\nMore at plana.vercel.app`);
        console.log('[ussd] SMS sent to', phoneNumber);
      } catch (err) {
        console.error('[ussd] background error:', (err as Error).message);
        try {
          await sendSMS(phoneNumber, 'Plana AI could not answer right now. Visit plana.vercel.app or try again.');
        } catch (smsErr) {
          console.error('[ussd] fallback SMS error:', (smsErr as Error).message);
        }
      }
    });

  // ── OPTION 3: Find providers ──
  } else if (level === 1 && last === '3') {
    response =
      'CON Find providers:\n' +
      '1. Caterers\n' +
      '2. Venues\n' +
      '3. Photographers\n' +
      '4. Transport\n' +
      '0. Back';

  // ── OPTION 3 > Back ──
  } else if (level === 2 && parts[0] === '3' && last === '0') {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';

  // ── OPTION 3 > Category selected ──
  } else if (level === 2 && parts[0] === '3') {
    const categories: Record<string, string> = {
      '1': 'Caterers',
      '2': 'Venues',
      '3': 'Photographers',
      '4': 'Transport',
    };
    const cat = categories[last] ?? 'providers';
    response = `END Find ${cat} near you at plana.vercel.app/providers — filter by location and budget.`;

  // ── OPTION 4: About Plana ──
  } else if (level === 1 && last === '4') {
    response =
      'CON Plana helps you plan events & trips.\n' +
      'AI cost breakdowns, savings tracker,\n' +
      'and local providers.\n\n' +
      '1. Visit plana.vercel.app\n' +
      '0. Back to menu';

  // ── OPTION 4 > Back ──
  } else if (level === 2 && parts[0] === '4') {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';

  } else {
    response =
      'CON Welcome to Plana\n' +
      '1. Get cost estimate\n' +
      '2. Ask Plana AI\n' +
      '3. Find providers\n' +
      '4. About Plana';
  }

  return new NextResponse(response, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'ngrok-skip-browser-warning': 'true',
    },
  });
}
