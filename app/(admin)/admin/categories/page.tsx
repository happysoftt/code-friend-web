import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, FolderTree, Package, FileText, Folder } from "lucide-react";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams || {};

  // ดึงข้อมูลหมวดหมู่ พร้อมนับจำนวนสินค้าและบทความที่เกี่ยวข้อง
  const categories = await prisma.category.findMany({
    where: {
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {})
    },
    include: {
        _count: {
            select: { products: true, articles: true } // นับจำนวน Relation (ต้องมีใน Schema)
        }
    },
    orderBy: { name: 'asc' }
  });

  // Server Action สำหรับลบหมวดหมู่
  async function deleteAction(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    if (id) {
        try {
            await prisma.category.delete({ where: { id } });
            revalidatePath("/admin/categories");
        } catch (error) {
            console.error("Delete failed:", error);
            // ในสถานการณ์จริงอาจต้องส่ง Error กลับไปแสดงผล (เช่น ติด Relation อยู่ลบไม่ได้)
        }
    }
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight flex items-center gap-3">
                <FolderTree className="text-amber-500" /> จัดการหมวดหมู่
            </h1>
            <p className="text-slate-400">จัดกลุ่มสินค้าและบทความเพื่อให้ผู้ใช้ค้นหาได้ง่ายขึ้น ({categories.length} รายการ)</p>
        </div>
        <Link href="/admin/categories/create" className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-amber-900/20 transition-all active:scale-95">
            <Plus size={20} /> เพิ่มหมวดหมู่ใหม่
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาหมวดหมู่..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600" 
                />
            </form>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-[40%]">ชื่อหมวดหมู่</th>
                <th className="px-6 py-4 w-[20%]">Slug</th>
                <th className="px-6 py-4 w-[15%] text-center">สินค้าในหมวด</th>
                <th className="px-6 py-4 w-[15%] text-center">บทความในหมวด</th>
                <th className="px-6 py-4 w-[10%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Name */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                            <Folder size={20} />
                        </div>
                        <span className="font-bold text-white text-base">{category.name}</span>
                    </div>
                  </td>

                  {/* Slug */}
                  <td className="px-6 py-4 align-middle">
                    <span className="font-mono text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        /{category.slug}
                    </span>
                  </td>

                  {/* Product Count */}
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                        <Package size={14} /> {category._count?.products || 0}
                    </div>
                  </td>

                  {/* Article Count */}
                  <td className="px-6 py-4 text-center align-middle">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                        <FileText size={14} /> {category._count?.articles || 0}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/categories/${category.id}`} className="p-2 bg-slate-800 hover:bg-amber-600 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-700 hover:border-amber-500" title="แก้ไข">
                            <Edit size={16} />
                        </Link>
                        
                        <form action={deleteAction}>
                            <input type="hidden" name="id" value={category.id} />
                            <button 
                                type="submit" 
                                className="p-2 bg-slate-800 hover:bg-red-600 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-700 hover:border-red-500" 
                                title="ลบ" 
                                // เพิ่ม confirm กันพลาด
                                // onClick={(e) => { if(!confirm('ยืนยันการลบ? หากมีสินค้าผูกอยู่ อาจเกิดข้อผิดพลาด')) e.preventDefault() }} 
                            >
                                <Trash2 size={16} />
                            </button>
                        </form>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center py-20">
                        <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-800 mb-4">
                            <FolderTree className="text-slate-600" size={32} />
                        </div>
                        <p className="text-slate-500 font-medium">ไม่พบหมวดหมู่</p>
                        <p className="text-slate-600 text-xs mt-1">เริ่มสร้างโครงสร้างสินค้าของคุณได้เลย</p>
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