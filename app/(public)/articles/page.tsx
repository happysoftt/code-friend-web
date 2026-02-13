import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Calendar, User, ArrowRight, Search, Hash, BookOpen, Clock, Tag } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  // ดึงบทความ (พร้อมรองรับการค้นหา)
  const articles = await prisma.article.findMany({
    where: { 
        published: true,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { author: true, category: true } // *แก้ include category ตาม schema จริง
  });

  // แยกบทความล่าสุดออกมาเป็น Featured (ถ้ามีบทความมากกว่า 0)
  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 0 ? articles.slice(1) : [];

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-pink-500/30 font-sans">
      
      {/* --- HERO HEADER --- */}
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-pink-300 text-xs font-bold mb-6 backdrop-blur-md">
                 <BookOpen size={14} /> Knowledge Hub
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 บทความ & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">สาระน่ารู้</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 อัปเดตเทคนิคการเขียนโค้ด ข่าวสารวงการไอที และเรื่องราวสร้างแรงบันดาลใจ <br className="hidden md:block"/> สำหรับนักพัฒนาทุกคน
            </p>

            {/* Search Bar */}
            <form className="max-w-xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 pl-6 shadow-2xl transition-all focus-within:border-pink-500/50">
                    <Search className="text-slate-500" size={20} />
                    <input 
                        name="q"
                        defaultValue={q}
                        placeholder="ค้นหาบทความที่คุณสนใจ..." 
                        className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 px-4 py-2"
                    />
                    <button type="submit" className="bg-slate-800 hover:bg-pink-600 text-white p-2.5 rounded-full transition-all">
                        <ArrowRight size={18} />
                    </button>
                </div>
            </form>
          </div>
      </div>

      <div className="container mx-auto px-4 pb-24">
        
        {/* --- TAGS / CATEGORIES (Mockup) --- */}
        <div className="flex flex-wrap justify-center gap-2 mb-16">
            {["ทั้งหมด", "Web Development", "Frontend", "Backend", "Tips & Tricks", "Career"].map((tag, i) => (
                <button key={i} className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                    i === 0 
                    ? "bg-white text-slate-900 border-white" 
                    : "bg-slate-900/50 text-slate-400 border-slate-800 hover:border-pink-500/50 hover:text-white"
                }`}>
                    {tag}
                </button>
            ))}
        </div>

        {/* --- FEATURED ARTICLE --- */}
        {!q && featuredArticle && (
            <div className="mb-16">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Tag className="text-pink-500" /> เรื่องเด่นวันนี้</h2>
                <Link href={`/articles/${featuredArticle.slug}`} className="group relative grid grid-cols-1 md:grid-cols-2 gap-0 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-pink-500/50 transition-all shadow-2xl shadow-black/50">
                    <div className="relative h-64 md:h-auto overflow-hidden">
                        {featuredArticle.coverImage ? (
                            <Image src={featuredArticle.coverImage} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-600">No Image</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:hidden" />
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center relative">
                        <div className="absolute top-0 right-0 p-32 bg-pink-500/5 rounded-full blur-3xl" />
                        
                        <div className="flex items-center gap-3 text-xs font-bold text-pink-400 mb-4 relative z-10">
                            <span className="bg-pink-500/10 border border-pink-500/20 px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
                            <span className="flex items-center gap-1 text-slate-500"><Clock size={14} /> 5 min read</span>
                        </div>
                        
                        <h3 className="text-2xl md:text-4xl font-black text-white mb-4 leading-tight group-hover:text-pink-400 transition-colors relative z-10">
                            {featuredArticle.title}
                        </h3>
                        
                        <p className="text-slate-400 text-lg mb-8 line-clamp-3 relative z-10">
                             {featuredArticle.excerpt || "คลิกเพื่ออ่านบทความฉบับเต็ม..."}
                        </p>
                        
                        <div className="flex items-center justify-between mt-auto relative z-10">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700">
                                     {featuredArticle.author.image && <Image src={featuredArticle.author.image} alt="" fill className="object-cover" />}
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold text-white">{featuredArticle.author.name}</p>
                                     <p className="text-xs text-slate-500">{new Date(featuredArticle.createdAt).toLocaleDateString()}</p>
                                 </div>
                             </div>
                             <span className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <ArrowRight size={20} />
                             </span>
                        </div>
                    </div>
                </Link>
            </div>
        )}

        {/* --- ARTICLE LIST --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(q ? articles : otherArticles).map((article) => (
                <Link key={article.id} href={`/articles/${article.slug}`} className="group bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-900/10 transition-all duration-300 flex flex-col backdrop-blur-sm">
                    {/* Cover Image */}
                    <div className="h-52 bg-slate-800 relative overflow-hidden">
                        {article.coverImage ? (
                            <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                                <Hash size={32} opacity={0.2} />
                            </div>
                        )}
                        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white border border-white/10 shadow-lg">
                            {article.category?.name || "General"}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString('th-TH')}</span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors line-clamp-2">
                            {article.title}
                        </h3>
                        
                        <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
                            {article.excerpt || "อ่านต่อ..."}
                        </p>

                        <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden relative">
                                    {article.author.image && <Image src={article.author.image} alt="" fill className="object-cover" />}
                                </div>
                                <span className="text-xs text-slate-400 font-medium truncate max-w-[100px]">{article.author.name}</span>
                            </div>
                            <span className="text-pink-500 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                อ่านต่อ <ArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

        {articles.length === 0 && (
            <div className="text-center py-32">
                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-dashed border-slate-700 mb-4">
                    <Search className="text-slate-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">ไม่พบบทความ</h3>
                <p className="text-slate-500 mt-2">ลองค้นหาด้วยคำสำคัญอื่น หรือกลับมาดูใหม่ภายหลัง</p>
                {q && <Link href="/articles" className="inline-block mt-6 text-pink-400 hover:underline">ล้างคำค้นหา</Link>}
            </div>
        )}

      </div>
    </div>
  );
}