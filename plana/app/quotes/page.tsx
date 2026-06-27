// app/quotes/page.tsx
export default function QuotesPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-serif mb-10">Your Quotes</h1>
      <div className="bg-white p-8 rounded-3xl border border-[#EBE7E0]">
        <p className="text-[#7D766D]">You haven't requested any quotes yet.</p>
        <a href="/providers" className="text-[#4F46E5] font-bold block mt-4">Browse providers →</a>
      </div>
    </main>
  );
}