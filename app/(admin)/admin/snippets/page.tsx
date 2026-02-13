import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Code2, Search, FileCode } from "lucide-react";
import SnippetActions from "@/components/admin/SnippetActions"; 

export const dynamic = 'force-dynamic';

export default async function AdminSnippetPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const { status, q } = await searchParams || {};

  // สร้างเงื่อนไขค้นหา
  const whereCondition: any = {};

  if (status === "PENDING") whereCondition.approved = false;
  if (status === "APPROVED") whereCondition.approved = true;

  if (q) {
    whereCondition.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { name: { contains: q, mode: 'insensitive' } } }
    ];
  }

  // ✅ แก้ไขจุดที่ 1: ดึง versions ล่าสุดมาด้วย
  const snippets = await prisma.snippet.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: { 
        author: true,
        versions: { // สั่งให้ดึง Version ล่าสุดออกมา 1 อัน
            orderBy: { createdAt: 'desc' },
            take: 1
        }
    } 
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Code2 className="text-blue-500" /> อนุมัติโค้ด (Snippets)
            </h1>
            <p className="text-slate-400">ตรวจสอบ Snippet โค้ดที่สมาชิกแบ่งปัน ({snippets.length} รายการ)</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-5 mb-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col xl:flex-row gap-4 justify-between items-center shadow-lg">
            
            {/* Filter Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
                {[
                    { label: "ทั้งหมด", value: "ALL" },
                    { label: "⏳ รอตรวจสอบ", value: "PENDING" },
                    { label: "✅ อนุมัติแล้ว", value: "APPROVED" },
                ].map((tab) => (
                    <Link 
                        key={tab.value} 
                        href={`/admin/snippets?status=${tab.value}${q ? `&q=${q}` : ''}`} 
                        className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                            (!status && tab.value === 'ALL') || status === tab.value 
                            ? 'bg-slate-800 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                        }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {/* Search Bar */}
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาชื่อ Snippet, ผู้เขียน..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-slate-600 text-sm" 
                />
                {status && <input type="hidden" name="status" value={status} />}
            </form>
      </div>

      {/* Snippet Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
         {snippets.map((item) => (
             <div key={item.id} className={`group bg-slate-900 border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-xl ${item.approved ? 'border-slate-800 hover:border-slate-700' : 'border-yellow-500/30 shadow-yellow-900/10'}`}>
                 
                 {/* Header Info */}
                 <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3 min-w-0">
                         <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700 flex-shrink-0">
                            {item.author.image ? (
                                <Image src={item.author.image} alt="Author" fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-xs font-bold">{item.author.name?.charAt(0)}</div>
                            )}
                         </div>
                         <div className="min-w-0">
                             <h3 className="font-bold text-white truncate text-base group-hover:text-blue-400 transition-colors" title={item.title}>{item.title}</h3>
                             <p className="text-xs text-slate-500 truncate">{item.author.name}</p>
                         </div>
                     </div>
                     <div className="flex-shrink-0 ml-2">
                        {item.approved ? (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 font-bold">APPROVED</span>
                        ) : (
                            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20 font-bold animate-pulse">PENDING</span>
                        )}
                     </div>
                 </div>

                 {/* Code Preview (Mockup) */}
                 <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative group/code">
                     <div className="absolute top-2 right-2 text-[10px] text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-800 font-mono">
                        {item.language || "text"}
                     </div>
                     <pre className="text-xs text-slate-400 font-mono line-clamp-4 overflow-hidden leading-relaxed opacity-80">
                         {/* ✅ แก้ไขจุดที่ 2: ดึง code จาก versions ตัวแรกแทน content */}
                         {item.versions[0]?.code || "// No code content available..."}
                     </pre>
                     <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-950 to-transparent"></div>
                 </div>
                 
                 {/* Footer & Actions */}
                 <div className="flex justify-between items-center mt-auto pt-2">
                     <Link href={`/snippets/${item.slug}`} target="_blank" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors">
                         <FileCode size={14}/> ดูโค้ดเต็ม
                     </Link>

                     {/* Actions (Client Component) */}
                     <SnippetActions id={item.id} isApproved={item.approved} />
                 </div>
             </div>
         ))}
      </div>
      
      {snippets.length === 0 && (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
                <div className="inline-flex p-4 rounded-full bg-slate-950 border border-slate-800 mb-4">
                    <Code2 className="text-slate-600" size={32} />
                </div>
                <p className="text-slate-500 font-medium">ไม่พบ Snippet</p>
                <p className="text-slate-600 text-xs mt-1">ยังไม่มีใครแชร์โค้ด หรือค้นหาไม่เจอ</p>
            </div>
      )}

    </div>
  );
}