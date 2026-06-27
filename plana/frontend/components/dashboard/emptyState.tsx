export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-6 border border-[#EBE7E0]">
        <span className="text-3xl">✨</span>
      </div>
      <h3 className="text-xl font-serif text-[#2D2926]">No plans yet</h3>
      <p className="text-[#7D766D] mt-2 mb-8">Start your first boutique event planning journey.</p>
      <button className="bg-[#2D2926] text-white px-8 py-4 rounded-2xl font-bold">Create New Plan</button>
    </div>
  );
}