import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 bg-[#FDFBF7]/80 backdrop-blur-md">
      <Link href="/dashboard" className="text-xl font-serif font-bold">Plana</Link>
      <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-[#A8A29E]">
        <Link href="/dashboard" className="hover:text-[#2D2926]">Dashboard</Link>
        <Link href="/providers" className="hover:text-[#2D2926]">Marketplace</Link>
        <Link href="/quotes" className="hover:text-[#2D2926]">Quotes</Link>
      </div>
    </nav>
  );
}