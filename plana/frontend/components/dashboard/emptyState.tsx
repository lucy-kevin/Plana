export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 border border-border">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="text-xl font-serif text-foreground">No plans yet</h3>
      <p className="text-body mt-2 mb-8">Start your first boutique event planning journey.</p>
      <button className="bg-button-bg text-white px-8 py-4 rounded-2xl font-bold">Create New Plan</button>
    </div>
  );
}
