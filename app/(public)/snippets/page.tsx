import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Code2, Plus, Calendar, FileCode, Search, Terminal, Zap } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SnippetsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  const snippets = await prisma.snippet.findMany({
    where: { 
        isPublic: true, 
        approved: true,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { author: true }
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-green-500/30 font-sans pb-24">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[400px] bg-green-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-green-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-green-900/10">
                 <Terminal size={14} /> Developer Tools
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse">Snippets</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 คลังโค้ดสั้นพร้อมใช้ ช่วยลดเวลาเขียนโค้ดซ้ำๆ <br className="hidden md:block"/> ค้นหา ก๊อปปี้ และนำไปใช้ได้ทันที
            </p>

            {/* Search & Action */}
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-4">
                <form className="flex-1 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-1 pl-4 shadow-2xl transition-all focus-within:border-green-500/50">
                        <Search className="text-slate-500 mr-2" size={20} />
                        <input 
                            name="q"
                            defaultValue={q}
                            placeholder="ค้นหาโค้ด..." 
                            className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 py-2"
                        />
                        <button type="submit" className="bg-slate-800 hover:bg-green-600 text-white p-2 rounded-full transition-all ml-2">
                            <Search size={18} />
                        </button>
                    </div>
                </form>
                <Link href="/snippets/new" className="px-6 py-3 bg-white text-slate-950 rounded-full font-bold hover:bg-slate-200 transition-all shadow-lg shadow-white/10 active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap">
                     <Plus size={20} /> แชร์โค้ด
                </Link>
            </div>
          </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container mx-auto px-4">
        
        {/* Language Filter (Mockup) */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {["All", "JavaScript", "TypeScript", "Python", "React", "CSS", "SQL"].map((lang, i) => (
                <button key={i} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    i === 0 
                    ? "bg-green-600 text-white border-green-500" 
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-green-500/50"
                }`}>
                    {lang}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {snippets.map((item) => (
                <Link key={item.id} href={`/snippets/${item.slug}`} className="group bg-slate-900/50 border border-slate-800 rounded-3xl p-6 hover:border-green-500/50 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-300 backdrop-blur-sm flex flex-col relative overflow-hidden">
                    
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-16 bg-green-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-colors" />

                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-3 bg-slate-800/80 backdrop-blur rounded-2xl text-green-400 group-hover:text-white group-hover:bg-green-600 transition-colors border border-slate-700/50 group-hover:border-green-500">
                            <Code2 size={24} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/50 px-2 py-1 rounded-lg border border-slate-800 uppercase tracking-wider group-hover:border-green-500/30 transition-colors">
                            {item.language}
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors line-clamp-1">{item.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 h-10 leading-relaxed">{item.description || "ไม่มีคำอธิบายเพิ่มเติม"}</p>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800/50 mt-auto relative z-10">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 group-hover:border-green-500/50 transition-colors">
                           <Image 
                            src={item.author.image || `https://ui-avatars.com/api/?name=${item.author.name}&background=random`} 
                            alt="Author" 
                            fill 
                            className="object-cover" 
                        />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-white font-bold group-hover:text-green-300 transition-colors">{item.author.name}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString("th-TH")}
                            </span>
                        </div>
                        
                        <div className="ml-auto text-slate-600 group-hover:text-green-500 transition-colors">
                            <Zap size={16} className="group-hover:fill-current" />
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {snippets.length === 0 && (
            <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-700 mb-4">
                    <FileCode className="text-slate-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">ไม่พบโค้ดที่คุณค้นหา</h3>
                <p className="text-slate-500 mt-2">ลองเปลี่ยนคำค้นหา หรือเป็นคนแรกที่แชร์โค้ดนี้!</p>
                {q && <Link href="/snippets" className="inline-block mt-6 text-green-400 hover:underline">ล้างคำค้นหา</Link>}
            </div>
        )}

      </div>
    </div>
  );
}