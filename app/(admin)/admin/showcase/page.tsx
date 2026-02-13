import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { ExternalLink, Award, Search, Filter } from "lucide-react";
import Link from "next/link";
import ShowcaseActions from "@/components/admin/ShowcaseActions"; // Import ปุ่มที่สร้าง

export const dynamic = 'force-dynamic';

export default async function AdminShowcasePage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const { status, q } = await searchParams || {};

  // สร้างเงื่อนไขค้นหา
  const whereCondition: any = {};

  if (status === "PENDING") whereCondition.approved = false;
  if (status === "APPROVED") whereCondition.approved = true;

  if (q) {
    whereCondition.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } }
    ];
  }

  const showcases = await prisma.showcase.findMany({
    where: whereCondition,
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Award className="text-yellow-500" /> อนุมัติผลงาน (Showcase)
            </h1>
            <p className="text-slate-400">ตรวจสอบผลงานที่สมาชิกส่งเข้ามา ({showcases.length} รายการ)</p>
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
                        href={`/admin/showcase?status=${tab.value}${q ? `&q=${q}` : ''}`} 
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาชื่อผลงาน, ชื่อผู้ใช้..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-yellow-500 transition-all placeholder-slate-600 text-sm" 
                />
                {status && <input type="hidden" name="status" value={status} />}
            </form>
      </div>

      {/* Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
         {showcases.map((item) => (
             <div key={item.id} className={`group bg-slate-900 border rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl ${item.approved ? 'border-slate-800 hover:border-slate-700' : 'border-yellow-500/30 shadow-yellow-900/10'}`}>
                 
                 {/* Image */}
                 <div className="relative aspect-video w-full bg-slate-800 overflow-hidden">
                     {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600"><Award size={32} /></div>
                     )}
                     
                     {/* Status Badge */}
                     <div className="absolute top-3 right-3">
                        {item.approved ? (
                            <span className="text-[10px] font-bold bg-emerald-500/90 text-white px-2 py-1 rounded shadow-lg backdrop-blur-sm">APPROVED</span>
                        ) : (
                            <span className="text-[10px] font-bold bg-yellow-500/90 text-black px-2 py-1 rounded shadow-lg backdrop-blur-sm animate-pulse">PENDING</span>
                        )}
                     </div>
                 </div>
                 
                 {/* Content */}
                 <div className="p-5 flex-1 flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-white text-lg truncate pr-2 group-hover:text-yellow-500 transition-colors">{item.title}</h3>
                     </div>
                     
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-5 h-5 rounded-full bg-slate-700 overflow-hidden relative">
                             <Image 
                                src={item.user.image || `https://ui-avatars.com/api/?name=${item.user.name}`} 
                                alt="User" fill className="object-cover" 
                             />
                        </div>
                        <span className="text-xs text-slate-400 font-medium">{item.user.name}</span>
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-slate-800 flex justify-between items-center">
                         {item.demoUrl ? (
                            <a href={item.demoUrl} target="_blank" className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded-md">
                                <ExternalLink size={12}/> Live Demo
                            </a>
                         ) : (
                            <span className="text-xs text-slate-600 italic">No Demo Link</span>
                         )}

                         {/* Actions (Client Component) */}
                         <ShowcaseActions id={item.id} isApproved={item.approved} />
                     </div>
                 </div>
             </div>
         ))}
      </div>
      
      {showcases.length === 0 && (
            <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl">
                <div className="inline-flex p-4 rounded-full bg-slate-950 border border-slate-800 mb-4">
                    <Award className="text-slate-600" size={32} />
                </div>
                <p className="text-slate-500 font-medium">ไม่พบผลงาน</p>
                <p className="text-slate-600 text-xs mt-1">ยังไม่มีใครส่งผลงานเข้ามา หรือค้นหาไม่เจอ</p>
            </div>
      )}

    </div>
  );
}