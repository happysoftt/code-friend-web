import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Package, Clock, CheckCircle, FileText, ShoppingBag, ArrowRight, ShieldAlert, CreditCard 
} from "lucide-react";
import FreeDownloadButton from "@/components/store/FreeDownloadButton"; 

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  // 1. ดึงข้อมูลคำสั่งซื้อทั้งหมด (เอา filter status ออก เพื่อให้เห็นทุกสถานะ)
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id }, // ✅ ดูของฉันทั้งหมด ไม่เกี่ยงสถานะ
    include: { 
        product: true,
        licenseKeys: true 
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 p-64 bg-indigo-600/5 blur-[150px] rounded-full" />
         <div className="absolute bottom-0 left-0 p-64 bg-purple-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8 border-b border-slate-800 pb-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <ShoppingBag className="text-indigo-500" /> ประวัติการสั่งซื้อ
                </h1>
                <p className="text-slate-400">รายการสินค้าและคอร์สเรียนที่คุณเป็นเจ้าของ ({orders.length} รายการ)</p>
            </div>
            <Link href="/store" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors px-4 py-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                ไปเลือกซื้อสินค้าเพิ่ม <ArrowRight size={16} />
            </Link>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
            {orders.map((order) => (
                <div key={order.id} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all shadow-lg group">
                    <div className="flex flex-col md:flex-row gap-6">
                        
                        {/* Product Image */}
                        <div className="w-full md:w-32 h-32 bg-slate-800 rounded-2xl overflow-hidden relative flex-shrink-0 border border-slate-700 shadow-inner">
                            {order.product.image ? (
                                <Image 
                                    src={order.product.image} 
                                    alt={order.product.title || "Product"} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                    unoptimized
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <Package size={32} />
                                </div>
                            )}
                        </div>

                        {/* Order Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2 gap-4">
                                    <h3 className="text-xl font-bold text-white truncate">{order.product.title}</h3>
                                    
                                    {/* Price Tag */}
                                    {Number(order.total) > 0 ? (
                                        <span className="font-mono font-bold text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700 whitespace-nowrap">
                                            ฿{Number(order.total).toLocaleString()}
                                        </span>
                                    ) : (
                                        <span className="text-emerald-400 font-bold text-xs bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20">FREE</span>
                                    )}
                                </div>

                                <div className="text-slate-500 text-xs space-y-1 mb-4">
                                    <p>Order ID: <span className="font-mono text-slate-400">#{order.id.split('-')[0]}</span></p>
                                    <p>Date: {new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}</p>
                                </div>
                            </div>

                            {/* Status & Actions Area */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 pt-4 border-t border-slate-800/50">
                                
                                {/* 1. Status Badge */}
                                <div>
                                    {order.status === "COMPLETED" && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                            <CheckCircle size={14} /> ชำระเงินเรียบร้อย
                                        </span>
                                    )}
                                    {order.status === "WAITING_VERIFY" && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                                            <Clock size={14} /> รอแอดมินตรวจสอบ
                                        </span>
                                    )}
                                    {order.status === "PENDING" && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-700/50 text-slate-400 border border-slate-600">
                                            <CreditCard size={14} /> รอชำระเงิน
                                        </span>
                                    )}
                                    {order.status === "FAILED" && (
                                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                            <ShieldAlert size={14} /> การชำระเงินล้มเหลว
                                        </span>
                                    )}
                                </div>

                                {/* 2. Action Buttons */}
                                <div className="w-full sm:w-auto">
                                    {order.status === "COMPLETED" ? (
                                        // ✅ ถ้าจ่ายแล้ว -> ปุ่มดาวน์โหลด
                                        <div className="w-full sm:w-100">
                                            <FreeDownloadButton productId={order.product.id} />
                                        </div>
                                    ) : order.status === "WAITING_VERIFY" ? (
                                        // ⏳ ถ้ารอตรวจ -> ข้อความแจ้ง
                                        <p className="text-xs text-yellow-500/80 italic text-center sm:text-right">
                                            กำลังตรวจสอบสลิป...<br/>(ใช้เวลาไม่เกิน 24 ชม.)
                                        </p>
                                    ) : (
                                        // 💳 ถ้ารอจ่าย -> ปุ่มไปจ่ายเงิน
                                        <Link 
                                            href={`/store/checkout/${order.product.id}`}
                                            className="block w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-center rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95"
                                        >
                                            ชำระเงินตอนนี้
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* License Key Section (Only if Completed) */}
                    {order.status === "COMPLETED" && order.licenseKeys.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-800/50 flex items-center gap-3 bg-slate-950/30 p-4 rounded-xl border border-slate-800/50">
                            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                <ShieldAlert size={18} />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">License Key (Copy this)</p>
                                <code className="text-sm text-yellow-100 font-mono block truncate select-all cursor-text bg-yellow-500/5 p-1 rounded">
                                    {order.licenseKeys[0].key}
                                </code>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            {/* Empty State */}
            {orders.length === 0 && (
                <div className="py-24 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                        <ShoppingBag size={40} className="text-slate-600" />
                    </div>
                    <h3 className="text-white font-bold text-2xl mb-2">ยังไม่มีคำสั่งซื้อ</h3>
                    <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">คุณยังไม่ได้ซื้อคอร์สเรียนหรือสินค้าใดๆ ลองเข้าไปดูสินค้าที่น่าสนใจได้เลย</p>
                    <Link href="/store" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/20 hover:scale-105">
                        ไปที่ร้านค้า <ArrowRight size={20} />
                    </Link>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}