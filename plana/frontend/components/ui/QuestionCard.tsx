'use client';

interface QuestionCardProps {
  label: string;
  placeholder: string;
  value: string | number;
  onChange: (val: any) => void;
  type?: 'text' | 'number';
}

export default function QuestionCard({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  type = 'text' 
}: QuestionCardProps) {
  return (
    <div className="group bg-white p-8 rounded-[2rem] border border-[#EBE7E0] hover:border-[#2D2926]/20 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      <label className="block text-[10px] font-black uppercase tracking-widest text-[#A8A29E] mb-4">
        {label}
      </label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full text-2xl font-serif text-[#2D2926] bg-transparent outline-none placeholder:text-[#D1CBC5] focus:ring-0"
      />
    </div>
  );
}