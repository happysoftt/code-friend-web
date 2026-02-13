import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Github, ExternalLink, Heart, Sparkles, Zap, Search, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ShowcasePage() {
  const showcases = await prisma.showcase.findMany({
    where: { approved: true }, 
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-yellow-500/30 font-sans pb-24">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-indigo-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-indigo-900/10">
                 <Zap size={14} /> Community Projects
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 Showcase <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 animate-pulse">Gallery</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 พื้นที่ปล่อยของสำหรับนักพัฒนา ร่วมชมผลงานสุดเจ๋ง แลกเปลี่ยนไอเดีย <br className="hidden md:block"/> และสร้างแรงบันดาลใจไปด้วยกัน
            </p>

            <div className="flex justify-center gap-4">
                <Link href="/showcase/submit" className="px-8 py-3 bg-white text-slate-950 rounded-full font-bold text-lg hover:bg-slate-200 transition-all shadow-lg shadow-white/10 active:scale-95 flex items-center gap-2">
                    <Plus size={20} /> ส่งผลงานของคุณ
                </Link>
            </div>
          </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container mx-auto px-4">
        
        {/* Filters (Mockup) */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            {["All Projects", "Web App", "Mobile App", "AI/ML", "Game", "Library"].map((tag, i) => (
                <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    i === 0 
                    ? "bg-indigo-600 text-white border-indigo-500" 
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-indigo-500/50"
                }`}>
                    {tag}
                </button>
            ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {showcases.map((item) => (
                // ✅ เปลี่ยนเป็น div (relative) เพื่อให้เป็น Container หลัก
                <div 
                    key={item.id} 
                    className="group relative bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-900/20 transition-all duration-300 flex flex-col backdrop-blur-sm"
                >
                    {/* ✅ ลิงก์หลัก (Main Link) - ใช้ absolute inset-0 เพื่อคลุมทั้งการ์ด */}
                    <Link href={`/showcase/${item.id}`} className="absolute inset-0 z-0" />
                    
                    {/* Image */}
                    <div className="relative h-52 bg-slate-800 overflow-hidden z-10 pointer-events-none">
                        {item.image ? (
                            <Image 
                                src={item.image} 
                                alt={item.title} 
                                fill 
                                className="object-cover group-hover:scale-110 transition-transform duration-700" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                                <Sparkles size={48} opacity={0.3} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                    </div>
                    
                    {/* ✅ Interactive Buttons (ต้องใส่ z-20 และ pointer-events-auto เพื่อให้กดได้) */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-auto">
                            {item.githubUrl && (
                                <a href={item.githubUrl} target="_blank" className="p-2 bg-slate-900/80 backdrop-blur rounded-full text-white hover:bg-indigo-600 transition-colors block" title="View Source">
                                    <Github size={18} />
                                </a>
                            )}
                            {item.demoUrl && (
                                <a href={item.demoUrl} target="_blank" className="p-2 bg-slate-900/80 backdrop-blur rounded-full text-white hover:bg-indigo-600 transition-colors block" title="Live Demo">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col relative z-10 pointer-events-none">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                            {item.title}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1 h-10 leading-relaxed">
                            {item.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                                    <Image 
                                        src={item.user.image || `https://ui-avatars.com/api/?name=${item.user.name}&background=random`} 
                                        alt={item.user.name || "User"} 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white leading-none mb-0.5">{item.user.name}</span>
                                    <span className="text-[10px] text-slate-500">Author</span>
                                </div>
                            </div>
                            
                            {/* ปุ่มดูรายละเอียด */}
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                                ดูรายละเอียด <ArrowRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {showcases.length === 0 && (
            <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-700 mb-4">
                    <Sparkles className="text-slate-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">ยังไม่มีผลงาน</h3>
                <p className="text-slate-500 mt-2">มาเป็นคนแรกที่โชว์ผลงานให้โลกเห็น!</p>
                <Link href="/showcase/submit" className="inline-block mt-6 text-indigo-400 hover:underline">ส่งผลงานเลย</Link>
            </div>
        )}

      </div>
    </div>
  );
}