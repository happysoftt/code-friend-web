"use client";

import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";
import { updateOrderStatus } from "@/lib/actions";
import { useRouter } from "next/navigation";

export default function OrderActions({ orderId, status }: { orderId: string, status: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdateStatus = async (newStatus: string) => {
    const isApprove = newStatus === "COMPLETED";
    
    // ตั้งค่าข้อความและสีปุ่ม
    const swalConfig = isApprove ? {
        title: "ยืนยันยอดเงินถูกต้อง?",
        text: "ต้องการอนุมัติคำสั่งซื้อนี้ใช่หรือไม่",
        icon: 'question',
        confirmButtonText: "อนุมัติเลย",
        // สีเขียวเป็น Default ใน lib/swal.ts อยู่แล้ว ไม่ต้องแก้
    } : {
        title: "ยกเลิกคำสั่งซื้อนี้?",
        text: "คำสั่งซื้อจะถูกยกเลิกทันที และไม่สามารถกู้คืนได้",
        icon: 'warning',
        confirmButtonText: "ยกเลิกออเดอร์",
        // 🔴 บังคับเปลี่ยนสีปุ่มเป็นสีแดง
        customClass: {
            confirmButton: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20'
        }
    };

    // 🔥 เรียกใช้ SweetAlert
    const result = await confirmSwal.fire(swalConfig as any);

    if (!result.isConfirmed) return;

    setLoading(true);
    const res = await updateOrderStatus(orderId, newStatus); 
    setLoading(false);

    if (res?.success) {
      toast.success(isApprove ? "✅ อนุมัติเรียบร้อย" : "🗑️ ยกเลิกเรียบร้อย");
      router.refresh();
    } else {
      toast.error("❌ เกิดข้อผิดพลาด");
    }
  };

  // ถ้าสถานะจบไปแล้ว ไม่ต้องโชว์ปุ่ม
  if (status === "COMPLETED" || status === "CANCELLED" || status === "FAILED") {
    return (
        <span className={`text-xs px-3 py-1 rounded-full border ${
            status === 'COMPLETED' 
            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
            : 'bg-slate-800 text-slate-500 border-slate-700'
        }`}>
            {status === 'COMPLETED' ? 'ดำเนินการแล้ว' : 'ปิดการขายแล้ว'}
        </span>
    );
  }

  return (
    <div className="flex gap-2 justify-end">
      {/* ปุ่มยกเลิก */}
      <button 
        onClick={() => handleUpdateStatus("CANCELLED")}
        disabled={loading}
        className="p-2 rounded-lg bg-slate-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 border border-slate-700 transition-all active:scale-95"
        title="ยกเลิกออเดอร์"
      >
        <X size={16} />
      </button>

      {/* ปุ่มอนุมัติ */}
      <button 
        onClick={() => handleUpdateStatus("COMPLETED")}
        disabled={loading}
        className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
        title="อนุมัติยอดเงิน"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
      </button>
    </div>
  );
}