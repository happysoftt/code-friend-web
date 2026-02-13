import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Search, ShoppingBag, PackageX, DollarSign, Package, Eye, Download, Calendar } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton"; 

export const dynamic = 'force-dynamic';

export default async function AdminStorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  // รับค่า query string สำหรับค้นหา
  const { q } = await searchParams || {};

  // ดึงข้อมูลสินค้า
  const products = await prisma.product.findMany({
    where: q ? {
        OR: [
            // ✅ แก้ไขจุดที่ 1: เปลี่ยน name เป็น title ในการค้นหา
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
        ]
    } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } }
  });

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingBag className="text-emerald-500" /> จัดการร้านค้า
            </h1>
            <p className="text-slate-400">รายการสินค้าดิจิทัลทั้งหมด ({products.length} รายการ)</p>
        </div>
        <Link href="/admin/store/create" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all active:scale-95">
            <Plus size={20} /> ลงสินค้าใหม่
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        
        {/* Toolbar */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Form */}
            <form className="relative w-full max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                <input 
                    name="q"
                    defaultValue={q}
                    placeholder="ค้นหาชื่อสินค้า, รายละเอียด..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500 transition-all placeholder-slate-600" 
                />
            </form>

            {/* Filter Buttons */}
            <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-colors">
                    ทั้งหมด
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-800">
                <th className="px-6 py-4 w-[45%]">สินค้า & สถิติ</th>
                <th className="px-6 py-4 w-[15%] text-right">ราคา</th>
                <th className="px-6 py-4 w-[10%] text-center">สถานะ</th>
                <th className="px-6 py-4 w-[15%] text-right">ยอดสั่งซื้อ</th>
                <th className="px-6 py-4 w-[15%] text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-800/30 transition-colors group">
                  
                  {/* Product Info & Stats */}
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden relative flex-shrink-0 border border-slate-700 group-hover:border-emerald-500/50 transition-colors mt-1">
                             {product.image ? (
                                <Image src={product.image} alt={product.title} fill className="object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950"><Package size={20} /></div>
                             )}
                        </div>
                        <div className="min-w-0 flex flex-col gap-1.5">
                            {/* ✅ แก้ไขจุดที่ 2: เปลี่ยน product.name เป็น product.title */}
                            <p className="font-bold text-white text-base truncate max-w-[350px] group-hover:text-emerald-400 transition-colors">{product.title}</p>
                            
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded-md">
                                    <Eye size={12} className="text-blue-400" /> {product.viewCount.toLocaleString()}
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] bg-slate-950 border border-slate-800 text-slate-400 px-2 py-1 rounded-md">
                                    <Download size={12} className="text-purple-400" /> {product.downloadCount.toLocaleString()}
                                </span>
                                <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 ml-1">
                                    <Calendar size={10} /> {new Date(product.createdAt).toLocaleDateString('th-TH')}
                                </span>
                            </div>
                        </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-right align-middle">
                    {product.isFree || Number(product.price) === 0 ? (
                        <span className="font-bold text-emerald-400 text-xs bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">FREE</span>
                    ) : (
                        <span className="font-mono text-white font-bold text-base">฿{Number(product.price).toLocaleString()}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 text-center align-middle">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm shadow-emerald-900/10">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Active
                      </span>
                  </td>

                  {/* Sales (Orders Count) */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="inline-flex items-center gap-1.5 text-slate-300 font-mono font-bold bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                        <DollarSign size={14} className="text-emerald-500" /> {product._count?.orders || 0}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link 
                            href={`/admin/store/${product.id}`} // ลิงก์ไปหน้าแก้ไข (หรือใช้ /edit ก็ได้แล้วแต่ Route)
                            className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg text-slate-400 transition-all border border-slate-700 hover:border-blue-500 shadow-sm" 
                            title="แก้ไข"
                        >
                            <Edit size={16} />
                        </Link>

                        <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}

              {products.length === 0 && (
                 <tr>
                    <td colSpan={5} className="text-center py-24">
                        <div className="inline-flex p-6 rounded-full bg-slate-900/50 border border-slate-800 mb-4 animate-in fade-in zoom-in duration-500">
                            <PackageX className="text-slate-600" size={48} />
                        </div>
                        <h3 className="text-white font-bold text-lg">ไม่พบสินค้า</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            {q ? `ไม่พบผลการค้นหาสำหรับ "${q}"` : "ยังไม่มีสินค้าในร้านค้าของคุณ เริ่มต้นด้วยการลงสินค้าชิ้นแรก"}
                        </p>
                        {!q && (
                            <Link href="/admin/store/create" className="inline-flex mt-6 items-center text-emerald-400 hover:text-emerald-300 font-bold text-sm">
                                <Plus size={16} className="mr-1" /> สร้างสินค้าใหม่
                            </Link>
                        )}
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