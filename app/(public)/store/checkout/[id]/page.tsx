import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, CreditCard, Lock, Gift } from "lucide-react";
import PaymentForm from "@/components/store/PaymentForm";
import { Metadata } from "next";

// ✅ 1. Import สิ่งที่ต้องใช้เพิ่ม
import { getSystemConfig } from "@/lib/actions"; 
import FreeDownloadButton from "@/components/store/FreeDownloadButton"; 

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, select: { title: true } });
    return { title: product ? `Checkout: ${product.title}` : "Checkout" };
}

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // ✅ 2. ดึงข้อมูลสินค้า และ Config (PromptPay) พร้อมกัน
  const [product, config] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getSystemConfig()
  ]);

  if (!product) return notFound();

  // --- กรณีสินค้าฟรี (Special View) ---
  if (product.isFree || product.price === 0) {
      return (
          <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 selection:bg-green-500/30 font-sans relative overflow-hidden">
              {/* Background Glows */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-500/20 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 text-center relative z-10 shadow-2xl">
                  <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20 animate-pulse">
                      <Gift size={40} className="text-green-400" />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2">สินค้านี้แจกฟรี!</h1>
                  <p className="text-slate-400 mb-8 leading-relaxed">
                      คุณสามารถดาวน์โหลด <strong>{product.title}</strong> ได้ทันทีโดยไม่มีค่าใช้จ่าย
                  </p>
                  
                  {/* ✅ 3. ใช้ปุ่ม Client Component (แก้ปัญหา onClick Error) */}
                  <FreeDownloadButton productId={product.id} />
                  
                  <Link href="/store" className="text-slate-500 hover:text-white text-sm transition-colors mt-4 inline-block">
                      กลับไปหน้าร้านค้า
                  </Link>
              </div>
          </div>
      );
  }

  // --- หน้า Checkout ปกติ (สำหรับสินค้ามีราคา) ---
  return (
    <div className="min-h-screen bg-[#020617] text-white py-12 selection:bg-emerald-500/30 font-sans relative">
      
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 p-64 bg-blue-600/5 blur-[150px] rounded-full" />
          <div className="absolute bottom-0 right-0 p-64 bg-emerald-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Back Button */}
        <Link href={`/store/${product.slug}`} className="inline-flex items-center text-slate-400 hover:text-white mb-8 text-sm transition-colors group">
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            ยกเลิกและกลับไป
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            
            {/* --- LEFT: ORDER SUMMARY (7/12) --- */}
            <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <Lock className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">ยืนยันการสั่งซื้อ</h1>
                        <p className="text-slate-400 text-sm">ตรวจสอบรายการและชำระเงิน</p>
                    </div>
                </div>

                {/* Product Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-3xl p-6 flex gap-6 items-start shadow-xl">
                    <div className="relative w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-700 shadow-inner">
                        {product.image ? (
                            <Image src={product.image} alt={product.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600">No Image</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 py-1">
                        <h3 className="text-xl font-bold text-white mb-2 leading-tight">{product.title}</h3>
                        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-3">{product.description}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700 uppercase tracking-wider">Digital Product</span>
                        </div>
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl p-6 space-y-4">
                    <div className="flex justify-between text-slate-400">
                        <span>มูลค่าสินค้า</span>
                        <span className="font-mono">฿{Number(product.price).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>ค่าธรรมเนียมธุรกรรม</span>
                        <span className="text-emerald-400 font-mono">ฟรี</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                        <span>ภาษีมูลค่าเพิ่ม (VAT)</span>
                        <span className="font-mono">รวมในราคาขาย</span>
                    </div>
                    
                    <div className="border-t border-slate-800 my-4"></div>
                    
                    <div className="flex justify-between items-end">
                        <span className="text-white font-bold text-lg">ยอดชำระสุทธิ</span>
                        <div className="text-right">
                            <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">฿{Number(product.price).toLocaleString()}</span>
                            <p className="text-[10px] text-slate-500 mt-1">ชำระครั้งเดียว ไม่มีค่าใช้จ่ายเพิ่มเติม</p>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="flex gap-4 items-center bg-emerald-900/10 border border-emerald-500/10 p-4 rounded-2xl">
                    <ShieldCheck size={32} className="text-emerald-500 flex-shrink-0" />
                    <div>
                        <p className="text-emerald-400 font-bold text-sm mb-0.5">Secure Checkout</p>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            ข้อมูลการชำระเงินของคุณถูกเข้ารหัสด้วยมาตรฐานความปลอดภัยระดับสากล (SSL 256-bit) 
                            รับประกันความปลอดภัย 100%
                        </p>
                    </div>
                </div>
            </div>

            {/* --- RIGHT: PAYMENT FORM (5/12) --- */}
            <div className="lg:col-span-5">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl sticky top-24">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-blue-400" /> เลือกช่องทางชำระเงิน
                    </h2>
                    
                    {/* ✅ 4. ส่ง Config ไปให้ PaymentForm */}
                    <PaymentForm 
                        productId={product.id} 
                        price={Number(product.price)} 
                        promptpayId={config.promptpayId || ""}
                        promptpayName={config.promptpayName || ""}
                    />
                    
                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-600">
                            By clicking Pay Now, you agree to our <span className="underline cursor-pointer hover:text-slate-400">Terms of Service</span>.
                        </p>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}