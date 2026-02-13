import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Check, Share2, ShieldCheck, Download, Package, Star, Zap, LockOpen, Eye } from "lucide-react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ViewCounter from "@/components/store/ViewCounter"; 

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const product = await prisma.product.findUnique({ where: { slug }, select: { title: true, description: true } });
    return {
        title: product?.title || "Product Details",
        description: product?.description?.slice(0, 150) || "รายละเอียดสินค้าคุณภาพจาก Code Friend Store",
    };
}

export default async function StoreProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // 1. ค้นหาสินค้า
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) return notFound();

  // 2. เช็คความเป็นเจ้าของ
  const session = await getServerSession(authOptions);
  let isOwned = false;

  if (session) {
      const order = await prisma.order.findFirst({
          where: {
              userId: session.user.id,
              productId: product.id,
              status: "COMPLETED" // ต้องจ่ายเงินแล้วเท่านั้น
          }
      });
      if (order) isOwned = true;
  }

  // 3. กำหนดสิทธิ์ดาวน์โหลด (เจ้าของ หรือ ของฟรี)
  const canDownload = isOwned || product.isFree;

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-emerald-500/30 font-sans relative overflow-hidden">
      
      {/* ✅ ใส่ ViewCounter เพื่อนับยอดวิว (Client Component) */}
      <ViewCounter productId={product.id} />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 p-96 bg-emerald-600/5 blur-[150px] rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 p-64 bg-blue-600/5 blur-[150px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Back Button */}
        <Link href="/store" className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            กลับไปหน้าร้านค้า
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            
            {/* --- LEFT: PRODUCT IMAGE --- */}
            <div className="space-y-6">
                <div className={`relative aspect-square w-full bg-slate-900/50 rounded-3xl overflow-hidden border shadow-2xl group transition-all ${isOwned ? 'border-blue-500/30 shadow-blue-900/20' : 'border-slate-800'}`}>
                    {product.image ? (
                        <Image 
                            src={product.image} 
                            alt={product.title} 
                            fill 
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                            <Package size={64} strokeWidth={1} />
                            <p className="mt-4 text-sm font-medium">No Preview Available</p>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 via-transparent to-transparent opacity-60 pointer-events-none" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {isOwned ? (
                            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 w-fit animate-in fade-in zoom-in">
                                <Check size={14} strokeWidth={3} /> You Own This
                            </span>
                        ) : product.isFree ? (
                            <span className="bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 w-fit">
                                <Zap size={14} fill="currentColor" /> Free Item
                            </span>
                        ) : (
                            <span className="bg-slate-900/90 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 w-fit shadow-lg">
                                Premium Product
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Feature Icons */}
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: "Instant Delivery", icon: Zap },
                        { label: "Secure Payment", icon: ShieldCheck },
                        { label: "Quality Code", icon: Star },
                    ].map((feat, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 text-center flex flex-col items-center justify-center gap-2 hover:border-emerald-500/30 transition-colors">
                            <feat.icon className="text-emerald-500" size={20} />
                            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{feat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- RIGHT: PRODUCT DETAILS --- */}
            <div className="flex flex-col">
                <div className="mb-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tight">
                        {product.title}
                    </h1>
                    
                    {/* ✅ ส่วนแสดงยอดวิวและยอดดาวน์โหลด */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                        <span className="bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-400" /> Verified
                        </span>
                        
                        <div className="flex items-center gap-3 pl-2 border-l border-slate-700">
                            <span className="flex items-center gap-1 text-slate-300">
                                <Eye size={14} className="text-blue-400" /> {(product.viewCount || 0).toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1 text-slate-300">
                                <Download size={14} className="text-emerald-400" /> {(product.downloadCount || 0).toLocaleString()} downloads
                            </span>
                        </div>
                    </div>
                </div>

                <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed mb-8">
                    <p>{product.description || "สัมผัสประสบการณ์การพัฒนาที่เหนือกว่าด้วย Source Code คุณภาพสูง"}</p>
                </div>

                {/* Features List */}
                <div className="mb-10 space-y-3 p-6 bg-slate-900/30 rounded-2xl border border-slate-800/50">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2 mb-4">
                        <Star size={18} className="text-yellow-500 fill-yellow-500" /> สิ่งที่คุณจะได้รับ
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["Full Source Code", "Responsive Design", "Easy Customization", "Lifetime Updates"].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                                <Check size={16} className="text-emerald-500" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* --- ACTION AREA (Bottom) --- */}
                <div className="mt-auto pt-8 border-t border-slate-800/50">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            {isOwned ? (
                                <>
                                    <p className="text-sm text-blue-400 font-bold uppercase tracking-wider mb-1">สถานะ</p>
                                    <div className="text-4xl font-black text-blue-500 font-mono tracking-tighter flex items-center gap-2">
                                        <LockOpen size={32} /> Purchased
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">ราคา</p>
                                    <div className={`text-5xl font-black font-mono tracking-tighter ${product.isFree ? 'text-emerald-400' : 'text-white'}`}>
                                        {product.isFree ? "Free" : `฿${Number(product.price).toLocaleString()}`}
                                    </div>
                                </>
                            )}
                        </div>
                        
                        {!isOwned && !product.isFree && (
                            <div className="text-right">
                                <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">จ่ายครั้งเดียว / ตลอดชีพ</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {canDownload ? (
                            // ✅ ใช้ Link ชี้ไปที่ API Gatekeeper (/api/download/[id])
                            // เพื่อให้ Server เป็นคนเช็คสิทธิ์และนับยอดดาวน์โหลด
                            <a 
                                href={`/api/download/${product.id}`} 
                                // target="_blank" // ใส่ถ้าอยากให้เปิดแท็บใหม่
                                className={`flex-1 py-4 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 group 
                                ${isOwned 
                                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-900/20" 
                                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20"
                                }`}
                            >
                                <Download size={20} className="group-hover:animate-bounce" /> 
                                {isOwned ? "ดาวน์โหลดสินค้า" : "ดาวน์โหลดฟรี"}
                            </a>
                        ) : (
                            // 🛒 ปุ่มซื้อสินค้า
                            <Link
                                href={`/store/checkout/${product.id}`}
                                className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <ShoppingCart size={20} /> ซื้อสินค้าทันที
                            </Link>
                        )}
                        
                        <button className="sm:w-auto w-full px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-700">
                            <Share2 size={20} />
                        </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 mt-4 text-center sm:text-left flex items-center justify-center sm:justify-start gap-1">
                        <ShieldCheck size={12} /> Secure Checkout via PromptPay / Stripe • การันตีความพึงพอใจ
                    </p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}