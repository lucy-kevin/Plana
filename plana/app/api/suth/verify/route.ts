// app/api/auth/verify/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { phone, otp } = await req.json();

  // Forwarding to your actual backend (e.g., in Uganda)
  const response = await fetch(`${process.env.BACKEND_API_URL}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp }),
  });

  const data = await response.json();
  
  if (response.ok) {
    return NextResponse.json({ token: data.token });
  }
  return NextResponse.json({ message: 'Auth failed' }, { status: 401 });
}