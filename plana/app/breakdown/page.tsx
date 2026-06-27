// app/breakdown/page.tsx
'use client';
import { useState } from 'react';

export default function AIPlanningBreakdown() {
  const [loading, setLoading] = useState(true);

  // Simulate AI processing
  useState(() => {
    setTimeout(() => setLoading(false), 2000);
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-2xl">Plana is analyzing your budget...</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Your AI-Generated Budget</h1>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="space-y-6">
          {[
            { cat: "Venue", amount: "200,000" },
            { cat: "Catering", amount: "150,000" },
            { cat: "Decor", amount: "100,000" },
            { cat: "Photography", amount: "50,000" }
          ].map((item) => (
            <div key={item.cat} className="flex justify-between items-center border-b pb-4">
              <span className="font-semibold text-gray-700">{item.cat}</span>
              <span className="text-indigo-600 font-bold">KES {item.amount}</span>
            </div>
          ))}
        </div>
        <button className="w-full mt-8 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-gray-800">
          Confirm & Save Breakdown
        </button>
      </div>
    </div>
  );
}