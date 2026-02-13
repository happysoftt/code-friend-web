import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, BookOpen, Layers, Edit, GraduationCap } from "lucide-react";
import { revalidatePath } from "next/cache";
import DeleteButton from "@/components/admin/DeleteButton"; // ✅ เรียกใช้ปุ่มลบที่เป็น Client Component

export const dynamic = 'force-dynamic';

export default async function AdminLearnPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  // 1. ดึงข้อมูลคอร์สเรียน (รองรับการค้นหา)
  const paths = await prisma.learningPath.findMany({
    where: {
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { lessons: true } } }
  });

  // 2. Server Action สำหรับลบคอร์ส
  async function deleteAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
        try {
            await prisma.learningPath.delete({ where: { id } });
            revalidatePath("/admin/learn");
        } catch (error) {
            console.error("Delete failed:", error);
        }
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                <GraduationCap className="text-purple-500" /> จัดการคอร์สเรียน
            </h1>
            <p className="text-slate-400">สร้างและจัดการเส้นทางการเรียนรู้ ({paths.length} คอร์ส)</p>
        </div>
        <Link href="/admin/learn/create" className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-900/20 transition-all active:scale-95">
            <Plus size={20} /> สร้างคอร์สใหม่
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาคอร์สเรียน..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500 transition-all placeholder-slate-600" 
                />
            </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-[45%]">ชื่อคอร์ส (Learning Path)</th>
                <th className="px-6 py-4 w-[15%] text-center">บทเรียน</th>
                <th className="px-6 py-4 w-[15%] text-center">สถานะ</th>
                <th className="px-6 py-4 w-[25%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {paths.map((path) => (
                <tr key={path.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Title Info */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                             <BookOpen size={24} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-white text-base mb-0.5 truncate max-w-[300px] group-hover:text-purple-400 transition-colors">{path.title}</p>
                            <p className="text-xs text-slate-500 font-mono truncate max-w-[300px]">/{path.slug}</p>
                        </div>
                    </div>
                  </td>

                  {/* Lesson Count */}
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-mono font-bold">
                        <Layers size={14} className="text-purple-500" /> {path._count?.lessons || 0}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center align-middle">
                    {path.published ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span> Published
                        </span>
                    ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                            Hidden
                        </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        
                        {/* ปุ่มจัดการบทเรียน (Main Action) */}
                        <Link href={`/admin/learn/${path.id}`} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-purple-900/20 flex items-center gap-2">
                            <Layers size={14} /> จัดการบทเรียน
                        </Link>

                        {/* ปุ่มแก้ไขข้อมูลคอร์ส */}
                        <Link href={`/admin/learn/${path.id}/edit`} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-all border border-slate-700" title="แก้ไขข้อมูลคอร์ส">
                            <Edit size={16} />
                        </Link>
                        
                        {/* ปุ่มลบ (ใช้ Client Component DeleteButton) */}
                        <form action={deleteAction}>
                            <input type="hidden" name="id" value={path.id} />
                            <DeleteButton /> 
                        </form>
                    </div>
                  </td>
                </tr>
              ))}

              {paths.length === 0 && (
                 <tr>
                    <td colSpan={4} className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                            <BookOpen className="text-slate-600" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">ไม่พบคอร์สเรียน</p>
                        <p className="text-slate-600 text-xs mt-1">เริ่มสร้างคอร์สเรียนใหม่เพื่อแบ่งปันความรู้</p>
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