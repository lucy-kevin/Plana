import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import Navbar from '@/frontend/components/layout/Navbar'; // Assuming this component exists

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-[#FDFBF7] font-sans antialiased text-[#2D2926]">
        <Navbar />
        <main className="pt-24">{children}</main>
      </body>
    </html>
  );
}