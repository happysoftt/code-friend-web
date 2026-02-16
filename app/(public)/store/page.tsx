import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, ShoppingCart, Tag, Filter, Sparkles, Check, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export default async function StorePage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams || {};
  const session = await getServerSession(authOptions);
  
  let purchasedProductIds = new Set<string>();
  
  if (session) {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      select: { productId: true }
    });
    purchasedProductIds = new Set(orders.map(o => o.productId));
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      ...(category ? { category: { name: category } } : {})
    },
    orderBy: { createdAt: "desc" },
    include: {
        category: true
    }
  });

  const categories = await prisma.category.findMany({
    select: { name: true }
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-emerald-500/30 font-sans pb-24">
      
      <div className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-[#020617] pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-emerald-300 text-xs font-bold mb-6 backdrop-blur-md shadow-lg shadow-emerald-900/10">
                 <ShoppingBag size={14} /> Code Friend Store
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                 รวมโค้ด และระบบ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500 animate-pulse">ที่สร้างไว้</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                 รวม Source Code, เทมเพลต และระบบต่าง ๆ ที่สร้างและใช้งานจริง <br className="hidden md:block"/> สำหรับคนที่อยากนำไปศึกษา ต่อยอด หรือเริ่มโปรเจกต์ของตัวเอง
            </p>

            <form className="max-w-xl mx-auto relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-full p-2 pl-6 shadow-2xl transition-all focus-within:border-emerald-500/50">
                    <Search className="text-slate-500 mr-2" size={20} />
                    <input 
                        name="q"
                        defaultValue={q}
                        placeholder="ค้นหาสินค้า Source Code, Templates..." 
                        className="w-full bg-transparent border-none outline-none text-white placeholder-slate-500 py-2"
                    />
                    <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-full transition-all ml-2 shadow-lg">
                        <Search size={18} />
                    </button>
                </div>
            </form>
          </div>
      </div>

      <div className="container mx-auto px-4">
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Link href="/store" className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${!category ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20" : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-emerald-500/50"}`}>
                สินค้าทั้งหมด
            </Link>
            {categories.map((c, i) => (
                <Link key={i} href={`/store?category=${c.name}`} className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${category === c.name ? "bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/20" : "bg-slate-900/50 text-slate-400 border-slate-800 hover:text-white hover:border-emerald-500/50"}`}>
                    {c.name}
                </Link>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => {
                const isOwned = purchasedProductIds.has(product.id);

                return (
                <Link 
                    key={product.id} 
                    href={`/store/${product.slug}`} 
                    className={`group bg-slate-900/50 border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col backdrop-blur-sm relative 
                    ${isOwned 
                        ? 'border-blue-500/30 hover:border-blue-500 shadow-blue-900/10' 
                        : 'border-slate-800 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/20'
                    }`}
                >
                    <div className="relative h-56 w-full bg-slate-800 overflow-hidden">
                        {product.image ? (
                            <Image 
                                src={product.image} 
                                alt={product.title} 
                                fill 
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-950">
                                <ShoppingBag size={48} opacity={0.3} />
                            </div>
                        )}
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 pointer-events-none" />

                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                            {isOwned ? (
                                <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
                                    <Check size={10} strokeWidth={4} /> Owned
                                </span>
                            ) : product.isFree || Number(product.price) === 0 ? (
                                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
                                    <Sparkles size={10} /> Free
                                </span>
                            ) : (
                                <span className="bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-700">
                                    ฿{Number(product.price).toLocaleString()}
                                </span>
                            )}
                        </div>
                        
                        <div className="absolute top-3 left-3">
                             <span className="bg-slate-950/80 backdrop-blur text-slate-300 text-[10px] font-bold px-2 py-1 rounded border border-slate-800 flex items-center gap-1">
                                <Tag size={10} /> {product.category?.name || 'General'}
                             </span>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                        <div className="mb-2">
                             <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">
                                {product.title}
                             </h3>
                             <p className="text-slate-400 text-xs mt-1 line-clamp-2 h-8">
                                {product.description || "สินค้าคุณภาพสูงพร้อมใช้งาน"}
                             </p>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-800 flex items-center justify-between">
                            
                            <div className="flex flex-col">
                                {isOwned ? (
                                    <>
                                        <span className="text-[10px] text-blue-400 uppercase font-bold">Status</span>
                                        <span className="font-mono text-lg font-bold text-blue-400 flex items-center gap-1">
                                            Purchased
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold">Price</span>
                                        <span className={`font-mono text-lg font-bold ${product.isFree || Number(product.price) === 0 ? 'text-emerald-400' : 'text-white'}`}>
                                            {product.isFree || Number(product.price) === 0 ? "Free" : `฿${Number(product.price).toLocaleString()}`}
                                        </span>
                                    </>
                                )}
                            </div>
                            
                            <span className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                                isOwned 
                                ? "bg-blue-600 text-white shadow-blue-900/20" 
                                : "bg-slate-800 text-slate-400 group-hover:bg-emerald-600 group-hover:text-white"
                            }`}>
                                {isOwned ? <Download size={18} /> : <ShoppingCart size={18} />}
                            </span>
                        </div>
                    </div>
                </Link>
            )})}
        </div>

        {products.length === 0 && (
            <div className="text-center py-32 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <div className="inline-flex p-4 rounded-full bg-slate-900 border border-slate-700 mb-4">
                    <ShoppingBag className="text-slate-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">ไม่พบสินค้า</h3>
                <p className="text-slate-500 mt-2">ลองเปลี่ยนคำค้นหา หรือกลับมาดูใหม่เร็วๆ นี้</p>
                {q && <Link href="/store" className="inline-block mt-6 text-emerald-400 hover:underline">ดูสินค้าทั้งหมด</Link>}
            </div>
        )}

      </div>
    </div>
  );
}