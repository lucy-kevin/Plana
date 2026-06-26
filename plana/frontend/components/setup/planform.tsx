'use client';
import { useState } from 'react';
import { usePlanStore } from '@/frontend/store/planaStore'; // Adjusted path to standard project root
import { useRouter } from "next/navigation";

export default function PlanForm() {
  const [type, setType] = useState('Trip');
  const [budget, setBudget] = useState(0);
  const { setPlan } = usePlanStore();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Initialize the plan using Zustand store
    setPlan({
      id: Date.now().toString(),
      type: type as any,
      destination: 'Nairobi',
      totalBudget: budget,
      items: [],
      createdAt: new Date(),
    });
    
    router.push('/breakdown');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold">Create New Plan</h2>
      
      <div>
        <label className="block text-sm font-medium">Plan Type</label>
        <select 
          value={type}
          onChange={(e) => setType(e.target.value)} 
          className="w-full border p-2 rounded"
        >
          {['Trip', 'Wedding', 'Party', 'Graduation', 'Corporate', 'Introduction', 'Custom'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Total Budget</label>
        <input 
          type="number" 
          placeholder="Enter Total Budget" 
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full border p-2 rounded"
          required
        />
      </div>

      <button 
        type="submit" 
        className="bg-blue-600 text-white p-2 w-full rounded hover:bg-blue-700 transition"
      >
        Create Plan
      </button>
    </form>
  );
}