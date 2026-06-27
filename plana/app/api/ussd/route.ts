import { generateWithRetry } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';
import AfricasTalking from 'africastalking';
import { supabaseAdmin } from '@/lib/supabase';

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

const MENU =
  'CON Welcome to Plana\n' +
  '1. Create a savings plan\n' +
  '2. Log my savings\n' +
  '3. Get login code\n' +
  '4. Get cost estimate\n' +
  '5. Ask Plana AI\n' +
  '6. Find providers';

const PLAN_TYPES: Record<string, string> = {
  '1': 'Wedding',
  '2': 'Trip',
  '3': 'Birthday',
  '4': 'Graduation',
  '5': 'Corporate Event',
  '6': 'Baby Shower',
  '7': 'Other',
};

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
    response = MENU;

  // ════════════════════════════════════════
  // OPTION 1: Create a savings plan
  // Flow: type → location → budget → months
  // ════════════════════════════════════════

  } else if (level === 1 && last === '1') {
    response =
      'CON Choose event type:\n' +
      '1. Wedding\n' +
      '2. Trip\n' +
      '3. Birthday\n' +
      '4. Graduation\n' +
      '5. Corporate Event\n' +
      '6. Baby Shower\n' +
      '7. Other\n' +
      '0. Back';

  } else if (level === 2 && parts[0] === '1' && last === '0') {
    response = MENU;

  // "Other" chosen → ask them to type the event name
  } else if (level === 2 && parts[0] === '1' && last === '7') {
    response =
      'CON Type your event name and send\n' +
      '(e.g. Kwanjula, Introduction,\n' +
      'Church fundraiser, Graduation trip):';

  // Other name entered → ask location
  } else if (level === 3 && parts[0] === '1' && parts[1] === '7') {
    response =
      `CON ${last}\n` +
      'Enter your city or town\n' +
      '(e.g. Kampala, Entebbe):';

  // Known type chosen → ask location
  } else if (level === 2 && parts[0] === '1' && PLAN_TYPES[last]) {
    response =
      `CON ${PLAN_TYPES[last]} plan\n` +
      'Enter your city or town\n' +
      '(e.g. Kampala, Entebbe):';

  // Type chosen but unknown
  } else if (level === 2 && parts[0] === '1') {
    response =
      'CON Invalid choice.\n' +
      '1.Wedding 2.Trip 3.Birthday\n' +
      '4.Graduation 5.Corporate\n' +
      '6.Baby Shower 7.Other\n' +
      '0. Back';

  // Other: location entered → ask budget
  } else if (level === 4 && parts[0] === '1' && parts[1] === '7') {
    const customType = parts[2];
    const location = last;
    response =
      `CON ${customType} in ${location}\n` +
      'Enter total budget in UGX\n' +
      '(e.g. 2000000 for 2M):';

  // Other: budget entered → ask months
  } else if (level === 5 && parts[0] === '1' && parts[1] === '7') {
    const budget = Number(last);
    if (!budget || budget <= 0) {
      response = 'CON Invalid budget.\nEnter UGX numbers only\n(e.g. 5000000):';
    } else {
      response =
        `CON Budget: UGX ${budget.toLocaleString()}\n` +
        'How many months until the event?\n' +
        '(e.g. 6 for 6 months):';
    }

  // Other: months entered → CREATE PLAN
  } else if (level === 6 && parts[0] === '1' && parts[1] === '7') {
    const customType = parts[2];
    const location = parts[3];
    const budget = Number(parts[4]);
    const months = Number(last);

    if (!budget || budget <= 0 || !months || months <= 0) {
      response = 'END Invalid input. Please dial again to create your plan.';
    } else {
      const eventDate = new Date();
      eventDate.setMonth(eventDate.getMonth() + months);
      const weeks = Math.ceil(months * 4.33);
      const weeklyTarget = Math.ceil(budget / weeks);
      try {
        await supabaseAdmin.from('users').upsert({ phone: phoneNumber }, { onConflict: 'phone', ignoreDuplicates: true });

        await supabaseAdmin.from('plans').insert({
          phone: phoneNumber,
          type: customType,
          location,
          budget,
          currency: 'UGX',
          event_date: eventDate.toISOString().split('T')[0],
          start_date: new Date().toISOString().split('T')[0],
          total_saved: 0,
        });
        response =
          `END Plan created!\n` +
          `${customType} in ${location}\n` +
          `Budget: UGX ${budget.toLocaleString()}\n` +
          `Save UGX ${weeklyTarget.toLocaleString()} per week\n` +
          `for ${weeks} weeks.\n` +
          'Dial 2 to log deposits anytime.';
        setImmediate(async () => {
          try {
            await sendSMS(phoneNumber,
              `Plana: Your ${customType} plan is ready!\n` +
              `Location: ${location}\nBudget: UGX ${budget.toLocaleString()}\n` +
              `Save UGX ${weeklyTarget.toLocaleString()} every week for ${weeks} weeks.\n` +
              `Log deposits: dial *384*200253# → 2\nDashboard: plana.vercel.app`
            );
          } catch { /* silent */ }
        });
      } catch {
        response = 'END Could not save plan. Please try again or visit plana.vercel.app';
      }
    }

  // Location entered → ask budget (known types)
  } else if (level === 3 && parts[0] === '1') {
    const typeName = PLAN_TYPES[parts[1]] ?? parts[1];
    response =
      `CON ${typeName} in ${last}\n` +
      'Enter total budget in UGX\n' +
      '(e.g. 2000000 for 2M):';

  // Budget entered → ask months
  } else if (level === 4 && parts[0] === '1') {
    const budget = Number(parts[3]);
    if (!budget || budget <= 0) {
      response =
        'CON Invalid budget.\n' +
        'Enter amount in UGX numbers only\n' +
        '(e.g. 5000000):';
    } else {
      response =
        `CON Budget: UGX ${budget.toLocaleString()}\n` +
        'How many months until the event?\n' +
        '(e.g. 6 for 6 months):';
    }

  // Months entered → CREATE PLAN
  } else if (level === 5 && parts[0] === '1') {
    const typeKey = parts[1];
    const location = parts[2];
    const budget = Number(parts[3]);
    const months = Number(last);

    if (!budget || budget <= 0 || !months || months <= 0) {
      response = 'END Invalid input. Please dial again to create your plan.';
    } else {
      const typeName = PLAN_TYPES[typeKey] ?? 'Event';

      // Calculate event date from months
      const eventDate = new Date();
      eventDate.setMonth(eventDate.getMonth() + months);
      const eventDateStr = eventDate.toISOString().split('T')[0];

      // Weekly target
      const weeks = Math.ceil(months * 4.33);
      const weeklyTarget = Math.ceil(budget / weeks);

      // Save plan to DB
      try {
        // Ensure a user record exists for this phone so web login works
        await supabaseAdmin.from('users').upsert({ phone: phoneNumber }, { onConflict: 'phone', ignoreDuplicates: true });

        await supabaseAdmin.from('plans').insert({
          phone: phoneNumber,
          type: typeName,
          location,
          budget,
          currency: 'UGX',
          event_date: eventDateStr,
          start_date: new Date().toISOString().split('T')[0],
          total_saved: 0,
        });

        response =
          `END Plan created!\n` +
          `${typeName} in ${location}\n` +
          `Budget: UGX ${budget.toLocaleString()}\n` +
          `Save UGX ${weeklyTarget.toLocaleString()} per week\n` +
          `for ${weeks} weeks.\n` +
          'Track at plana.vercel.app\n' +
          'Dial 2 to log deposits anytime.';

        // SMS with full details
        setImmediate(async () => {
          try {
            await sendSMS(phoneNumber,
              `Plana: Your ${typeName} plan is ready!\n` +
              `Location: ${location}\n` +
              `Budget: UGX ${budget.toLocaleString()}\n` +
              `Event date: ${eventDate.toLocaleDateString('en-UG', { month: 'long', year: 'numeric' })}\n` +
              `Save UGX ${weeklyTarget.toLocaleString()} every week for ${weeks} weeks.\n\n` +
              `Log deposits anytime: dial *384*200253# and choose 2.\n` +
              `Full dashboard: plana.vercel.app`
            );
          } catch { /* silent */ }
        });
      } catch {
        response = 'END Could not save plan. Please try again or visit plana.vercel.app';
      }
    }

  // ════════════════════════════════════════
  // OPTION 2: Log my savings
  // ════════════════════════════════════════

  } else if (level === 1 && last === '2') {
    const { data: plans } = await supabaseAdmin
      .from('plans')
      .select('id, type, location, budget, total_saved, currency')
      .eq('phone', phoneNumber)
      .order('created_at', { ascending: false });

    if (!plans || plans.length === 0) {
      response =
        'CON No savings plans found.\n' +
        'Dial 1 to create a plan now.\n\n' +
        '0. Back';
    } else if (plans.length === 1) {
      const p = plans[0];
      const pct = p.budget ? Math.round((p.total_saved / p.budget) * 100) : 0;
      response =
        `CON ${p.type}${p.location ? ' · ' + p.location : ''}\n` +
        `Saved: UGX ${Number(p.total_saved).toLocaleString()} (${pct}%)\n` +
        `Goal: UGX ${Number(p.budget).toLocaleString()}\n\n` +
        'Enter amount saved (UGX):';
    } else {
      const list = plans.slice(0, 4).map((p, i) =>
        `${i + 1}. ${p.type}${p.location ? ' · ' + p.location : ''}`
      ).join('\n');
      response = `CON Your plans:\n${list}\n0. Back`;
    }

  } else if (level === 2 && parts[0] === '2' && last === '0') {
    response = MENU;

  // Single plan — amount entered directly
  } else if (level === 2 && parts[0] === '2') {
    const amount = Number(last);
    const { data: plans } = await supabaseAdmin
      .from('plans')
      .select('id, type, total_saved, budget, currency')
      .eq('phone', phoneNumber)
      .order('created_at', { ascending: false });

    if (!plans || plans.length === 0) {
      response = 'END No plans found. Dial 1 to create one.';
    } else if (plans.length > 1 && !amount) {
      // They picked a plan number
      const idx = Number(last) - 1;
      if (idx < 0 || idx >= plans.length) {
        response = 'END Invalid choice. Please dial again.';
      } else {
        const p = plans[idx];
        const pct = p.budget ? Math.round((Number(p.total_saved) / p.budget) * 100) : 0;
        response =
          `CON ${p.type}\n` +
          `Saved: UGX ${Number(p.total_saved).toLocaleString()} (${pct}%)\n` +
          'Enter amount saved (UGX):';
      }
    } else if (plans.length === 1) {
      if (!amount || amount <= 0) {
        response = 'END Invalid amount. Please try again.';
      } else {
        const p = plans[0];
        const newTotal = (Number(p.total_saved) || 0) + amount;
        await supabaseAdmin.from('plans').update({ total_saved: newTotal }).eq('id', p.id);
        const remaining = Math.max(0, (p.budget || 0) - newTotal);
        const pct = p.budget ? Math.round((newTotal / p.budget) * 100) : 0;
        response =
          `END Saved! UGX ${amount.toLocaleString()} added.\n` +
          `Total: UGX ${newTotal.toLocaleString()} (${pct}%)\n` +
          `Remaining: UGX ${remaining.toLocaleString()}`;
        setImmediate(async () => {
          try {
            await sendSMS(phoneNumber,
              `Plana: UGX ${amount.toLocaleString()} logged to your ${p.type} plan.\n` +
              `Total saved: UGX ${newTotal.toLocaleString()} (${pct}% of goal).\n` +
              `Still needed: UGX ${remaining.toLocaleString()}. Keep it up!\n` +
              `plana.vercel.app`
            );
          } catch { /* silent */ }
        });
      }
    }

  // Multiple plans — plan selected → amount entered
  } else if (level === 3 && parts[0] === '2') {
    const planIdx = Number(parts[1]) - 1;
    const amount = Number(last);
    const { data: plans } = await supabaseAdmin
      .from('plans')
      .select('id, type, total_saved, budget, currency')
      .eq('phone', phoneNumber)
      .order('created_at', { ascending: false });

    if (!plans || !plans[planIdx] || !amount || amount <= 0) {
      response = 'END Invalid input. Please dial again.';
    } else {
      const p = plans[planIdx];
      const newTotal = (Number(p.total_saved) || 0) + amount;
      await supabaseAdmin.from('plans').update({ total_saved: newTotal }).eq('id', p.id);
      const remaining = Math.max(0, (p.budget || 0) - newTotal);
      const pct = p.budget ? Math.round((newTotal / p.budget) * 100) : 0;
      response =
        `END Saved! UGX ${amount.toLocaleString()} added.\n` +
        `${p.type}: UGX ${newTotal.toLocaleString()} (${pct}%)\n` +
        `Remaining: UGX ${remaining.toLocaleString()}`;
      setImmediate(async () => {
        try {
          await sendSMS(phoneNumber,
            `Plana: UGX ${amount.toLocaleString()} logged to your ${p.type} plan.\n` +
            `Total saved: UGX ${newTotal.toLocaleString()} (${pct}% of goal).\n` +
            `Still needed: UGX ${remaining.toLocaleString()}. Keep going!\n` +
            `plana.vercel.app`
          );
        } catch { /* silent */ }
      });
    }

  // ════════════════════════════════════════
  // OPTION 3: Get login code (OTP for web app)
  // ════════════════════════════════════════

  } else if (level === 1 && last === '3') {
    // Generate and send OTP so they can log into plana.vercel.app
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    try {
      await supabaseAdmin.from('otps').delete().eq('phone', phoneNumber);
      await supabaseAdmin.from('otps').insert({ phone: phoneNumber, code: otp, expires_at: expiresAt.toISOString() });
      // Also ensure user record exists
      await supabaseAdmin.from('users').upsert({ phone: phoneNumber }, { onConflict: 'phone', ignoreDuplicates: true });
      response = 'END Your Plana login code is being sent to this number by SMS. Enter it at plana.vercel.app to access your plans.';
      setImmediate(async () => {
        try {
          await sendSMS(phoneNumber,
            `Your Plana login code: ${otp}\nValid for 10 minutes.\n\nGo to plana.vercel.app, enter your number and this code to see your savings plans.`
          );
        } catch { /* silent */ }
      });
    } catch {
      response = 'END Could not send login code. Please try again.';
    }

  // ════════════════════════════════════════
  // OPTION 4: Cost estimate
  // ════════════════════════════════════════

  } else if (level === 1 && last === '4') {
    response =
      'CON Choose event type:\n' +
      '1. Wedding\n' +
      '2. Trip\n' +
      '3. Birthday party\n' +
      '4. Graduation\n' +
      '0. Back';

  } else if (level === 2 && parts[0] === '4' && last === '0') {
    response = MENU;

  } else if (level === 2 && parts[0] === '4') {
    const estimates: Record<string, string> = {
      '1': 'Wedding: UGX 5M-20M. Venue 40%, Catering 35%, Decor 15%, Other 10%.',
      '2': 'Trip: UGX 500K-2M. Transport 30%, Hotel 35%, Food 20%, Activities 15%.',
      '3': 'Birthday: UGX 500K-3M. Venue 30%, Food 40%, Entertainment 20%, Decor 10%.',
      '4': 'Graduation: UGX 500K-2M. Venue 35%, Catering 40%, Decor 15%, Photos 10%.',
    };
    const estimate = estimates[last] ?? 'Visit plana.vercel.app for a personalised estimate.';
    response = `CON ${estimate}\n\n1. Another estimate\n0. Main menu`;

  } else if (level === 3 && parts[0] === '4') {
    response = last === '1'
      ? 'CON Choose event type:\n1. Wedding\n2. Trip\n3. Birthday\n4. Graduation\n0. Back'
      : MENU;

  // ════════════════════════════════════════
  // OPTION 5: Ask Plana AI
  // ════════════════════════════════════════

  } else if (level === 1 && last === '5') {
    response =
      'CON Type your question and send.\n' +
      'We will SMS you the answer.\n\n' +
      '0. Back';

  } else if (level === 2 && parts[0] === '5' && last === '0') {
    response = MENU;

  } else if (level === 2 && parts[0] === '5') {
    const question = last;
    response = 'END Got it! Plana AI is thinking. Answer arrives by SMS shortly.';
    setImmediate(async () => {
      try {
        const prompt = `You are Plana, a friendly AI savings assistant for Uganda. Today is June 2026. A user asked via USSD. Reply in 2 short encouraging sentences with specific UGX numbers. Be positive — tell them what is achievable. No markdown. End with: "Visit plana.vercel.app for your full savings plan."\nQuestion: ${question}`;
        const answer = (await generateWithRetry(prompt)).trim().slice(0, 300);
        await sendSMS(phoneNumber, `Plana AI: ${answer}\n\nCreate a full savings plan: dial *384*200253# and choose 1, or visit plana.vercel.app`);
      } catch {
        try { await sendSMS(phoneNumber, 'Plana AI could not answer right now. Try again or visit plana.vercel.app'); } catch { /* silent */ }
      }
    });

  // ════════════════════════════════════════
  // OPTION 6: Find providers
  // ════════════════════════════════════════

  } else if (level === 1 && last === '6') {
    response =
      'CON Find providers:\n' +
      '1. Caterers\n' +
      '2. Venues\n' +
      '3. Photographers\n' +
      '4. Transport\n' +
      '0. Back';

  } else if (level === 2 && parts[0] === '6' && last === '0') {
    response = MENU;

  } else if (level === 2 && parts[0] === '6') {
    const cats: Record<string, string> = { '1': 'Caterers', '2': 'Venues', '3': 'Photographers', '4': 'Transport' };
    const cat = cats[last] ?? 'providers';
    response = `END Find ${cat} at plana.vercel.app/providers — filter by location and budget. Request quotes by SMS directly from the app.`;

  } else {
    response = MENU;
  }

  return new NextResponse(response, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'ngrok-skip-browser-warning': 'true',
    },
  });
}
