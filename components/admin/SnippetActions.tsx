"use client";

import { approveSnippet, deleteSnippet } from "@/lib/actions";
import { Check, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Import ของแต่งหล่อ
import toast from "react-hot-toast";
import { confirmSwal } from "@/lib/swal";

export default function SnippetActions({ id, isApproved }: { id: string, isApproved: boolean }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. ฟังก์ชันอนุมัติ (เพิ่ม Toast)
  const handleApprove = async () => {
    setLoading(true);
    try {
        await approveSnippet(id);
        toast.success("✅ อนุมัติ Snippet เรียบร้อย!"); // แจ้งเตือนสีเขียว
        router.refresh();
    } catch (error) {
        toast.error("❌ เกิดข้อผิดพลาดในการอนุมัติ");
    } finally {
        setLoading(false);
    }
  };

  // 2. ฟังก์ชันลบ (เพิ่ม SweetAlert)
  const handleDelete = async () => {
    // ใช้ SweetAlert ถามยืนยันก่อนลบ
    const result = await confirmSwal.fire({
        title: 'ยืนยันการลบ Snippet?',
        text: "โพสต์นี้จะหายไปจากระบบทันที กู้คืนไม่ได้",
        icon: 'warning',
        confirmButtonText: 'ลบทิ้ง',
        confirmButtonClass: 'bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold mx-2 shadow-lg shadow-red-900/20' // ปุ่มสีแดง
    } as any);

    if(!result.isConfirmed) return;

    setLoading(true);
    try {
        await deleteSnippet(id);
        toast.success("🗑️ ลบ Snippet แล้ว");
        router.refresh();
    } catch (error) {
        toast.error("❌ ลบไม่สำเร็จ");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
       {/* ปุ่มอนุมัติ */}
       {!isApproved && (
            <button 
                onClick={handleApprove} 
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-900/20 disabled:opacity-50 transition-all active:scale-95"
            >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Check size={14} />} อนุมัติ
            </button>
       )}
       
       {/* ปุ่มลบ */}
       <button 
            onClick={handleDelete} 
            disabled={loading}
            className="bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700 hover:border-red-500/30 disabled:opacity-50 transition-all active:scale-95"
       >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={14} />} ลบ
       </button>
    </div>
  );
}