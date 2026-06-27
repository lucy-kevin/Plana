import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50">
      <Link href="/dashboard" className="text-2xl font-serif font-bold text-[#2D2926]">Plana</Link>
      <div className="w-10 h-10 bg-white rounded-full border border-[#EBE7E0] shadow-sm flex items-center justify-center text-xs font-bold text-[#2D2926]">
        AR
      </div>
    </nav>
  );
}