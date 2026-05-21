import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="w-full flex flex-col">
      {/* Top Black Bar */}
      <div className="bg-[#0F0F0F] text-center py-5 rounded-b-[2rem] mx-2 md:mx-4 border-b-8 border-x-8 border-black shadow-[0_5px_0_rgba(0,0,0,1)] relative z-20">
        <Link href="/" className="inline-block hover:scale-105 transition-transform">
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-wider">
            <span className="text-white">Raw</span><span className="text-yellow-400">Wire</span>
          </h1>
        </Link>
        {/* Admin Link */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
           <Link href="/admin/dashboard" className="text-gray-400 hover:text-white text-sm md:text-lg font-bold tracking-widest uppercase underline">
             Admin
           </Link>
        </div>
      </div>
      
      {/* Cyan Stripe with Category Pills */}
      <div className="bg-cyan-200 w-full py-5 px-4 border-b-[5px] border-black relative z-10 -mt-6 pt-10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-3 md:gap-5 pt-2">
          <Pill color="bg-cyan-400">World</Pill>
          <Pill color="bg-[#FF1CE2] text-white">Politics</Pill>
          <Pill color="bg-lime-400">Tech</Pill>
          <Pill color="bg-[#FF1CE2] text-white">Pops</Pill>
          <Pill color="bg-emerald-300">Anime</Pill>
          <button className="neo-pill bg-yellow-400 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl border-[3px]">
             🔍
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({ children, color }: { children: React.ReactNode, color: string }) {
  return (
    <button className={`neo-pill ${color} px-5 md:px-8 py-2 md:py-3 text-lg md:text-2xl tracking-wide border-[4px]`}>
      {children}
    </button>
  );
}
