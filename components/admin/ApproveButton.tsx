"use client";

import { approveOrder, rejectOrder } from "@/lib/actions";
import { useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";

export default function ApproveButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null); // เช็คว่ากำลังกดปุ่มไหน
  const router = useRouter();

  async function handleApprove() {
    // SweetAlert ถามยืนยัน (สีเขียว)
    const result = await confirmSwal.fire({
        title: 'ยืนยันยอดเงินถูกต้อง?',
        text: "ต้องการอนุมัติคำสั่งซื้อนี้ใช่หรือไม่",
        icon: 'question', // เครื่องหมาย ?
        confirmButtonText: 'อนุมัติเลย',
        // สีเขียวเป็น Default อยู่แล้ว
    } as any);

    if(!result.isConfirmed) return;

    setLoading(true);
    setActionType("approve");
    
    try {
        await approveOrder(orderId);
        toast.success("✅ อนุมัติคำสั่งซื้อเรียบร้อย");
        router.refresh();
    } catch (error) {
        toast.error("❌ เกิดข้อผิดพลาด");
    } finally {
        setLoading(false);
        setActionType(null);
    }
  }

  async function handleReject() {
    // SweetAlert ถามยืนยัน (สีแดง)
    const result = await confirmSwal.fire({
        title: 'ปฏิเสธคำสั่งซื้อ?',
        text: "คำสั่งซื้อจะถูกยกเลิกทันที",
        icon: 'warning', // เครื่องหมายตกใจ
        confirmButtonText: 'ปฏิเสธ/ยกเลิก',
        confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20' // ปุ่มแดง
    } as any);

    if(!result.isConfirmed) return;

    setLoading(true);
    setActionType("reject");

    try {
        await rejectOrder(orderId);
        toast.success("🗑️ ปฏิเสธคำสั่งซื้อแล้ว");
        router.refresh();
    } catch (error) {
        toast.error("❌ เกิดข้อผิดพลาด");
    } finally {
        setLoading(false);
        setActionType(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* ปุ่มปฏิเสธ (สีแดง) */}
      <button 
        onClick={handleReject}
        disabled={loading}
        className="p-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all border border-transparent hover:border-red-500/30 disabled:opacity-50 active:scale-95" 
        title="ปฏิเสธ"
      >
        {loading && actionType === "reject" ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
      </button>

      {/* ปุ่มอนุมัติ (สีเขียว Emerald) */}
      <button 
        onClick={handleApprove}
        disabled={loading}
        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-900/20 active:scale-95 transition-all disabled:opacity-50"
      >
        {loading && actionType === "approve" ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
        <span>อนุมัติ</span>
      </button>
    </div>
  );
}