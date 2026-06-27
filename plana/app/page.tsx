'use client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2926]">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Smaller, refined opening */}
          <span className="text-[#4F46E5] font-black uppercase tracking-[0.2em] text-[10px] mb-6 block">
            Welcome to Plana
          </span>
          
          <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-8">
            Plan your life’s <br />
            <span className="italic text-[#2D2926]/70">finest moments.</span>
          </h1>
          
          <p className="text-xl text-[#7D766D] mb-12 max-w-lg mx-auto leading-relaxed">
            From intimate birthday dinners to grand corporate galas and weekend getaways, we make the planning feel effortless.
          </p>

          <button 
            onClick={() => router.push('/login')}
            className="bg-[#2D2926] text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-black transition-all shadow-lg active:scale-[0.98]"
          >
            Start Planning
          </button>
        </div>
      </section>

      {/* Services Grid - Neater & Intuitive */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Weddings", img: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800" },
            { title: "Corporate", img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" },
            { title: "Travel & Trips", img: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800" },
            { title: "Birthdays", img: "https://images.unsplash.com/photo-1464366535699-2826a798832a?auto=format&fit=crop&q=80&w=800" }
          ].map((item, idx) => (
            <div key={idx} className="group relative h-[300px] rounded-[2.5rem] overflow-hidden border border-[#EBE7E0]">
              <Image 
                src={item.img} 
                alt={item.title} 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
              <div className="absolute bottom-8 left-8">
                <h3 className="text-white font-serif text-2xl">{item.title}</h3>
                <div className="w-12 h-0.5 bg-white mt-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 px-6 text-center bg-[#F9F7F4]">
        <h2 className="text-3xl font-serif mb-6">Ready to begin?</h2>
        <p className="text-[#7D766D] mb-8">One platform for every event in your calendar.</p>
        <button 
            onClick={() => router.push('/login')}
            className="border border-[#2D2926] text-[#2D2926] px-10 py-4 rounded-2xl font-bold hover:bg-[#2D2926] hover:text-white transition-all"
          >
            Create Your Account
          </button>
      </section>
    </main>
  );
}