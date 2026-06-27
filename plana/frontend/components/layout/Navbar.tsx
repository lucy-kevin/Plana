import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50 bg-background/80 backdrop-blur-md">
      <Link href="/dashboard" className="text-xl font-serif font-bold">Plana</Link>
      <div className="flex gap-6 text-xs font-black uppercase tracking-widest text-muted">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <Link href="/providers" className="hover:text-foreground">Marketplace</Link>
        <Link href="/quotes" className="hover:text-foreground">Quotes</Link>
      </div>
    </nav>
  );
}
