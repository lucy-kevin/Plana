export default function QuotesPage() {
  return (
    <main className="max-w-2xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-serif mb-10">Your Quotes</h1>
      <div className="bg-surface p-8 rounded-3xl border border-border">
        <p className="text-body">You haven't requested any quotes yet.</p>
        <a href="/providers" className="text-primary font-bold block mt-4">Browse providers →</a>
      </div>
    </main>
  );
}
