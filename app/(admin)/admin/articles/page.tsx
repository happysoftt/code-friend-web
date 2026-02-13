import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Search, FileText, Eye, Calendar } from "lucide-react";
import DeleteButton from "./DeleteButton"; // นำเข้าปุ่มลบที่เราแยกไว้

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // รอรับค่า searchParams
  const resolvedSearchParams = await searchParams;
  const q = resolvedSearchParams?.q || "";

  // ดึงบทความ (รองรับการค้นหา)
  const articles = await prisma.article.findMany({
    where: {
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { author: true } 
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">จัดการบทความ</h1>
            <p className="text-slate-400">บทความทั้งหมด ({articles.length} รายการ)</p>
        </div>
        <Link href="/admin/articles/create" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95">
            <Plus size={20} /> เขียนบทความใหม่
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Bar */}
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาบทความ..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-slate-600" 
                />
            </form>

            {/* Filters (Mockup) */}
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                    ทั้งหมด
                </button>
                <button className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                    เผยแพร่แล้ว
                </button>
                <button className="px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                    ฉบับร่าง
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-[40%]">บทความ</th>
                <th className="px-6 py-4 w-[15%]">ผู้เขียน</th>
                <th className="px-6 py-4 w-[15%] text-center">สถานะ</th>
                <th className="px-6 py-4 w-[15%] text-right">วันที่สร้าง</th>
                <th className="px-6 py-4 w-[15%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Article Info */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-10 bg-slate-800 rounded-lg overflow-hidden relative flex-shrink-0 border border-slate-700 group-hover:border-purple-500/50 transition-colors">
                             {article.coverImage ? (
                                <Image src={article.coverImage} alt={article.title} fill className="object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950"><FileText size={16} /></div>
                             )}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white text-sm mb-0.5 truncate max-w-[300px] group-hover:text-purple-400 transition-colors">{article.title}</p>
                            <p className="text-xs text-slate-500 truncate max-w-[300px]">{article.excerpt || "ไม่มีคำโปรย"}</p>
                        </div>
                    </div>
                  </td>

                  {/* Author */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 overflow-hidden relative">
                             <Image 
                                src={article.author.image || `https://ui-avatars.com/api/?name=${article.author.name}`} 
                                alt="Author" fill className="object-cover" 
                             />
                        </div>
                        <span className="text-slate-300 text-xs font-medium">{article.author.name}</span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center align-middle">
                    {article.published ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                            Draft
                        </span>
                    )}
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-right align-middle text-slate-500 font-mono text-xs">
                      <div className="flex items-center justify-end gap-1">
                        <Calendar size={12} /> {new Date(article.createdAt).toLocaleDateString('en-GB')}
                      </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/articles/${article.slug}`} target="_blank" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="ดูตัวอย่าง">
                            <Eye size={16} />
                        </Link>
                        
                        <Link href={`/admin/articles/${article.id}`} className="p-2 bg-slate-800 hover:bg-purple-600 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-700 hover:border-purple-500" title="แก้ไข">
                            <Edit size={16} />
                        </Link>
                        
                        {/* ใช้ Component ปุ่มลบที่แยกออกมา */}
                        <DeleteButton id={article.id} />
                        
                    </div>
                  </td>
                </tr>
              ))}

              {articles.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                            <FileText className="text-slate-600" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">ไม่พบบทความ</p>
                        <p className="text-slate-600 text-xs mt-1">ลองเปลี่ยนคำค้นหา หรือเริ่มเขียนบทความใหม่</p>
                    </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}