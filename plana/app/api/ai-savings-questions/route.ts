import { model } from '@/lib/ai';
import { NextRequest, NextResponse } from 'next/server';

// Sensible fallback questions that apply to any plan type
function getFallback(type: string) {
  return [
    {
      id: 'q1',
      question: 'What is your monthly take-home income?',
      placeholder: 'e.g. UGX 50,000',
      key: 'monthlyIncome',
      type: 'number',
    },
    {
      id: 'q2',
      question: 'What are your total monthly expenses (rent, food, transport, bills)?',
      placeholder: 'e.g. UGX 30,000',
      key: 'monthlyExpenses',
      type: 'number',
    },
    {
      id: 'q3',
      question: 'How do you currently save money?',
      placeholder: 'e.g. M-PESA lock savings, bank account, chama, cash at home',
      key: 'savingsMethod',
      type: 'text',
    },
    {
      id: 'q4',
      question: 'Are you saving alone or with others (partner, family, chama)?',
      placeholder: 'e.g. Alone, With partner, Family chama of 5 people',
      key: 'savingsWith',
      type: 'text',
    },
    {
      id: 'q5',
      question: `Is the date for your ${type} flexible or fixed?`,
      placeholder: 'e.g. Fixed date, Can shift by 2 months',
      key: 'dateFlexibility',
      type: 'text',
    },
  ];
}

export async function POST(req: NextRequest) {
  const { type, location, budget, currency, monthsLeft } = await req.json();

  const prompt = `Savings coach. User is saving for: "${type}" in ${location}. Goal: ${currency} ${budget} in ${monthsLeft} months.

Generate 5 short friendly questions to understand their income, expenses, savings method, who they save with, and any event-specific constraints.
Return raw JSON only, no markdown:
[{"id":"q1","question":"string","placeholder":"example answer","key":"camelCaseKey","type":"text or number"}]`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const clean = text.replace(/```json[\s\S]*?```|```/g, '').trim();
    const questions = JSON.parse(clean);
    return NextResponse.json({ questions });
  } catch (err) {
    console.error('[ai-savings-questions] error:', err);
    return NextResponse.json({ questions: getFallback(type) });
  }
}
