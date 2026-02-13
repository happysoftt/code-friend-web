"use client";

import { useState, useRef } from "react";
import { CreditCard, QrCode, Loader2, UploadCloud, X, FileImage } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import PromptPayQRCode from "@/components/checkout/PromptPayQRCode";
import toast from "react-hot-toast";

interface PaymentFormProps {
  productId: string;
  price: number;
  promptpayId?: string;
  promptpayName?: string;
}

export default function PaymentForm({ productId, price, promptpayId, promptpayName }: PaymentFormProps) {
  const [method, setMethod] = useState<"card" | "promptpay">("promptpay");
  const [loading, setLoading] = useState(false);
  const [slipImage, setSlipImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์มีขนาดใหญ่เกินไป (ไม่เกิน 5MB)");
        return;
      }
      setSlipImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setSlipImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmPayment = async () => {
    // 1. เช็คสลิป
    if (!slipImage) {
        toast.error("กรุณาแนบสลิปการโอนเงินก่อนแจ้งชำระเงิน", {
            style: { background: '#333', color: '#fff' },
            icon: '🧾'
        });
        return;
    }

    setLoading(true);

    try {
        // ✅ 2. เตรียมข้อมูลจริง
        const formData = new FormData();
        formData.append("slip", slipImage);     // ไฟล์รูป
        formData.append("productId", productId); // รหัสสินค้า
        formData.append("price", price.toString()); // ราคา

        // ✅ 3. ส่งไปหา API จริง (/api/slip)
        const res = await fetch("/api/slip", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "เกิดข้อผิดพลาด");

        // 4. สำเร็จ
        toast.success("แจ้งชำระเงินเรียบร้อย! รอการตรวจสอบ", {
            duration: 4000,
            style: { background: '#333', color: '#fff' }
        });
        
        router.push("/orders"); // ไปหน้า Order
        router.refresh();       // รีเฟรชข้อมูล

    } catch (error: any) {
        console.error(error);
        toast.error(error.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* เลือกช่องทางชำระเงิน */}
      <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setMethod("promptpay")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${method === "promptpay" ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700" : "text-slate-500 hover:text-slate-300"}`}
          >
              <QrCode size={18} /> QR พร้อมเพย์
          </button>
          <button 
            onClick={() => setMethod("card")}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${method === "card" ? "bg-slate-800 text-white shadow-sm ring-1 ring-slate-700" : "text-slate-500 hover:text-slate-300"}`}
          >
              <CreditCard size={18} /> บัตรเครดิต
          </button>
      </div>

      <div className="min-h-[300px]">
          {method === "promptpay" ? (
             <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                
                {/* QR Code Section */}
                <div className="text-center space-y-4">
                    <div className="bg-white p-4 rounded-2xl mx-auto w-fit shadow-lg border border-slate-200">
                        <PromptPayQRCode promptpayId={promptpayId || ""} amount={price} />
                    </div>
                    <div className="text-sm text-slate-400">
                        โอนเข้าบัญชี: <span className="text-white font-bold">{promptpayName || "ไม่ระบุ"}</span>
                    </div>
                </div>

                {/* Upload Slip Section */}
                <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        <FileImage size={16} className="text-emerald-400" /> แนบสลิปการโอนเงิน (บังคับ)
                    </p>
                    
                    {!previewUrl ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
                        >
                            <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud size={24} className="text-slate-400 group-hover:text-emerald-400" />
                            </div>
                            <p className="text-sm text-slate-300 font-medium">คลิกเพื่ออัปโหลดสลิป</p>
                            <p className="text-xs text-slate-500 mt-1">รองรับไฟล์ JPG, PNG (ไม่เกิน 5MB)</p>
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-slate-700 group">
                            <img src={previewUrl} alt="Slip Preview" className="w-full h-auto max-h-[300px] object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-colors"
                            >
                                <X size={16} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 text-center text-xs text-white backdrop-blur-sm">
                                {slipImage?.name}
                            </div>
                        </div>
                    )}
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                {/* Submit Button */}
                <button 
                    onClick={handleConfirmPayment}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                        slipImage 
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-95" 
                        : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-70"
                    }`}
                >
                    {loading ? <Loader2 className="animate-spin" /> : "แจ้งโอนเงิน / ยืนยัน"}
                </button>
             </div>
          ) : (
             <div className="space-y-4 text-center py-10 animate-in fade-in zoom-in duration-300">
                 <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500 mb-4 border border-slate-700">
                    <CreditCard size={32} />
                 </div>
                 <h3 className="text-white font-bold">ระบบบัตรเครดิต</h3>
                 <p className="text-slate-500 text-sm max-w-[200px] mx-auto">ยังไม่เปิดให้บริการในขณะนี้ กรุณาชำระผ่าน QR Code</p>
             </div>
          )}
      </div>

    </div>
  );
}